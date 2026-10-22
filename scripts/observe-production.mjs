#!/usr/bin/env node
// Read-only public delivery witness for the original 561.group site.
// A successful HTTP probe is NOT an authenticated Cloudflare deployment receipt,
// an accepted human journey, or proof that the current source was published.
import { createHash } from 'node:crypto';
import { appendFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const ORIGIN = 'https://561.group';
const MAX_BYTES = 2 * 1024 * 1024;
const EXACT_SHA = /^[a-f\d]{40}$/i;
const SIMPLE_CHECKS = Object.freeze([
  { name: 'homepage', path: '/', accept: 'text/html', type: 'html', required: true },
  { name: 'contact', path: '/contact/', accept: 'text/html', type: 'html', required: true },
  { name: 'estate', path: '/estate.json', accept: 'application/json', type: 'estate', required: true },
  { name: 'agent-discovery', path: '/llms.txt', accept: 'text/plain', type: 'plain', required: true },
  { name: 'crawl-policy', path: '/robots.txt', accept: 'text/plain', type: 'robots', required: true },
  { name: 'sitemap', path: '/sitemap.xml', accept: 'application/xml', type: 'sitemap', required: true },
  { name: 'security-contact', path: '/.well-known/security.txt', accept: 'text/plain', type: 'plain', required: false },
]);

async function limitedBytes(response) {
  const length = Number(response.headers.get('content-length'));
  if (Number.isFinite(length) && length > MAX_BYTES) throw new RangeError('body too large');
  const reader = response.body?.getReader();
  if (!reader) return new Uint8Array(0);
  const parts = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) throw new RangeError('body too large');
      parts.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) { result.set(part, offset); offset += part.byteLength; }
  return result;
}

