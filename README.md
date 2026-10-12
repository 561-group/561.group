# 561.group

The Group's public face: one Cloudflare Worker on the `561.group` zone. It serves the page, sends `www.561.group` to the apex, and answers `/estate.json`.

## Layout

- `data/home.json` holds the words: the description (keep it verbatim), the intended-design sentence with its glossed notes, the doctrine, and the four told values.
- `data/estate.json` holds the public nodes. It lists the groups, the doors (featured nodes), the nodes themselves, and the machine endpoints listed for agents.
- `src/render.mjs` is a pure renderer from those two files to `index.html`, `llms.txt`, `humans.txt`, `robots.txt` and `sitemap.xml`.
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

## Build and deploy

```sh
pnpm build    # writes public/ from data/
pnpm deploy   # build, then wrangler deploy (routes 561.group/* and www.561.group/*)
```

After deploying, check three things. `https://561.group/` should answer 200. `https://www.561.group/x` should return a 301 to `https://561.group/x`. `https://561.group/estate.json` should list every node with a `told` value.
