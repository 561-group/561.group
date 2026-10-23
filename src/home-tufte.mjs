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
  const material = approved?.materialApproach;
  if (!["headline", "body", "scope"].every(field =>
      typeof material?.[field] === "string" && material[field].trim())) {
    throw new TypeError("The source-owned material-world position requires a headline, body and scope");
  }
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
  const organization={
    "@type":"Organization","@id":home.origin+"/#organization",
    name:home.name,url:home.origin+"/",description:home.description,
    foundingDate:String(home.established),
    sameAs:[home.group.githubOrg,home.group.actor],
    knowsAbout:home.group.knowsAbout,
    subOrganization:home.group.companies.map(company=>({
      "@type":"Organization","@id":company.url+"#organization",
      name:company.name,url:company.url,
      sameAs:[company.github,company.actor]
    }))
  };
  return {
    title: home.name,
    eyebrow: "561 Group · Public home",
    subtitle: "We make research useful.",
    metadata: {
      title: home.name,description: home.description,language: "en",
      canonical:home.origin+"/",image:home.origin+"/card.png",
      type:"website",siteName:home.name,
      structuredData:{"@context":"https://schema.org","@graph":[
        organization,{"@type":"WebSite","@id":home.origin+"/#website",
          name:home.name,url:home.origin+"/",description:home.description,
          publisher:{"@id":home.origin+"/#organization"},inLanguage:["en","zh-Hans","lkt"]}
      ]}
    },
    revision:estate.revision??"unversioned",
    navigation:[
      {href:"/#explore",label:"Projects"},
      {href:"/#physical-world",label:"Our approach"},
      {href:"/#companies",label:"Companies"},
      {href:"/contact/",label:"Work with us"},
      {href:"/zh-hans/",label:"简体中文"},
      {href:"/lkt/",label:"Lakȟótiyapi"}
    ],
    tiles: [
      { id: "introduction", title: approved.headline, role: "now", span: 8,
        html: '<p>' + escapeHtml(approved.intro) + '</p><p>' + escapeHtml(approved.aim) + '</p>' },
      { id: "contact", title: "Work with us", span: 4,
        html: '<p>' + escapeHtml(approved.contactIntro) + '</p><p>' + anchor("/contact/", "Contact the Group") + '</p>' },
      { id: "explore", title: "Explore working projects", role: "rail", span: 12,
        html: '<ul>' + work + '</ul>' },
      { id: "physical-world", title: material.headline, span: 12,
        html: '<p>' + escapeHtml(material.body) + '</p><p>' + escapeHtml(material.scope) + '</p>' },
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

// The original TUFTE engine admits this as document.headHtml, not a parallel
// renderer. These discoverability links are drawn exclusively from the same
// authored home record whose route is admitted by the site Worker.
export function project561GroupHead(home){
  if(!home||home.origin!=="https://561.group")throw new TypeError("Canonical source-owned home required");
  const entry=(tag,attrs)=>"<"+tag+" "+Object.entries(attrs)
    .map(([key,value])=>key+'="'+escapeHtml(value)+'"').join(" ")+">";
  const alternate=(type,title,href)=>entry("link",{
    rel:"alternate",type,title,href:publicHref(href)
  });
  return [
    entry("meta",{name:"fediverse:creator",content:home.group.handle}),
    entry("link",{rel:"me",href:publicHref(home.group.actor)}),
    entry("link",{rel:"icon",href:"/favicon.svg",type:"image/svg+xml"}),
    entry("link",{rel:"apple-touch-icon",href:"/apple-touch-icon.png"}),
    alternate("text/plain","For language models","/llms.txt"),
    alternate("text/plain","For language models, in full","/llms-full.txt"),
    alternate("application/json","Live estate","/estate.json"),
    alternate("application/feed+json","Group publications","/feed.json"),
    alternate("application/atom+xml","Group publications (Atom)","/feed.atom.xml"),
    alternate("application/rss+xml","Group publications (RSS)","/feed.rss.xml"),
    ...[["en","/"],["zh-Hans","/zh-hans/"],["lkt","/lkt/"]].map(([tag,href])=>
      entry("link",{rel:"alternate",hreflang:tag,href:home.origin+href})),
    entry("link",{rel:"alternate",hreflang:"x-default",href:home.origin+"/"})
  ].join("");
}
