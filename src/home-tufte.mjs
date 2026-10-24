// 561 Group public site: one authored, source-qualified editorial projection.
// The original TUFTE engine owns document layout, accessibility, HTML and JSON.
// LivingWebServer owns public-read admission; this module owns only site words,
// selected links and page-specific models, never another renderer or router.
import { HOUSE_STYLES } from "./apex-house-style.mjs";
import { SITE_STYLES } from "./public-home-style.mjs";

const ORIGIN = "https://561.group";
export const PUBLIC_ROUTES = Object.freeze(["/", "/work/", "/projects/", "/about/", "/for-agents/"]);
const esc = value => String(value ?? "").replace(/[&<>"']/gu,
  c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const slug = /^[a-z][a-z0-9-]*$/u;

function publicHref(value) {
  if (typeof value !== "string" || !value.trim() || /[\u0000-\u001f\u007f\\]/u.test(value))
    throw new TypeError("A public link needs a valid URL");
  if (/^#[a-z][a-z0-9-]*$/u.test(value)) return value;
  const u = new URL(value, ORIGIN);
  if (u.protocol !== "https:" || u.username || u.password)
    throw new TypeError("Only public HTTPS resources are linked");
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (!value.startsWith("https://") && !value.startsWith("/"))
    throw new TypeError("Only canonical paths or absolute HTTPS links are admitted");
  return u.href;
}
function anchor(href, label, cssClass = "") {
  return '<a' + (cssClass ? ' class="' + esc(cssClass) + '"' : "") +
    ' href="' + esc(publicHref(href)) + '">' + esc(label) + '</a>';
}
function action(href, label, quiet = false) {
  return anchor(href, label + " ↗", "site-action" + (quiet ? " site-action--quiet" : ""));
}
function actions(items) {
  return '<div class="site-actions">' + items.map((item, index) =>
    action(item.href, item.label, index !== 0)).join("") + "</div>";
}
const note = text => '<p class="site-muted">' + esc(text) + "</p>";
const para = (text, cssClass = "") =>
  '<p' + (cssClass ? ' class="' + esc(cssClass) + '"' : "") + '>' + esc(text) + "</p>";
const panel = (id, title, html, span = 12, role = "standard") =>
  ({id, title, html, span, role});

function checkedSources(home, estate, frontdoor) {
  if (!home || !estate || !frontdoor || home.origin !== ORIGIN)
    throw new TypeError("Original Group source, public estate and public editorial record are required");
  const material = home.public?.materialApproach;
  if (!["headline","body","scope"].every(field =>
      typeof material?.[field] === "string" && material[field].trim()))
    throw new TypeError("The source-owned material-world position requires a headline, body and scope");
  const vision = frontdoor.vision;
  if (!vision || !["eyebrow","headline","intro","throughline","engagement"].every(
      field => typeof vision[field] === "string" && vision[field].trim()) ||
      !Array.isArray(vision.frontiers) || vision.frontiers.length !== 2 ||
      new Set(vision.frontiers.map(f => f.id)).size !== 2 ||
      !["union-of-harmonious-colonies","bicameral-biology"].every(
        id => vision.frontiers.some(f => f.id === id)) ||
      vision.frontiers.some(f => !slug.test(f.id) ||
        !["title","thesis","present","boundary"].every(
          field => typeof f[field] === "string" && f[field].trim())))
    throw new TypeError("Two complete, distinct, source-authored civilizational frontiers are required");
  if (frontdoor.schema !== "561.group/public-frontdoor/v1")
    throw new TypeError("Public editorial record has an unrecognized schema");
  if (typeof home.public?.headline !== "string" ||
      typeof home.public?.intro !== "string" ||
      typeof home.public?.aim !== "string" ||
      !Array.isArray(home.public?.featured) || !home.public.featured.length ||
      !Array.isArray(home.group?.companies) || home.group.companies.length !== 4 ||
      !Array.isArray(home.group?.storefronts) || home.group.storefronts.length !== 3 ||
      !Array.isArray(estate.nodes) || !Array.isArray(estate.groups) ||
      !Array.isArray(estate.machine) ||
      !Array.isArray(frontdoor.paths) || frontdoor.paths.length !== 4 ||
      !Array.isArray(frontdoor.offers) || frontdoor.offers.length < 4 ||
      !Array.isArray(frontdoor.steps) || frontdoor.steps.length !== 4)
    throw new TypeError("Public visitor journeys need actual original sources");
  const providers = new Map(home.group.companies.map(c => [c.id, c]));
  const nodes = new Map(estate.nodes.map(node => [node.host, node]));
  const unique = (items, label) => {
    const seen = new Set();
    for (const item of items) {
      if (!item || typeof item.id !== "string" || !slug.test(item.id) || seen.has(item.id))
        throw new TypeError("Duplicate or untyped " + label + " identifier");
      seen.add(item.id);
    }
  };
  unique(frontdoor.paths, "path");
  unique(frontdoor.offers, "service");
  if (nodes.size !== estate.nodes.length ||
      new Set(home.public.featured.map(x => x.host)).size !== home.public.featured.length)
    throw new TypeError("Original public project identities must be unique");
  for (const entry of home.public.featured)
    if (!nodes.has(entry.host)) throw new TypeError("Featured source is not a published estate entry: " + entry.host);
  for (const item of frontdoor.paths) publicHref(item.href);
  for (const offer of frontdoor.offers) {
    if (!providers.has(offer.provider)) throw new TypeError("Service has no original accountable company: " + offer.provider);
    if (offer.evidence !== undefined) {
      const item = offer.evidence;
      if (!item || typeof item !== "object" || Array.isArray(item) ||
          !["href", "label", "qualification"].every(key =>
            typeof item[key] === "string" && item[key].trim())) {
        throw new TypeError("Inspectable service evidence needs a destination, label and qualification");
      }
      publicHref(item.href);
    }
    if (offer.id === "indigenous-data" && !offer.framework)
      throw new TypeError("Data stewardship must expose its applicable CARE Principles and authority boundary");
    if (offer.framework !== undefined) {
      const framework=offer.framework;
      if (!framework || !["href","label","qualification"].every(key=>
          typeof framework[key]==="string" && framework[key].trim()) ||
          !framework.href.startsWith("https://www.rd-alliance.org/") ||
          offer.id!=="indigenous-data")
        throw new TypeError("Data-rights practice must cite the original CARE Principles, not claim a group compliance badge");
      publicHref(framework.href);
    }
    if (offer.paidProposal !== undefined) {
      const proposal = offer.paidProposal;
      if (offer.provider !== "services" ||
          !proposal || typeof proposal !== "object" || Array.isArray(proposal) ||
          !["href", "label", "qualification"].every(key =>
            typeof proposal[key] === "string" && proposal[key].trim())) {
        throw new TypeError("A paid pilot must be sourced to a competent Causeway seller and qualified proposal");
      }
      const url = new URL(publicHref(proposal.href));
      if (url.origin !== "https://services.561.group" ||
          !/^\/[a-z0-9-]+\/$/u.test(url.pathname) || url.search || url.hash) {
        throw new TypeError("Paid pilot preview must link to a canonical original Causeway publication");
      }
    }
  }
  for (const company of providers.values()) publicHref(company.url);
  for (const shop of home.group.storefronts) publicHref(shop.url);
  for (const api of estate.machine) {
    if (!["GET", "POST"].includes(api.verb)) throw new TypeError("Unadmitted machine method");
    publicHref(api.url);
  }
  const support = home.group.sustainingSupport;
  if (!Number.isInteger(support?.monthlyUsd) || support.monthlyUsd <= 0)
    throw new TypeError("Original exact support terms are required");
  publicHref(support.url);
  publicHref(support.billingHelp);
  return {providers, nodes, support};
}
function structure(home, pathname, frontdoor) {
  const org = {
    "@type":"Organization","@id":home.origin + "/#organization",
    name:home.name,url:home.origin + "/",description:home.description,
    foundingDate:String(home.established),
    sameAs:[home.group.githubOrg,home.group.actor],
    // Metadata describes THIS page's useful task. Reserve the complete
    // research and cultural topics for the source-owned About context;
    // otherwise bots receive the very speculative homepage billboard
    // that the visible navigation correctly refuses.
    knowsAbout:pathname==="/about/" ? home.group.knowsAbout :
      ["research","software engineering","operational coordination",
       "energy and resource management","public services"],
    subOrganization:home.group.companies.map(company => ({
      "@type":"Organization","@id":company.url + "#organization",
      name:company.name,url:company.url,sameAs:[company.github,company.actor]
    }))
  };
  const page = {"@type":pathname === "/projects/" ? "CollectionPage" : "WebPage",
    "@id":home.origin + pathname + "#webpage",
    url:home.origin + pathname,inLanguage:"en",
    isPartOf:{"@id":home.origin + "/#website"},
    about:{"@id":home.origin + "/#organization"}};
  // Project only real publicly visible inquiry areas; no prices, purchases,
  // merchant promises, review scores or invented customer endorsement.
  if (pathname === "/work/") {
    page.mainEntity = {
      "@type":"ItemList",name:"Service areas available for inquiry",
      itemListElement:frontdoor.offers.map((service,index) => ({
        "@type":"ListItem",position:index + 1,
        item:{"@type":"Service","@id":home.origin + "/work/#" + service.id,
          name:service.title,description:service.scope,
          url:home.origin + "/work/#" + service.id,
          provider:{"@id":home.group.companies.find(company =>
            company.id === service.provider).url + "#organization"}}
      }))
    };
  }
  return {"@context":"https://schema.org","@graph":[
    org,
    {"@type":"WebSite","@id":home.origin + "/#website",name:home.name,
      url:home.origin + "/",description:home.description,
      publisher:{"@id":home.origin + "/#organization"},inLanguage:["en","zh-Hans","lkt"]},
    page
  ]};
}
function navigation(pathname) {
  return [
    {href:"/",label:"Home"},
    {href:"/work/",label:"Work with us"},
    {href:"/projects/",label:"Projects"},
    {href:"/about/",label:"About"},
    {href:"/for-agents/",label:"For agents"},
    {href:"/contact/",label:"Contact"}
  ].map(item => ({...item,...(item.href === pathname ? {current:true} : {})}));
}
function houses(home) {
  return '<ul class="site-house-list">' + home.group.companies.map(company =>
    '<li><strong>' + esc(company.name) + '</strong>' + para(company.role) +
    anchor(company.url, "Visit " + company.name) + "</li>"
  ).join("") + "</ul>";
}
function trade(home) {
  return '<ul class="site-card-grid site-card-grid--three">' +
    home.group.storefronts.map(shop =>
      '<li class="site-card"><span class="site-category">Buy / use</span><h3>' +
      esc(shop.name) + '</h3>' + para(shop.what) + anchor(shop.url, "Open " + shop.name) +
      "</li>").join("") + "</ul>" +
    note("Shop is one provider's storefront; Bazaar is a multi-provider venue; Market is the wider market, including machine-service terms. Always inspect the current seller and offer before buying.");
}
function projects(home, estate, nodes) {
  return '<ul class="site-project-grid">' + home.public.featured.map(feature => {
    const item = nodes.get(feature.host);
    const href = item.url ?? "https://" + item.host + "/";
    return '<li class="site-project">' +
      '<span class="site-category">' + esc(item.group) + "</span>" +
      "<h3>" + esc(item.name) + "</h3>" +
      para(feature.summary) +
      anchor(href, feature.action) + "</li>";
  }).join("") + "</ul>";
}
function serviceEntries(frontdoor, providers, items = frontdoor.offers) {
  return '<ul class="site-service-grid">' + items.map(service => {
    const company = providers.get(service.provider);
    return '<li class="site-service" id="' + esc(service.id) + '">' +
      '<span class="site-provider">' + esc(company.name) + "</span>" +
      "<h3>" + esc(service.title) + "</h3>" +
      para(service.scope) +
      para("Possible requests: " + service.example, "site-example") +
      (service.framework ? anchor(service.framework.href,service.framework.label,"site-framework-link") +
        para(service.framework.qualification,"site-evidence-limit") : "") +
      (service.evidence ? anchor(service.evidence.href, service.evidence.label) +
        para(service.evidence.qualification, "site-evidence-limit") : "") +
      (service.paidProposal ? anchor(service.paidProposal.href, service.paidProposal.label) +
        para(service.paidProposal.qualification, "site-evidence-limit") : "") +
      anchor("/contact/?service=" + encodeURIComponent(service.title) + "#work", "Ask about this work") +
      "</li>";
  }).join("") + "</ul>";
}
function processSteps(frontdoor) {
  return '<ol class="site-steps">' + frontdoor.steps.map(step =>
    '<li class="site-step"><span class="site-step-number">' + esc(step.number) +
    "</span><h3>" + esc(step.title) + "</h3>" + para(step.detail) + "</li>").join("") + "</ol>";
}
function pathways(frontdoor) {
  return '<ul class="site-card-grid">' + frontdoor.paths.map(item =>
    '<li class="site-card">' +
    '<span class="site-category">' + esc(item.id) + "</span>" +
    "<h3>" + esc(item.title) + "</h3>" +
    para(item.detail) +
    anchor(item.href, item.action) + "</li>").join("") + "</ul>";
}
function lead(kicker, headline, description, calls = []) {
  return para(kicker,"site-overline") +
    '<h3 class="site-display">' + esc(headline) + "</h3>" +
    para(description,"site-intro") + (calls.length ? actions(calls) : "");
}
function frontiers(frontdoor, concise = false) {
  const vision = frontdoor.vision;
  return para(vision.intro,"site-section-lead") +
    '<div class="site-frontier-grid">' +
    vision.frontiers.map(f => '<section class="site-frontier" id="' + esc(f.id) + '">' +
      '<h3>' + esc(f.title) + '</h3>' +
      para(f.thesis,"site-frontier-thesis") +
      para(f.present,"site-frontier-present") +
      (concise ? "" : para(f.boundary,"site-frontier-boundary")) +
      '</section>').join("") + '</div>' +
    para(vision.throughline,"site-frontier-throughline") +
    (concise ? actions([{href:"/about/",label:"Read the full purpose"},
                        {href:"/work/",label:"Work with the Group"}]) :
      para(vision.engagement) +
      actions([{href:"/work/",label:"Bring a practical problem"},
               {href:"https://science.561.group/",label:"Explore the science"}]));
}
function endpoints(estate, limit = Infinity) {
  return '<ul class="site-endpoints">' + estate.machine.slice(0, limit).map(point =>
    "<li><span class=\"site-method\">" + esc(point.verb) + "</span>" +
    (point.verb === "GET" ? anchor(point.url, point.url) : "<code>" + esc(point.url) + "</code>") +
    para(point.what) + "</li>").join("") + "</ul>";
}

function homepage(home, estate, frontdoor, source) {
  // The homepage is an entrance, not a constitution, research index,
  // fashion campaign, sales catalog or anthology of every recent idea.
  // All deeper content stays with its actual public Work/Projects/About owner.
  return [
    panel("introduction","What the Group does",
      lead("561 GROUP / FOUR COMPANIES",
        frontdoor.proposition,frontdoor.promise,
        [{href:"/work/",label:"Explore services"},
         {href:"/contact/#work",label:"Discuss a project"}]) +
      para(home.public.intro,"site-hero-note"),12,"rail"),
    panel("paths","Find what you need",pathways(frontdoor),12),
    panel("companies","The four companies",houses(home),12),
    panel("explore","Public projects and publications",
      para("A few real places to begin. Each has its own purpose and current scope.","site-section-lead") +
      projects(home,estate,source.nodes) +
      anchor("/projects/","Browse the full project directory"),12),
    panel("contact","Get in touch",
      para(frontdoor.firstStep) +
      actions([{href:"/contact/#work",label:"Contact the Group"},
               {href:"/about/",label:"How the Group is organized"}]) +
      note("A message is an inquiry, not authorization, an order or an accepted outcome."),12)
  ];
}
function workPage(home, frontdoor, source) {
  return [
    panel("lead","Work with the Group",
      lead("A REAL JOB / A REAL PROVIDER", "Bring us a problem.",
        frontdoor.firstStep,[{href:"/contact/#work",label:"Request a scope and quote"},
          {href:"/projects/",label:"See what we make"}]),12),
    panel("services","Areas we can scope",
      para("Every service is scoped through its accountable provider and the rights appropriate to the work.","site-section-lead") +
      para("These are service capabilities for inquiry and qualification, not a catalog of pre-approved fixed-price orders.","site-section-lead") +
      serviceEntries(frontdoor,source.providers),12),
    panel("process","How an engagement moves",processSteps(frontdoor),12),
    panel("contact","Start with an outcome",
      para(home.public.contactIntro) +
      actions([{href:"/contact/#work",label:"Open the work inquiry"}]) +
      note("A submitted inquiry does not create an order, transfer authority or authorize payment."),12)
  ];
}
function projectsPage(home, estate, frontdoor, source) {
  const groups = estate.groups.map(group => {
    const nodes = estate.nodes.filter(item => item.group === group.id);
    if (!nodes.length) return "";
    return '<section><h3>' + esc(group.title) + "</h3><ul>" +
      nodes.map(item => '<li>' +
        anchor(item.url ?? "https://" + item.host + "/", item.name) +
        '<span>' + esc(item.line) + '</span></li>').join("") +
      "</ul></section>";
  }).join("");
  return [
    panel("lead","Explore the Group",
      lead("THE PUBLIC ESTATE","Find something real to visit.",
        "Books, machine services, news, living worlds and practical experiments—each offered by its own source.",
        [{href:"#selected",label:"Featured projects"},{href:"#trade",label:"Buying venues"}]),12),
    panel("trade","Shop, Bazaar and Market",trade(home),12),
    panel("selected","Start with these",projects(home,estate,source.nodes),12),
    panel("directory","More public projects",
      '<div class="site-directory">' + groups + "</div>" +
      note(frontdoor.readers.availability) +
      anchor("/estate.json","Read the actual dated connectivity observations"),12)
  ];
}
function aboutPage(home, frontdoor) {
  const support=home.group.sustainingSupport;
  return [
    panel("lead","About the 561 Group",
      lead("FOUNDED 2018 / FOUR COMPANIES",
        "Independent responsibilities. Shared coordination.",
        "The 561 Group connects research, engineering, operations and public services. Energy, resources, authority and the people receiving the work matter as much as its stated goals.",
        [{href:"/work/",label:"Work with us"},
         {href:"/projects/",label:"Explore our work"}]),12),
    panel("companies","The companies",houses(home),12),
    panel("principles","Energy and coordination",
      para(home.public.materialApproach.headline,"site-quote") +
      para(home.public.materialApproach.body) +
      para(home.public.materialApproach.scope) +
      para("Research models, production tests, operational effects and independent acceptance are separate claims. When community data are involved, rights holders' authority governs its use.") +
      anchor("/work/#indigenous-data","See our data-stewardship inquiry"),12),
    panel("process","From request to result",processSteps(frontdoor) +
      note("A real receiving party checks the result separately from the producer."),12),
    panel("frontiers","Long-horizon research",frontiers(frontdoor,false),12),
    panel("source","Sources and public records",
      para("Read the four companies' research and code directly; compare a claim to its original evidence.") +
      anchor(home.group.githubOrg,"Group source on GitHub") +
      '<p>' + anchor("/llms.txt","Plain-text site guide") + "</p>" +
      anchor(home.group.actor,"Federated Group actor"),8),
    panel("support","Optional sustaining support",
      para(support.summary) +
      para("Recurring monthly until canceled. Supporting public work does not grant editorial control, access to private records or a claim on any customer's payment.") +
      anchor(support.url,"Support the Group — $" + support.monthlyUsd + "/month") +
      '<p>' + anchor(support.billingHelp,"Billing and cancellation help") + "</p>",4)
  ];
}
function agentPage(home, estate, frontdoor) {
  return [
    panel("lead","For agents and automated clients",
      lead("PUBLIC DISCOVERY / PERMISSION IS SEPARATE",
        "Read the actual interfaces.",
        "Use the source-owned entry points below to inspect publications, estate observations, offered capabilities and current seller terms.",
        [{href:"/llms.txt",label:"Read the machine guide"},{href:"/estate.json",label:"Read the public estate"}]),12),
    panel("endpoints","Published machine-readable interfaces",
      endpoints(estate) +
      note("GET routes can be opened for inspection. POST routes are reference information, not an invitation to invoke them."),12),
    panel("boundaries","What public discovery does not authorize",
      para(frontdoor.readers.agents) +
      para("An endpoint's presence does not establish live availability, a completed transaction, custody of funds, permission to act, or a verified scientific claim.") +
      para("For paid machine services, read the current x402 terms from the original merchant and obtain the required authorization before purchasing.") +
      actions([{href:home.group.marketGuide,label:"Current merchant guide"},{href:"/work/",label:"Human scoping and contact"}]),12)
  ];
}
export function project561GroupPage({home,estate,frontdoor,path = "/"}) {
  if (!PUBLIC_ROUTES.includes(path)) throw new RangeError("Unadmitted Group public route");
  const source = checkedSources(home,estate,frontdoor);
  const page = {
    "/": {title:home.name,subtitle:"Research · Engineering · Operations · Public services"},
    "/work/": {title:"Work with the 561 Group",subtitle:"Capabilities, scoping, providers and actual terms"},
    "/projects/": {title:"Explore the 561 Group",subtitle:"Public projects, commerce, worlds and publications"},
    "/about/": {title:"About the 561 Group",subtitle:"Four companies, energy, coordination and accountable work"},
    "/for-agents/": {title:"For agents · 561 Group",subtitle:"Public machine endpoints and authorization boundaries"}
  }[path];
  const tiles = path === "/" ? homepage(home,estate,frontdoor,source) :
    path === "/work/" ? workPage(home,frontdoor,source) :
    path === "/projects/" ? projectsPage(home,estate,frontdoor,source) :
    path === "/about/" ? aboutPage(home,frontdoor) :
    agentPage(home,estate,frontdoor);
  return {
    title:page.title,subtitle:page.subtitle,
    eyebrow:"561 Group · A working public institution",
    metadata:{
      title:page.title,description:path === "/" ? home.description : page.subtitle,
      language:"en",canonical:ORIGIN + path,image:ORIGIN + "/card.png",
      type:"website",siteName:home.name,structuredData:structure(home,path,frontdoor)
    },
    revision:estate.revision ?? "unversioned",
    navigation:navigation(path),
    tiles,
    footerHtml:'<p>561 Group · Founded ' + esc(home.established) +
      ' · ' + anchor("/contact/","Contact") + ' · ' +
      anchor(home.group.githubOrg,"Source") + ' · ' +
      anchor("/llms.txt","For machines") + '</p>' +
      '<p>Languages: ' + anchor("/","English") + ' · ' +
      anchor("/zh-hans/","简体中文") + ' · ' +
      anchor("/lkt/","Lakȟótiyapi") +
      '. Translations and service availability differ by page.</p>'
  };
}
export const project561GroupHome = ({home,estate,frontdoor}) =>
  project561GroupPage({home,estate,frontdoor,path:"/"});

// TUFTE's supported headHtml slot adds source-owned discovery and local
// design tokens to its ONE real HTML renderer; never a competing document.
export function project561GroupHead(home) {
  if (!home || home.origin !== ORIGIN) throw new TypeError("Original canonical Group home required");
  const entry = (tag,attributes) => "<" + tag + " " + Object.entries(attributes)
    .map(([key,value]) => key + '="' + esc(value) + '"').join(" ") + ">";
  const alternate = (type,title,href) =>
    entry("link",{rel:"alternate",type,title,href:publicHref(href)});
  return [
    entry("meta",{name:"fediverse:creator",content:home.group.handle}),
    entry("link",{rel:"me",href:publicHref(home.group.actor)}),
    entry("link",{rel:"icon",href:"/favicon.svg",type:"image/svg+xml"}),
    entry("link",{rel:"apple-touch-icon",href:"/apple-touch-icon.png"}),
    alternate("text/plain","For language models","/llms.txt"),
    alternate("text/plain","For language models, in full","/llms-full.txt"),
    alternate("application/json","Live public estate","/estate.json"),
    alternate("application/feed+json","Group public writing","/feed.json"),
    alternate("application/atom+xml","Group publications (Atom)","/feed.atom.xml"),
    alternate("application/rss+xml","Group publications (RSS)","/feed.rss.xml"),
    ...[["en","/"],["zh-Hans","/zh-hans/"],["lkt","/lkt/"]].map(([tag,href]) =>
      entry("link",{rel:"alternate",hreflang:tag,href:ORIGIN + href})),
    entry("link",{rel:"alternate",hreflang:"x-default",href:ORIGIN + "/"}),
    '<style data-561-house="visual-design-bible-v0.4-candidate">' + HOUSE_STYLES + "\n" + SITE_STYLES + "</style>"
  ].join("");
}
