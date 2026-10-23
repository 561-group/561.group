# 561.group

The original public site of the **561 Group** at **https://561.group/** is served from this repository's `main` through the existing Cloudflare Worker `561-group-site`. It is one genuine TUFTE + LivingWebServer application, not a separate static marketing site.

## Jobs the site should make easy

| Visitor goal | Real entry |
|---|---|
| Bring research, software, AI operations or governance work | [/work/](https://561.group/work/) → [/contact/#work](https://561.group/contact/#work) |
| Explore actual projects, games, worlds and publications | [/projects/](https://561.group/projects/) |
| Distinguish Shop, Bazaar and Market before buying | [/projects/#trade](https://561.group/projects/#trade) |
| Understand accountability and working philosophy | [/about/](https://561.group/about/) |
| Discover public machine interfaces and rights boundaries | [/for-agents/](https://561.group/for-agents/) |
| Submit a human inquiry, supplier offer or public report | [/contact/](https://561.group/contact/) |

Service areas are invitations to scope an actual job—not standing quotes, accepted orders, completed customer outcomes or proof of a scientific result. Public discovery never authorizes software to buy, publish or execute private operations. The recurring sustaining-support checkout is a separate subscription.

## Original sources → one public site

- `data/home.json` owns organization identity, founding, companies, program, authored material-world position, current public support terms and selected featured project identities.
- `data/estate.json` owns projects, published entry URLs and machine interfaces. Do not copy or invent a second project inventory.
- `data/frontdoor.json` is a typed public communication record for visitor journeys and service areas. Its provider IDs must resolve to the original four company records. It is not a new office, order book, rights grant, product or sales ledger.
- `src/home-tufte.mjs` projects those exact sources into meaningful page-specific TUFTE models and validates cross-source IDs, safe URLs and content. Agents receive those same models as JSON.
- `src/public-home-style.mjs` is the narrow/mobile, keyboard-accessible, reduced-motion and print-friendly local style, injected through TUFTE's document head. It is not a second HTML renderer.
- `src/living-home.mjs` defines the one LivingWebServer application with only five explicit authorized public HTML/JSON GET/HEAD routes.
- `src/worker.mjs` retains the original Cloudflare host, contact, locale fallback pages, live estate, source receipt and separately provisioned ActivityPub provider. The new site does not create a second listener, wallet, service actor or private inbox.
- `src/render.mjs` and `scripts/build.mjs` continue the original localized fallback, source-generated feeds, agent guide, sitemap and source-qualified artifact hashes.

**Language disclosure:** English homepage and work/project/about/agent pages use TUFTE. The separately authored Mandarin and Lakota homepage fallbacks remain the original static renderer; translations of the new pages are not claimed.

## Build, run, verify

Use Node 24 or newer and the exact committed lockfile with the original scoped registry.

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run check
npm test
npm run build
npm run dev
```

The native test suite exercises the original TUFTE/LivingWebServer HTML, JSON and HEAD representations; human pathways, real company and project references; honest service scopes; Worker route and ActivityPub body boundaries; source-generated language, agent and sitemap artifacts. Source CI also performs a genuine Wrangler Worker **dry run**, never a PR-to-production deployment.

The original serialized production workflow accepts a successful exact-main qualification (or an expressly selected main release), rechecks the frozen dependencies and original build, deploys the configured Cloudflare Worker, and separately reads the live source revision, HTML, JSON, generated-asset SHA-256 digests and Cloudflare active Worker version. The Group must not confuse a green PR, an HTTP response, a deploy, and a customer-received useful result.

Follow the original receiving [issue #17](https://github.com/561-group/561.group/issues/17) for genuine user, accessibility, commerce and content outcomes. Improve the real pages, not just the CI machinery.