async function observe(url, accept, fetchImpl, timeoutMs) {
  try {
    const response = await fetchImpl(url, {
      method: 'GET', redirect: 'manual', cache: 'no-store',
      headers: { accept, 'cache-control': 'no-cache', 'user-agent': '561-group-public-delivery-witness/1' },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const bytes = await limitedBytes(response);
    return {
      status: response.status,
      contentType: response.headers.get('content-type') ?? '',
      location: response.headers.get('location') ?? '',
      nosniff: response.headers.get('x-content-type-options') === 'nosniff',
      hsts: Boolean(response.headers.get('strict-transport-security')),
      contentSha256: createHash('sha256').update(bytes).digest('hex'),
      bytes: bytes.byteLength,
      body: new TextDecoder().decode(bytes),
    };
  } catch (error) {
    // A probe failure is coverage uncertainty, not evidence that the site is down.
    return { unknown: true, errorKind: error?.name === 'TimeoutError' ? 'timeout' : error instanceof RangeError ? 'body-limit' : 'transport' };
  }
}

function evaluateSimple(def, sample) {
  const common = { name: def.name, url: `${ORIGIN}${def.path}`, required: def.required };
  if (sample.unknown) return { ...common, outcome: 'unknown', reason: sample.errorKind };
  const result = { ...common, httpStatus: sample.status, bytes: sample.bytes,
    contentSha256: sample.contentSha256, contentType: sample.contentType };
  if (sample.status !== 200) return { ...result, outcome: !def.required && sample.status === 404 ? 'not-published' : 'fail', reason: `http-${sample.status}` };
  if (sample.bytes === 0) return { ...result, outcome: 'fail', reason: 'empty-resource' };
  const media = sample.contentType.toLowerCase();
  if (def.type === 'html' && !media.includes('text/html')) return { ...result, outcome: 'fail', reason: 'wrong-media-type' };
  if (def.type === 'estate') {
    if (!media.includes('application/json')) return { ...result, outcome: 'fail', reason: 'wrong-media-type' };
    let estate;
    try { estate = JSON.parse(sample.body); } catch { return { ...result, outcome: 'fail', reason: 'invalid-json' }; }
    if (!estate || !Array.isArray(estate.nodes) || !estate.nodes.length ||
        typeof estate.revision !== 'string' || !estate.revision ||
        estate.nodes.some(n => !['true', 'false', 'both', 'neither'].includes(n.told))) {
      return { ...result, outcome: 'fail', reason: 'invalid-estate-contract' };
    }
    result.estateNodes = estate.nodes.length;
    result.estateRevision = estate.revision;
  }
  if (def.type === 'robots' && !/user-agent\s*:/iu.test(sample.body))
    return { ...result, outcome: 'fail', reason: 'invalid-robots-contract' };
  if (def.type === 'sitemap' && !/<(?:urlset|sitemapindex)(?:\s|>)/iu.test(sample.body))
    return { ...result, outcome: 'fail', reason: 'invalid-sitemap-contract' };
  if (def.type === 'plain' && !media.includes('text/plain'))
    return { ...result, outcome: 'fail', reason: 'wrong-media-type' };
  if (['homepage', 'contact'].includes(def.name) && (!sample.nosniff || !sample.hsts))
    return { ...result, outcome: 'fail', reason: 'missing-security-headers', nosniff: sample.nosniff, hsts: sample.hsts };
  return { ...result, outcome: 'pass' };
}

function evaluateAlias(sample) {
  const name = 'www-canonical-redirect';
  const url = 'https://www.561.group/contact/?witness=1';
  const expected = 'https://561.group/contact/?witness=1';
  if (sample.unknown) return { name, url, required: true, outcome: 'unknown', reason: sample.errorKind };
  const result = { name, url, required: true, httpStatus: sample.status, location: sample.location };
  return sample.status === 301 && sample.location === expected
    ? { ...result, outcome: 'pass' }
    : { ...result, outcome: 'fail', reason: 'unexpected-canonical-redirect' };
}

function evaluateRevision(sample, expectedSourceSha) {
  const result = { name: 'source-revision-claim', url: `${ORIGIN}/source-revision.json`, required: Boolean(expectedSourceSha) };
  if (sample.unknown) return { ...result, outcome: 'unknown', reason: sample.errorKind };
  if (sample.status === 404) return { ...result, httpStatus: 404, outcome: expectedSourceSha ? 'fail' : 'not-published',
    reason: 'no-public-revision-receipt' };
  if (sample.status !== 200) return { ...result, httpStatus: sample.status, outcome: 'fail', reason: 'unexpected-revision-response' };
  let claim;
  try { claim = JSON.parse(sample.body); } catch { return { ...result, httpStatus: 200, outcome: 'fail', reason: 'invalid-revision-json' }; }
  if (claim?.repository !== '561-group/561.group' || claim?.origin !== ORIGIN || !EXACT_SHA.test(claim?.sourceCommit ?? '') ||
      claim?.renderer !== 'TUFTE' || claim?.application !== 'LivingWebServer')
    return { ...result, httpStatus: 200, outcome: 'fail', reason: 'unexpected-revision-claim' };
  const resultClaim = { ...result, httpStatus: 200, claimedSourceCommit: claim.sourceCommit, outcome: 'pass',
    qualification: 'public-self-description-only; not provider-native receipt' };
  if (expectedSourceSha && claim.sourceCommit.toLowerCase() !== expectedSourceSha.toLowerCase())
    return { ...resultClaim, outcome: 'fail', reason: 'does-not-match-expected-source' };
  return resultClaim;
}

/**
 * Public, non-privileged evidence. Does not assert active Cloudflare version,
 * correctness of self-reported revision, acceptance, or satisfaction of Work.
 * expectedSourceSha is an independently selected release input, never guessed
 * from the current repository's default branch.
 */
export async function observeProduction({ fetchImpl = fetch, expectedSourceSha = null,
  timeoutMs = 10000, now = () => new Date().toISOString() } = {}) {
  if (expectedSourceSha !== null && !EXACT_SHA.test(expectedSourceSha))
    throw new TypeError('expected source must be a 40-character hexadecimal commit');
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 500 || timeoutMs > 60000)
    throw new RangeError('timeout must be between 500 and 60000ms');
  const [simple, alias, revision] = await Promise.all([
    Promise.all(SIMPLE_CHECKS.map(async def => evaluateSimple(def,
      await observe(`${ORIGIN}${def.path}`, def.accept, fetchImpl, timeoutMs)))),
    observe('https://www.561.group/contact/?witness=1', 'text/html', fetchImpl, timeoutMs),
    observe(`${ORIGIN}/source-revision.json`, 'application/json', fetchImpl, timeoutMs),
  ]);
  const checks = [...simple, evaluateAlias(alias), evaluateRevision(revision, expectedSourceSha)];
  const requiredChecks = checks.filter(check => check.required);
  const passed = requiredChecks.every(check => check.outcome === 'pass') && !checks.some(check => check.outcome === 'fail');
  const uncertain = requiredChecks.some(check => check.outcome === 'unknown');
  return {
    schema: '561.group.public-delivery-observation/v1',
    observedAt: now(), origin: ORIGIN, observerKind: 'read-only-external-http',
    selectedReleaseSource: expectedSourceSha, sourceSelection: expectedSourceSha ? 'operator-supplied' : 'not-selected',
    overall: passed ? 'public-checks-passed' : uncertain ? 'receiving-incomplete' : 'public-checks-failed',
    providerDeploymentVerified: false, independentHumanAcceptance: false,
    checks,
  };
}

export function markdownSummary(result) {
  const escape = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
  return [
    `### 561.group public delivery observation: ${result.overall}`,
    '', `Observed: ${result.observedAt}; selected release source: ${result.selectedReleaseSource ?? 'none'}.`,
    'Provider-native deployment and independent human acceptance are **not** established by these HTTP checks.',
    '', '| Check | Outcome | HTTP | Notes |', '|---|---|---:|---|',
    ...result.checks.map(c => `| ${escape(c.name)} | ${escape(c.outcome)} | ${c.httpStatus ?? '—'} | ${escape(c.reason ?? (c.claimedSourceCommit ?? ''))} |`),
  ].join('\n') + '\n';
}

async function main() {
  const sha = process.env.EXPECTED_SOURCE_SHA || null;
  const result = await observeProduction({ expectedSourceSha: sha });
  await mkdir('observations', { recursive: true });
  await writeFile('observations/561.group-public-delivery.json', JSON.stringify(result, null, 2) + '\n');
  console.log(markdownSummary(result));
  console.log(JSON.stringify({ overall: result.overall, providerDeploymentVerified: false, sourceClaim: result.checks.at(-1).outcome }));
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, markdownSummary(result));
  if (result.overall !== 'public-checks-passed') process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
