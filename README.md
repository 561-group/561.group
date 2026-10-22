# 561.group

<!-- 561-group-standards:badges:start -->
[![561 Group](https://img.shields.io/badge/561%20Group-561%20Group-1c282a)](https://github.com/561-group)
[![License: 561 Group 1.0](https://img.shields.io/badge/license-561%20Group%201.0-1c282a)](LICENSE)
<!-- 561-group-standards:badges:end -->

The Group's public face: one Cloudflare Worker on the `561.group` zone. It serves the page, sends `www.561.group` to the apex, and answers `/estate.json`.

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

**Not yet installed:** `wrangler.jsonc` declares no `ACTIVITYPUB_INSTANCE`
service binding, because the Worker `activitypub-561-group` did not exist on the
account when this site was last deployed (2026-10-21). The page already advertises
the actor (`fediverse:creator`, `rel="me"`, the Follow block, llms.txt), and
`https://561.group/actors/group` answers 404 until the binding is added. When the
provider Worker exists, uncomment the `services` block in `wrangler.jsonc` and
redeploy; the forwarding code needs no change. The handles are
`@group@561.group` and one per company on its own host.

## Build and deploy

```sh
pnpm build    # writes public/ from data/ and authored game sources
pnpm deploy   # build, then wrangler deploy (routes 561.group/* and www.561.group/*)
```

After deploying, check three things. `https://561.group/` should answer 200. `https://www.561.group/x` should return a 301 to `https://561.group/x`. `https://561.group/estate.json` should list every node with a `told` value.

## The Group as a hub

`data/home.json` also holds `group`: the four companies (name, URL, GitHub organization, fediverse handle, feeds), the market addresses and the topics the Organization knows about. The renderer turns it into the JSON-LD graph (Organization with `subOrganization`, WebSite, DefinedTermSet of the glossed design terms), the "The Group" section with the Follow block, and the companies in `llms.txt` and `llms-full.txt`. `scripts/build.mjs` reads the market's offer count from its x402 discovery at build time and leaves the number out of the llms files when it cannot be read; it is never written by hand. `robots.txt` names the AI crawlers explicitly.

## What the Group is publishing

`scripts/build.mjs` reads `feed.json` of each of the four companies (`src/feed.mjs`), merges the items newest first (60 at most, each item's own id, url, title, summary, dates and tags, with the company as author) and writes `/feed.json`, `/feed.atom.xml` and `/feed.rss.xml`, the "Latest from the Group" list on the home page and the feed lines in `llms.txt`. A feed that cannot be read is logged and skipped; the build never fails for it. The ActivityPub host projects the outbox of `@group@561.group` from `https://561.group/feed.json`.

The apex reflects the companies as of its build, so redeploy it after they publish: let the companies' sites go live first, then run `pnpm build && pnpm deploy` here. The build can be rerun at any time.

## Source composition

The apex consumes `@causeway-services/play` through its declared catalog,
presentation and composition exports. Bind the actual Public Games and external
Science Git checkouts with `PLAY_CATALOG_SOURCES` using the supplier's source-array
contract; `PLAY_CATALOG_DATE` optionally fixes the real UTC publication date.
Outside the original integrated checkout, missing source bindings fail the build.
A checkout that lacks the game sources may instead name an earlier published
`estate-records.json` in `ESTATE_GAMES_SNAPSHOT`; the build then reuses that record's
games unchanged and says so on stderr. It is an explicit input, not a default.
Catalog discovery does not probe public pages during publication. The existing
Worker's request-time estate readings are unchanged.

This package requires Node >=24.2.0, matching the received play supplier's runtime
floor. The workspace dependency declares source composition, not a completed
package-manager installation or release. Source receiving, installed closure,
provider version and independent public receiving remain separate.
