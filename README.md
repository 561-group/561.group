# 561.group

<!-- 561-group-standards:badges:start -->
[![561 Group](https://img.shields.io/badge/561%20Group-561%20Group-1c282a)](https://github.com/561-group)
[![License: 561 Group 1.0](https://img.shields.io/badge/license-561%20Group%201.0-1c282a)](LICENSE)
<!-- 561-group-standards:badges:end -->

The Group's public face is owned by **`@561-group/561.group`** and hosted by the existing Cloudflare Worker on `561.group`. The homepage's proposed source path consumes **LivingWebServer's Fetch-only application and TUFTE renderer** over the original `data/home.json` and `data/estate.json` resources. The Worker retains `www` redirection, `/estate.json`, static contact/discovery resources and the original ActivityPub fallback. This is a source integration until installed, deployed and independently read at the public origin.

## Single apex publication and release identity

- `src/home-tufte.mjs` projects the accepted reader-first public introduction and five original featured estate entries into one small TUFTE model. It does **not** copy the 33-game directory, enterprise archive, proofs or old framework glossary into the opening page.
- `src/living-home.mjs` is the one `561.group` application using the **existing** `@red-cup-engineering/living-web-server/fetch` capability. It admits only this Group's public home source, through the original server's per-request rights and HTML/JSON negotiation. No new generic listener, host, funds database or off-site contents source exists here.
- `src/worker.mjs` routes English `/` GET/HEAD through that application; its existing locale redirect, localized static paths, `/estate.json`, confidential contact and ActivityPub provider routing remain as authored. Extending TUFTE to all locale routes and retiring the old static homepage generator must occur with equivalent translations and consumer readback; do not falsely describe those paths as converted now.
- `scripts/build.mjs` emits `public/source-revision.json` **only when an exact `GITHUB_SHA` is supplied**. It records the checkout commit, not a fabricated successful deployment. An accepted release compares that revision against the independently served `https://561.group/source-revision.json`.
- `.github/workflows/deploy.yml` admits only an explicit main-branch release with a genuine dependency lock, native tests and the exact built source revision before invoking the existing Worker deployment. Its post-release check reads TUFTE, JSON, contact and estate responses. The current standalone checkout has no committed release lock or received provider deployment: a source-only merge is **not** a production release.

**Normal Work rule:** keep site changes in branches until a qualified source-to-public publication is ready; report any divergence between the current `main` and the actual served commit in the original [site receiving issue #17](https://github.com/561-group/561.group/issues/17). Do not make `main`'s source history, a GitHub Actions success, or a Stripe product standing in for a public-page readback or a customer.

## Layout

- `data/home.json` holds the words: the description (keep it verbatim), the intended-design sentence with its glossed notes, the doctrine, and the four told values.
- `data/estate.json` holds the public nodes. It lists the groups, the doors (featured nodes), the nodes themselves, and the machine endpoints listed for agents.
- `src/render.mjs` is a pure renderer from those two files to `index.html`, `llms.txt`, `llms-full.txt`, `humans.txt`, `robots.txt` and `sitemap.xml`.
- `scripts/build.mjs` checks the data and writes those files into `public/`. They are gitignored.
- `src/worker.mjs` serves `public/` through the `ASSETS` binding and adds security headers on every response.
- `public/contact/index.html` retains the original structured public issue and confidential email preparation routes. It preserves full sender text for review, including a long-message copy path. The existing receiving mailbox is a required contact route; no personal profile is listed.
- `public/fonts/` holds Space Grotesk, Roboto Slab and JetBrains Mono (latin, variable, OFL), self-hosted. `favicon.svg` and `card.png` (1200×630, the Open Graph image) are sources, not build output.

## The estate reading

`/estate.json` is not a status page that someone updates. On a cache miss, the Worker GETs every node in `data/estate.json` concurrently. Each GET does not follow redirects and times out after 4 s. The Worker tells each answer in Belnap's four values (`src/told.mjs`):

| told    | when                                                     |
|---------|----------------------------------------------------------|
| true    | 2xx or 3xx                                               |
| both    | 401, 402, 403: answered and refused (payment or credentials) |
| false   | no answer, 4xx, or 5xx                                   |
| neither | no reading yet                                           |

The reading is cached for 300 s. The page fetches it and colours each tile. `compatibility_flags: ["global_fetch_strictly_public"]` makes probes of other `*.561.group` hosts go through the front door, as a visitor's request would. The build refuses more than 45 nodes, because every probe counts against the Worker's subrequest budget.

## Stealth

Stealth runs one way (Leader, 2026-10-22): the Group's surfaces may name the Leader, but the Leader's own web properties (emsenn.net and his personal public profiles) carry no association with the Group. Nothing on this site is required to name a person; the Group's copy holds authority in offices. The enforcement is in the other direction: `gate-stealth` in bare-cedar-fog-services-section refuses a candidate that adds the Group's name to a declared personal surface.

- `workers_dev` and `preview_urls` stay `false`. The account's workers.dev subdomain must never appear on a public surface.
- Before listing a node in `data/estate.json`, read its public pages for personal names, handles, repo paths and workers.dev URLs.
- Leave out nodes that are broken, behind a login, or infrastructure.

## Site-owned ActivityPub federation

The Worker preserves the site's authored static resources and routes missing
resources through `ACTIVITYPUB_INSTANCE.fetch(request)` **only when an
independently configured ActivityPub service binding exists**. It forwards the
exact origin-bearing request. Static contact/estate pages take precedence;
provider 404s do not overwrite asset 404s; and public requests for
`/_private/*` never reach internal delivery or queue handlers.

The provider must be a separately keyed, custodied
`@red-cup-engineering/activitypub-services-section` instance hosted through
the upstream [ActivityPub server](https://github.com/red-cup-engineering/activitypub-server).
It must accept only `https://561.group` as its canonical origin; a
`science.561.group` or another site's provider is not substitutable.
Do not publish bearer credentials in Worker source or treat static WebFinger
JSON as an ActivityPub server.

**Installed as a binding:** `wrangler.jsonc` binds `ACTIVITYPUB_INSTANCE` to the
existing Worker `section-services-561-group`, which hosts the ActivityPub provider
in process (the account is at its Worker cap, so there is no separate
`activitypub-561-group`). Static files win first, so `/.well-known/security.txt`,
`/feed.json` and the other assets are never forwarded. Anything the assets do not
serve, such as `/.well-known/webfinger` and `/actors/*`, is forwarded. Until that
Worker's provider answers, forwarded paths return 404, which the site passes
through unchanged. The handles are `@group@561.group` and one per company on its
own host. Whether the provider answers is a separate, dated reading.

## Build and deploy

```sh
pnpm build    # writes public/ from the original site-owned data and curated estate
pnpm deploy   # build, then wrangler deploy (routes 561.group/* and www.561.group/*)
```

After deploying, check three things. `https://561.group/` should answer 200. `https://www.561.group/x` should return a 301 to `https://561.group/x`. `https://561.group/estate.json` should list every node with a `told` value.

## The Group as a hub

`data/home.json` also holds `group`: the four companies (name, URL, GitHub organization, fediverse handle, feeds), the market addresses and the topics the Organization knows about. The renderer turns it into the JSON-LD graph (Organization with `subOrganization`, WebSite, DefinedTermSet of the glossed design terms), the "The Group" section with the Follow block, and the companies in `llms.txt` and `llms-full.txt`. `scripts/build.mjs` reads the market's offer count from its x402 discovery at build time and leaves the number out of the llms files when it cannot be read; it is never written by hand. `robots.txt` names the AI crawlers explicitly.

## What the Group is publishing

`scripts/build.mjs` reads `feed.json` of each of the four companies (`src/feed.mjs`), merges the items newest first (60 at most, each item's own id, url, title, summary, dates and tags, with the company as author) and writes `/feed.json`, `/feed.atom.xml` and `/feed.rss.xml`, the "Latest from the Group" list on the home page and the feed lines in `llms.txt`. A feed that cannot be read is logged and skipped; the build never fails for it. The ActivityPub host projects the outbox of `@group@561.group` from `https://561.group/feed.json`.

The apex reflects the companies as of its build, so redeploy it after they publish: let the companies' sites go live first, then run `pnpm build && pnpm deploy` here. The build can be rerun at any time.

## Discovery files

- `/.well-known/security.txt` (RFC 9116) is generated by each build with `Expires` one year after the build date.
- `/<key>.txt` serves the IndexNow ownership key (`group.indexNowKey` in `data/home.json`); after a deploy, submit the sitemap URLs to `https://api.indexnow.org/indexnow`.
- The home page description is the Group's own sentence, kept verbatim even though audits that want 50 to 160 characters flag its length. That is a deliberate exception.

## Source composition and release inputs

The Group apex keeps one curated link to the separately owned `play.561.group`
catalog in `data/estate.json`. Its build no longer imports
`@causeway-services/play`, reads external game checkouts, or accepts a cached
game-list snapshot. Play's dynamic catalog and its publication pipeline remain
owned by Causeway; changing them cannot silently change this apex release.

The apex genuinely consumes `@red-cup-engineering/l-space` for its three
language projections and `@red-cup-engineering/living-web-server/fetch` for
the English root's TUFTE HTTP application. Their actual installed source and
transitive dependencies must be available. The manual production job requires
a committed, exact `package-lock.json` and uses
`npm ci --ignore-scripts --no-audit --no-fund`. Candidate `npm install`
resolution without a received lock is not a production release. Do not
substitute a mock serializer or dummy packages for a missing supplier.

`GITHUB_SHA` records the exact site source commit in
`/source-revision.json` when building the release. Publication still requires
a qualified native build, an authorized Cloudflare deployment and independent
readback of that revision, the canonical human/agent views and inherited
contact/estate routes. The read-only HTTP observer alone does not prove the
Cloudflare version or independently accepted delivery.
