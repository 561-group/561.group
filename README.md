# 561.group

The Group's public face: one Cloudflare Worker on the `561.group` zone. It serves the page, sends `www.561.group` to the apex, and answers `/estate.json`.

## Sustain the public commons

The 561 Group's public research, reusable source, and technical infrastructure are supported in part by voluntary contributions. [**Sustain this work for USD $10 per month**](https://buy.stripe.com/28E28s1b4gJcb2Y3Io5EY02) through the current seller's Stripe-hosted subscription checkout. Support renews monthly until canceled and does **not** purchase private access, influence over research or editorial decisions, or a charitable tax deduction.

The checkout displays the current legal seller and exact billing terms. For subscription questions or cancellation assistance, use the [private Group contact route](https://561.group/contact/#private-intake). The support offer is authored in [the original Group homepage source](data/home.json); its public site release and the real payment processor's subscription records have separate receiving conditions. This GitHub publication is an immediately accessible first-party information route, not evidence that the Cloudflare homepage has deployed or anyone has subscribed.

## Reader-first public receiving

The original [homepage audit and reader-closure method](docs/reader-closure-qualification.md) is the operational acceptance contract for this public site. The Group's governing mission describes **economic, political, and ecological volatility**, in that exact order; the whole description in `data/home.json` feeds visible copy, meta description, schema.org identity and `llms.txt`. Do not change that triad to alphabetical order or restore “financial” as the third domain.

The page's early **Choose a path** section derives four honest visitor actions from the existing `data/home.json.readerPaths`: request work, explore public services, read the intended design, or inspect machine routes. Every choice has an explicit reader task, an existing native destination, a visible boundary on what that action does **not** prove, and a linked repair/evidence surface. This uses ordinary semantic HTML and native `<details>` without JavaScript; it is **not** a second TUFTE proof/panel engine or a store of SignGraph/CAIRN claims. `/llms.txt` projects the same statements and links from the same source.

The MAPE-K explanatory cells must render in the original source order **Monitor → Analyze → Plan → Execute**. Visual reordering that places Execute before Plan is a communication defect, even when decorative numeric labels correctly say 04 and 03. The site also gives readers the raw `/estate.json` link when status enhancement is absent or fails; HTTP status is not proof of service effect.

The original `public/card.png` social-preview image still visually prints the superseded political/financial/economic mission. Until its pixels are regenerated and received from the current description, the page **does not advertise** that stale image through schema.org or Open Graph; text-only `twitter:card=summary` avoids a contradictory large-card claim. Preserve the original PNG as historical source until replaced correctly, and inspect the regenerated asset before restoring a large social card. This is a known, explicit pending receiving obligation, not the permanent desired design.

The source-level gate is `node --test test/market-discovery.test.mjs`; the full installed gate is `pnpm test && pnpm build` with the required Play sources and Node >=24.2. Browser/mobile/no-script and real Cloudflare publication are **separate** receiving obligations; a branch, PR, isolated V8 test or GitHub merge cannot claim public deployment. The existing production workflow remains manually gated. The Science [gutter research PR](https://github.com/lenticule-science/561-theory/pull/12) and the Engineering [TUFTE reading projector PR](https://github.com/red-cup-engineering/web-page-tiling-engine/pull/15) supply the adjacent research and reusable UI contracts.

### The mathematical generator of the public account

The homepage now makes the Group's original research-to-operation dependency explicit **before** showing the derived MAPE-K architecture. The actual order is [Relationality](https://github.com/lenticule-science/science-services-section/blob/main/services/philosophy-services-section/services/relationality-services-section/README.md) → [Obsmetrologia](https://github.com/lenticule-science/obsmetrologia/blob/main/Obsmetrologia.lean) → [Sign engineering](https://github.com/red-cup-engineering/signcraft/blob/main/src/settle.mjs) → [agentic institutions](https://github.com/red-cup-engineering/metroplat/blob/main/README.md). The Group uses and improves mathematical research to specify, construct, and test its agentic ontology; encountered software, standards, and market obstructions return questions to the research. This is an order of dependency and accountable investigation, not a claim that all philosophical bridges have already been proved or all agent operations deployed.

The original `data/home.json.foundation` is the website's editorial projection only; mathematical definitions, theorems, software proofs and operating receipts remain in their competent upstream sources. The original `src/render.mjs` preserves the phase order and its distinct evidence boundaries in semantic ordered HTML and `llms.txt`. Test these invariants in `test/market-discovery.test.mjs` and receive the actual public deployment separately as described in [the site's source-owned qualification method](docs/reader-closure-qualification.md). Do not turn a familiar reference to topology or type theory elsewhere into an equivalence claim about the Group's complete constitutive research program.

## Layout

- `data/home.json` holds the words: the governing mission triad (exact domain order), visitor routes and audience/task/repair boundaries, the intended-design sentence with its glossed notes, doctrine, four told values, and the live voluntary recurring-support offer.
- `data/estate.json` holds the public nodes. It lists the groups, the doors (featured nodes), the nodes themselves, and the machine endpoints listed for agents.
- `src/render.mjs` is a pure renderer from those two files to `index.html`, `llms.txt`, `humans.txt`, `robots.txt` and `sitemap.xml`.
  The apex selects only its two public canonical pages; the shared computer-content codec emits the XML and robots formats. A build date is not falsely represented as a significant page modification.
- `scripts/build.mjs` checks the data and writes those files into `public/`. They are gitignored.
- `src/worker.mjs` serves `public/` through the `ASSETS` binding and adds security headers on every response.
- `public/contact/index.html` retains the original structured public issue and confidential email preparation routes. It preserves full sender text for review, including a long-message copy path. The existing receiving mailbox is a required contact route; no personal profile is listed.
- `public/fonts/` holds Space Grotesk, Roboto Slab and JetBrains Mono (latin, variable, OFL), self-hosted. `favicon.svg` remains the active identity-logo source. The archived 1200×630 `card.png` is a source asset **not currently advertised in social metadata** because its pixels contain the old mission text; regeneration and qualified receiving are required before restoring `og:image`.

## The estate reading

`/estate.json` is not a status page that someone updates. On a cache miss, the Worker GETs every node in `data/estate.json` concurrently. Each GET does not follow redirects and times out after 4 s. The Worker tells each answer in Belnap's four values (`src/told.mjs`):

| told    | when                                                     |
|---------|----------------------------------------------------------|
| true    | 2xx or 3xx                                               |
| both    | 401, 402, 403: answered and refused (payment or credentials) |
| false   | no answer, 4xx, or 5xx                                   |
| neither | no reading yet                                           |

The reading is cached for 300 s. The page fetches it and colours each tile.

The same public response is also a machine-consumable directory. It contains the
source's `groups` and featured `doors`; `nodes` and `machines` combine each
original public descriptor (`host`, `name`, `group`, `line`, entry `url` where
authored) with that entry's derived `status`, `told`, `ms` and actual probe
URL. The `endpoints` collection exposes the exact publicly authored agent
interfaces, including intake, instead of making an agent reverse-engineer
HTML tiles or invent a second catalog. `revision`, `derivedAt` and
`ttlSeconds` distinguish the source selection from a cached HTTP reading.
A responding page, a listed paid endpoint, or a successful probe is never a
settled transaction, working app, or customer-accepted result. `compatibility_flags: ["global_fetch_strictly_public"]` makes probes of other `*.561.group` hosts go through the front door, as a visitor's request would. The build refuses more than 45 nodes, because every probe counts against the Worker's subrequest budget.

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
