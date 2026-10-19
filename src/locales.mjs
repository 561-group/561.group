// The languages 561.group speaks, and how one locale speaks: an L-space over
// the site's own interface strings (locales/en.arb) and the words derived from
// its data (./words.mjs), read under the site's translation policy. A string a
// locale does not admit falls back to English and is marked as English.

import { createTranslator, locale as localeFaces, lSpace, parseArb, resolveMessages, alternates } from "@red-cup-engineering/l-space";
import { contentCatalog } from "./words.mjs";

/** The locales served, the default first, and the policy each runs under: machine renderings admitted and disclosed. */
export const LOCALES = Object.freeze(["en", "zh-Hans", "lkt"]);
export const DEFAULT_LOCALE = "en";
export const POLICY = Object.freeze({ "zh-Hans": { machine: true }, lkt: { machine: true } });

/** The path a locale's page is served under. */
export const localePath = (tag) => (tag === DEFAULT_LOCALE ? "/" : `/${tag.toLowerCase()}/`);

/** One L-space over the interface source, the derived content source, and each locale's rendering catalog. */
export function siteSpace({ interfaceSource, renderings, home, estate }) {
  const source = { ...parseArbObject(interfaceSource), ...contentCatalog(home, estate) };
  return lSpace({ source, targets: renderings.map((catalog) => (typeof catalog === "string" ? parseArb(catalog) : catalog)) });
}

const parseArbObject = (text) => (typeof text === "string" ? JSON.parse(text) : text);

const escapeHtml = (text) => String(text).replace(/[&<>"']/gu, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** How one locale speaks: text and HTML for every key, the language each is really in, and the page's alternates. */
export function speaker(space, tag, { origin }) {
  const faces = localeFaces(tag);
  const resolved = resolveMessages(space, faces.tag, { policy: POLICY });
  const translator = createTranslator(resolved, { locale: faces.tag });
  const target = space.targets.find((catalog) => catalog.locale === faces.tag);
  const machineOnly = (key) => {
    const witnesses = target?.units.get(key)?.evidence?.for ?? [];
    return witnesses.length > 0 && witnesses.every((witness) => witness.kind === "machine");
  };
  const marked = (html, language) => (language === faces.tag ? html : `<span lang="${escapeHtml(language)}">${html}</span>`);
  return Object.freeze({
    tag: faces.tag,
    faces,
    prefix: faces.tag === DEFAULT_LOCALE ? "" : `/${faces.tag.toLowerCase()}`,
    has: (key) => translator.has(key),
    text: (key, values) => translator.text(key, values),
    /** HTML of a message; a fallback is marked with its language. Tags render through trusted renderers. */
    html: (key, values = {}, tags = {}) => {
      const { html, language } = translator.html(key, values, tags);
      return marked(html, language);
    },
    /** Whether any message this locale serves stands only on machine witnesses. */
    machine: () => [...resolved].some(([key, entry]) => entry.status === "translated" && machineOnly(key)),
    alternates: () => alternates(LOCALES.map((other) => ({ locale: other, href: `${origin}${localePath(other)}` })), { xDefault: `${origin}/` }),
  });
}
