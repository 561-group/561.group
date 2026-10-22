// Consumer projection only: the Group's existing public data and estate own all words, links and identities.
// TUFTE owns layout and HTML; LivingWebServer owns public-read admission and Fetch negotiation.
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/gu,
  c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function publicHref(value) {
  if (typeof value !== "string" || !value.trim()) throw new TypeError("A public link needs an URL");
  const u = new URL(value, "https://561.group");
  if (u.protocol !== "https:" || u.username || u.password) throw new TypeError("Only public HTTPS resources are linked");
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (u.origin !== "https://561.group" && value.startsWith("/")) throw new TypeError("Noncanonical local URL");
  return u.href;
}

const anchor = (href, label) => '<a href="' + escapeHtml(publicHref(href)) + '">' + escapeHtml(label) + '</a>';

export function project561GroupHome({ home, estate }) {
  if (!home || !estate || home.origin !== "https://561.group") throw new TypeError("The original Group site data is required");
  const approved = home.public;
  const support = home.group?.sustainingSupport;
  const featured = approved?.featured;
  if (!approved?.headline || !approved?.intro || !Array.isArray(featured) ||
      !Number.isInteger(support?.monthlyUsd) || support.monthlyUsd <= 0) {
    throw new TypeError("The original public introduction, featured estate and support price are required");
  }
  const byHost = new Map((estate.nodes ?? []).map(node => [node.host, node]));
  const work = featured.map(item => {
    const node = byHost.get(item.host);
    if (!node) throw new TypeError("Featured source is not a published estate entry: " + item.host);
    const url = node.url ?? "https://" + node.host + "/";
    return '<li>' + anchor(url, item.action) + '<p>' + escapeHtml(item.summary) + '</p></li>';
  }).join("");
  const companies = (home.group?.companies ?? []).map(company =>
    '<li>' + anchor(company.url, company.name) + '</li>').join("");
  return {
    title: home.name,
    eyebrow: "561 Group · Public home",
    subtitle: "We make research useful.",
    metadata: { title: home.name, description: home.description, language: "en" },
    tiles: [
      { id: "introduction", title: approved.headline, role: "now", span: 8,
        html: '<p>' + escapeHtml(approved.intro) + '</p><p>' + escapeHtml(approved.aim) + '</p>' },
      { id: "contact", title: "Work with us", span: 4,
        html: '<p>' + escapeHtml(approved.contactIntro) + '</p><p>' + anchor("/contact/", "Contact the Group") + '</p>' },
      { id: "explore", title: "Explore working projects", role: "rail", span: 12,
        html: '<ul>' + work + '</ul>' },
      { id: "support", title: "Sustain the public work", span: 6,
        html: '<p>' + escapeHtml(support.summary) + '</p><p>' + anchor(support.url,
          "Support the Group — $" + support.monthlyUsd + "/month") + '</p><p>Recurring monthly until canceled. No privileged access, editorial influence or customer-settlement rights. ' + anchor(support.billingHelp, "Billing and cancellation help") + '.</p>' },
      { id: "companies", title: "Four service companies", span: 6,
        html: '<ul>' + companies + '</ul>' },
    ],
    footerHtml: '<p>561 Group · Founded ' + escapeHtml(home.established) + ' · ' +
      anchor("/contact/", "Contact") + '</p>',
  };
}
