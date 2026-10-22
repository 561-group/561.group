// What the Group is publishing: the four companies' JSON Feeds merged, newest first, and written out as
// JSON Feed 1.1, Atom and RSS. Pure except readFeeds, which tolerates any feed being unreachable.

export const FEED_LIMIT = 60;

const xml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
const time = (item) => (Number.isFinite(Date.parse(item.date_published)) ? Date.parse(item.date_published) : -Infinity);

/** Read each company's feed.json; an unreadable one is logged and skipped. Returns [{ company, feed }]. */
export async function readFeeds(companies, { fetchImpl = fetch, log = console.warn } = {}) {
  const read = async (company) => {
    try {
      const response = await fetchImpl(company.feeds.json, { signal: AbortSignal.timeout(8000), headers: { accept: "application/feed+json, application/json" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const feed = await response.json();
      if (!Array.isArray(feed.items)) throw new Error("not a JSON Feed");
      return { company, feed };
    } catch (error) {
      log(`feed of ${company.name} not read (${error.message}); continuing without it`);
      return undefined;
    }
  };
  return (await Promise.all(companies.map(read))).filter(Boolean);
}

/** Merge feeds newest first, one entry per item id, capped. Each item keeps its own fields and gains its company as author. */
export function mergeItems(feeds, limit = FEED_LIMIT) {
  const seen = new Set();
  const items = [];
  for (const { company, feed } of feeds) {
    const authors = [{ name: company.name, url: company.url }];
    for (const item of feed.items) {
      const key = item.id ?? item.url;
      if (!key || !item.url || seen.has(key)) continue;
      seen.add(key);
      const kept = { id: item.id ?? item.url, url: item.url, title: item.title ?? item.url };
      for (const field of ["summary", "date_published", "date_modified", "tags"]) if (item[field] !== undefined) kept[field] = item[field];
      items.push({ ...kept, authors });
    }
  }
  return items.sort((a, b) => time(b) - time(a) || a.url.localeCompare(b.url)).slice(0, limit);
}

const TITLE = (home) => `${home.name}: what the Group is publishing`;
const DESCRIPTION = "The latest from Lenticule Science, Red Cup Engineering, Coesite Operations and Causeway Services.";

export function renderJsonFeed(home, items) {
  return JSON.stringify({
    version: "https://jsonfeed.org/version/1.1",
    title: TITLE(home),
    home_page_url: `${home.origin}/`,
    feed_url: `${home.origin}/feed.json`,
    description: DESCRIPTION,
    language: "en",
    authors: [{ name: home.name, url: `${home.origin}/` }],
    items,
  }, null, 2) + "\n";
}

const updatedOf = (items) => items.map((i) => i.date_modified ?? i.date_published).filter((d) => Number.isFinite(Date.parse(d))).sort().at(-1) ?? "1970-01-01T00:00:00Z";

export function renderAtom(home, items) {
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
<title>${xml(TITLE(home))}</title>
<subtitle>${xml(DESCRIPTION)}</subtitle>
<id>${home.origin}/feed.atom.xml</id>
<link rel="self" type="application/atom+xml" href="${home.origin}/feed.atom.xml"/>
<link rel="alternate" type="text/html" href="${home.origin}/"/>
<updated>${xml(updatedOf(items))}</updated>
${items.map((i) => `<entry>
<id>${xml(i.id)}</id>
<title>${xml(i.title)}</title>
<link rel="alternate" href="${xml(i.url)}"/>
<updated>${xml(i.date_modified ?? i.date_published ?? updatedOf(items))}</updated>
${i.date_published ? `<published>${xml(i.date_published)}</published>\n` : ""}<author><name>${xml(i.authors[0].name)}</name><uri>${xml(i.authors[0].url)}</uri></author>
${i.summary ? `<summary>${xml(i.summary)}</summary>\n` : ""}${(i.tags ?? []).map((t) => `<category term="${xml(t)}"/>\n`).join("")}</entry>`).join("\n")}
</feed>
`;
}

export function renderRss(home, items) {
  return `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${xml(TITLE(home))}</title>
<link>${home.origin}/</link>
<description>${xml(DESCRIPTION)}</description>
<language>en</language>
<atom:link rel="self" type="application/rss+xml" href="${home.origin}/feed.rss.xml"/>
${items.map((i) => `<item>
<title>${xml(i.title)}</title>
<link>${xml(i.url)}</link>
<guid isPermaLink="false">${xml(i.id)}</guid>
${Number.isFinite(Date.parse(i.date_published)) ? `<pubDate>${new Date(i.date_published).toUTCString()}</pubDate>\n` : ""}${i.summary ? `<description>${xml(i.summary)}</description>\n` : ""}<source url="${xml(i.authors[0].url)}feed.json">${xml(i.authors[0].name)}</source>
${(i.tags ?? []).map((t) => `<category>${xml(t)}</category>\n`).join("")}</item>`).join("\n")}
</channel>
</rss>
`;
}
