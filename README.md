# 561.group

The Group's public face: one Cloudflare Worker on the `561.group` zone. It serves the page, sends `www.561.group` to the apex, and answers `/estate.json`.

## Layout

- `data/home.json` holds the words: the description (keep it verbatim), the intended-design sentence with its glossed notes, the doctrine, and the four told values.
- `data/estate.json` holds the public nodes. It lists the groups, the doors (featured nodes), the nodes themselves, and the machine endpoints listed for agents.
- `src/render.mjs` is a pure renderer from those two files to `index.html`, `llms.txt`, `humans.txt`, `robots.txt`, `sitemap.xml` and `sitemap.txt`. Both sitemaps project the same canonical page routes.
- `scripts/build.mjs` checks the data and writes those files into `public/`. They are gitignored.
- `src/worker.mjs` serves `public/` through the `ASSETS` binding and adds security headers on every response.
- `public/contact/index.html` retains the original structured public issue and confidential email preparation routes. It preserves full sender text for review, including a long-message copy path. The existing receiving mailbox is a required contact route; no personal profile is listed.
- `public/fonts/` holds Space Grotesk, Roboto Slab and JetBrains Mono (latin, variable, OFL), self-hosted. `favicon.svg` and `card.png` (1200×630, the Open Graph image) are sources, not build output.

The text sitemap recovers the discovery resource first authored in
[`0d46fbea`](https://github.com/561-group/561.group/commit/0d46fbea3acfef82ba71bb7b7a72e6dc4a078271)
and retained in [PR #7](https://github.com/561-group/561.group/pull/7).
Its original apex URL remains; the existing XML sitemap also owns the contact
page, so both generated formats include it. The original branch's proposed
homepage wording remains outside this recovery and is not selected here.

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

No person is named anywhere on this site, and nothing here may link to a person's accounts, repositories or sites. Authority is held by offices.

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

**Not yet installed:** the current `wrangler.jsonc` does not declare an
`ACTIVITYPUB_INSTANCE` service binding and no public live federation
receiving is asserted. Configure and independently receive a real upstream
provider and Worker binding before advertising an ActivityPub actor.

## Build and deploy

```sh
pnpm build    # writes public/ from data/ and authored game sources
pnpm deploy   # build, then wrangler deploy (routes 561.group/* and www.561.group/*)
```

After deploying, check three things. `https://561.group/` should answer 200. `https://www.561.group/x` should return a 301 to `https://561.group/x`. `https://561.group/estate.json` should list every node with a `told` value.

## Source composition

The apex consumes `@causeway-services/play` through its declared catalog,
presentation and composition exports. Bind the actual Public Games and external
Science Git checkouts with `PLAY_CATALOG_SOURCES` using the supplier's source-array
contract; `PLAY_CATALOG_DATE` optionally fixes the real UTC publication date.
Outside the original integrated checkout, missing source bindings fail the build.
Catalog discovery does not probe public pages during publication. The existing
Worker's request-time estate readings are unchanged.

This package requires Node >=24.2.0, matching the received play supplier's runtime
floor. The workspace dependency declares source composition, not a completed
package-manager installation or release. Source receiving, installed closure,
provider version and independent public receiving remain separate.
