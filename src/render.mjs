import { escapeHtmlText as esc, robots as serializeRobots, sitemap as serializeSitemap, sitemapText as serializeSitemapText } from "@red-cup-engineering/computer-serialized-content-engineering-services-section/web-feed";

// Page-type-specific public surfaces, authored by the 561.group original source.
const FIT_CSS="\n@font-face{font-family:SG;src:url('/fonts/space-grotesk.woff2') format('woff2');font-weight:300 700;font-display:swap}\n@font-face{font-family:RS;src:url('/fonts/roboto-slab.woff2') format('woff2');font-weight:300 700;font-display:swap}\n:root{color-scheme:light dark;--bg:#f1eee6;--panel:#fdfbf6;--ink:#1c282a;--muted:#4e6063;--rule:#c3cac8;--accent:#115e69;--accent-ink:#fff}\n@media(prefers-color-scheme:dark){:root{--bg:#161e20;--panel:#202b2c;--ink:#f3f3ef;--muted:#c6d0ce;--rule:#536463;--accent:#93d5dc;--accent-ink:#13262c}}\n*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font:1rem/1.58 RS,Georgia,serif}\n@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}\na{color:inherit;text-underline-offset:.22em}a:focus-visible,summary:focus-visible{outline:3px solid var(--accent);outline-offset:4px}\nh1,h2,h3,p,ul,ol{margin:0}.wrap{width:min(72rem,calc(100% - 2.5rem));margin-inline:auto}.skip{position:absolute;left:1rem;top:-8rem;padding:.5rem 1rem;background:var(--panel)}.skip:focus{top:.5rem;z-index:4}\n.site-head{border-bottom:1px solid var(--rule);padding-block:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}\n.brand{font:700 1.32rem SG,sans-serif;letter-spacing:-.045em;text-decoration:none}.mark{display:inline-block;width:.76rem;height:.76rem;background:var(--accent);transform:rotate(45deg);margin-right:.65rem}\n.site-nav,.site-foot{font:500 .9rem SG,sans-serif}.site-nav{display:flex;gap:1rem 1.7rem;flex-wrap:wrap}.site-nav a{text-decoration:none}.site-nav a:hover,.site-nav a[aria-current=page]{text-decoration:underline;text-decoration-thickness:2px}\n.hero{padding-block:clamp(3rem,8vw,7.2rem)}.eyebrow{font:650 .77rem/1.4 SG,sans-serif;letter-spacing:.09em;text-transform:uppercase;color:var(--accent)}\nh1,h2,h3{font-family:SG,sans-serif;letter-spacing:-.038em;line-height:1.12}h1{font-size:clamp(2.85rem,7vw,6.25rem);font-weight:650;max-width:13ch;margin:.8rem 0 1.4rem}\nh2{font-size:clamp(1.85rem,4vw,3.3rem);font-weight:650;margin:.65rem 0 1rem;max-width:21ch}h3{font-size:clamp(1.3rem,2.2vw,1.6rem);margin-bottom:.5rem}\n.intro{font-size:clamp(1.1rem,2vw,1.35rem);max-width:42rem}.lead{font-size:1.06rem;max-width:42rem}\n.actions{display:flex;gap:.8rem 1.3rem;flex-wrap:wrap;margin-top:2rem}\n.action{display:inline-block;font:650 .98rem SG,sans-serif;text-decoration:none;border:1px solid var(--ink);padding:.8rem 1rem}\n.action.primary{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}.action:hover{text-decoration:underline}\n.aim{max-width:43rem;color:var(--muted);margin-top:3.2rem;padding-top:1.2rem;border-top:1px solid var(--rule);font-size:.94rem}\n.section{padding-block:clamp(3rem,6.5vw,5.5rem);border-top:1px solid var(--rule);scroll-margin-top:2rem}\n.cards,.directory{list-style:none;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin-top:2rem}\n.card,.directory li{padding:1.3rem;background:var(--panel);border:1px solid var(--rule);min-width:0}.card{display:flex;flex-direction:column;min-height:11rem;gap:.6rem}\n.card p{flex:1;color:var(--muted)}.card a,.directory a{font:650 1.04rem SG,sans-serif}\n.text-action{display:inline-block;font:650 1rem SG,sans-serif;margin-top:1.5rem}\n.split{display:grid;grid-template-columns:1fr 1.1fr;gap:2rem 4rem;align-items:start}.split p{font-size:1.08rem;max-width:36rem}\n.page-intro{padding-block:clamp(3rem,7vw,5.5rem)}.page-intro h1{font-size:clamp(2.6rem,6vw,4.8rem);max-width:18ch}\n.group{border-top:1px solid var(--rule);padding-block:2.4rem}.group h2{font-size:1.6rem}.directory{margin-top:1.3rem}\n.directory p{font-size:.94rem;color:var(--muted);margin-top:.4rem}.note{font-size:.91rem;color:var(--muted);max-width:45rem;margin-top:1.2rem}\n.steps{list-style:none;padding:0;display:grid;gap:1rem;margin-top:2rem;counter-reset:step}\n.steps li{counter-increment:step;background:var(--panel);padding:1.6rem 1.4rem 1.4rem 4.2rem;position:relative;border:1px solid var(--rule)}\n.steps li:before{content:counter(step,decimal-leading-zero);position:absolute;left:1.3rem;top:1.7rem;font:700 .86rem SG,sans-serif;color:var(--accent)}\n.steps .kind{font:600 .75rem SG,sans-serif;text-transform:uppercase;color:var(--muted);letter-spacing:.06em}\n.steps h2{font-size:1.6rem;margin:.2rem 0 .7rem}.steps p{max-width:48rem}.steps details,.terms{margin-top:1rem;color:var(--muted);font-size:.91rem}\ndetails summary{cursor:pointer;font:600 .94rem SG,sans-serif;color:var(--ink)}details p{margin-top:.65rem}\n.steps .source{font:600 .95rem SG,sans-serif;margin-top:1rem}\n.site-foot{border-top:1px solid var(--rule);padding-block:2rem 3rem;color:var(--muted);display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}.site-foot nav{display:flex;gap:1rem;flex-wrap:wrap}\n@media(max-width:700px){.cards,.directory,.split{grid-template-columns:1fr}.steps li{padding-left:3.4rem}.steps li:before{left:1rem}}\n";

function support(s){
 if(!s||!Number.isSafeInteger(s.monthlyUsd)||s.monthlyUsd<=0)throw new TypeError("positive whole-dollar monthly price");
 if(!/^https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+$/u.test(s.checkoutUrl||""))throw new TypeError("accepted exact Stripe checkout URL");
 if(s.contactUrl!=="/contact/#private-intake")throw new TypeError("support needs original private intake");
 return s;
}

function foundation(f){
 if(!f||!Array.isArray(f.stages)||f.stages.map(s=>s.id).join(",")!=="relationality,obsmetrologia,sign,agents")throw new TypeError("foundation order");
 for(const s of f.stages){
  for(const k of ["name","kind","account","limit","sourceLabel","sourceUrl"])if(typeof s[k]!=="string"||!s[k].trim())throw new TypeError("foundation requires "+k);
  let url;try{url=new URL(s.sourceUrl)}catch{throw new TypeError("foundation source URL")}
  const p=url.pathname.split("/").filter(Boolean);
  if(url.protocol!=="https:"||url.hostname!=="github.com"||url.search||url.hash||url.username||url.password||url.port||!["lenticule-science","red-cup-engineering"].includes(p[0])||p[2]!=="blob"||p.length<5)throw new TypeError("foundation source owner");
 }
 return f;
}

function validated(home,estate){
 const p=home.public;
 if(!p||typeof p!=="object")throw new TypeError("public page copy missing");
 for(const k of ["headline","intro","aim","workHeadline","workIntro","approachHeadline","approachIntro","approachAction","contactHeadline","contactIntro","workDirectoryHeadline","workDirectoryIntro","approachPageIntro","supportIntro"]){
  if(typeof p[k]!=="string"||!p[k].trim()||p[k].length>650||/[\u0000-\u001f\u007f]/u.test(p[k]))throw new TypeError("public copy "+k);
 }
 if(!home.description.includes("economic, political, and ecological volatility")||!p.aim.includes("economic, political, and ecological volatility"))throw new TypeError("mission order");
 if(!Array.isArray(p.featured)||p.featured.length!==5||new Set(p.featured.map(x=>x.host)).size!==5)throw new TypeError("featured projects");
 for(const [i,item] of p.featured.entries()){
  if(!estate.doors.includes(item.host)||!estate.nodes.some(n=>n.host===item.host))throw new TypeError("featured public door");
  if(!item.action||!item.summary||i>0&&p.featured[i-1].action.localeCompare(item.action,"en")>0)throw new TypeError("featured alphabetical action");
 }
 if(!Array.isArray(p.approachStages)||p.approachStages.length!==4||p.approachStages.some(s=>typeof s!=="string"||!s.trim()))throw new TypeError("approach phase copy");
 support(home.support);foundation(home.foundation);return p;
}

function link(node){
 const u=new URL(node.url||"https://"+node.host+"/");
 if(u.protocol!=="https:"||u.username||u.password)throw new TypeError("public project link");
 return u.href;
}

function nav(which){
 const items=[["approach","Approach"],["contact","Contact"],["work","Work"]];
 return `<header class="site-head wrap"><a class="brand" href="/" aria-label="561 Group home"><span class="mark" aria-hidden="true"></span>561 Group</a>
 <nav class="site-nav" aria-label="Main">${items.map(([id,name])=>`<a href="/${id}/"${id===which?' aria-current="page"':""}>${name}</a>`).join("")}</nav></header>`;
}

function foot(home){
 return `<footer class="site-foot wrap"><p>${esc(home.name)} · Est. ${esc(home.established)}</p><nav aria-label="Further information"><a href="/approach/">Approach</a><a href="/contact/">Contact</a><a href="/llms.txt">For agents</a><a href="/sitemap.txt">Sitemap</a><a href="/work/">Work</a></nav></footer>`;
}

function frame(home,estate,which,title,body){
 const orgId=home.origin+"/#organization",siteId=home.origin+"/#website",pagesId=home.origin+"/#public-pages",url=home.origin+(which==="home"?"/":"/"+which+"/");
 const pageDescription=which==="home"?home.public.intro:which==="work"?home.public.workDirectoryIntro:which==="approach"?home.public.approachPageIntro:home.description;
 const graph={"@context":"https://schema.org","@graph":[
 {"@type":"Organization","@id":orgId,name:home.name,alternateName:"561 Group",url:home.origin+"/",description:home.description,foundingDate:home.established,logo:home.origin+"/favicon.svg",contactPoint:{"@type":"ContactPoint",contactType:"service intake",url:home.origin+"/contact/"}},
 {"@type":"WebSite","@id":siteId,name:home.name,url:home.origin+"/",description:home.description,publisher:{"@id":orgId},about:{"@id":orgId},mainEntity:{"@id":pagesId}},
 {"@type":"ItemList","@id":pagesId,name:"561 Group public entry pages",itemListElement:estate.nodes.map((n,i)=>({"@type":"ListItem",position:i+1,item:{"@type":"WebPage",name:n.name,url:link(n),description:n.line}}))}
 ]};
 const ld=JSON.stringify(graph).replace(/</gu,"\\u003c");
 return `<!doctype html><html lang="en"><head>
 <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
 <title>${esc(title)}</title><meta name="description" content="${esc(pageDescription)}">
 <link rel="canonical" href="${esc(url)}"><meta name="theme-color" content="#f1eee6">
 <meta property="og:type" content="website"><meta property="og:site_name" content="${esc(home.name)}">
 <meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(pageDescription)}">
 <meta property="og:url" content="${esc(url)}"><meta name="twitter:card" content="summary">
 <link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="alternate" type="text/plain" title="For agents" href="/llms.txt">
 <link rel="alternate" type="application/json" title="Public project HTTP readings" href="/estate.json">
 <script type="application/ld+json">${ld}</script><style>${FIT_CSS}</style></head>
 <body><a class="skip" href="#main">Skip to content</a>${nav(which)}
 <main id="main">${body}</main>${foot(home)}</body></html>`;
}

export function renderIndex(home,estate){
 const p=validated(home,estate),s=support(home.support);
 const cards=p.featured.map(x=>{const n=estate.nodes.find(n=>n.host===x.host);return `<li class="card"><h3>${esc(n.name)}</h3><p>${esc(x.summary)}</p><a href="${esc(link(n))}">${esc(x.action)} →</a></li>`}).join("");
 const body=`<header class="wrap hero"><p class="eyebrow">A research & technology institution · Est. ${esc(home.established)}</p>
 <h1>${esc(p.headline)}</h1><p class="intro">${esc(p.intro)}</p>
 <div class="actions"><a class="action primary" href="#work">Explore the work →</a><a class="action" href="/contact/">Get in touch →</a></div>
 <p class="aim">${esc(p.aim)}</p></header>
 <section class="section wrap" id="work"><p class="eyebrow">Public projects</p><h2>${esc(p.workHeadline)}</h2><p class="lead">${esc(p.workIntro)}</p>
 <ul class="cards">${cards}</ul><a class="text-action" href="/work/">See the full project directory →</a></section>
 <section class="section wrap split" id="approach"><div><p class="eyebrow">Research & engineering</p><h2>${esc(p.approachHeadline)}</h2></div>
 <div><p>${esc(p.approachIntro)}</p><a class="text-action" href="/approach/">${esc(p.approachAction)} →</a></div></section>
 <section class="section wrap split" id="contact"><div><p class="eyebrow">Work with the Group</p><h2>${esc(p.contactHeadline)}</h2></div>
 <div><p>${esc(p.contactIntro)}</p><a class="text-action" href="/contact/">Contact the Group →</a></div></section>
 <section class="section wrap" id="support"><p class="eyebrow">Sustaining support</p><h2>Keep the research open.</h2><p class="lead">${esc(p.supportIntro)}</p>
 <div class="actions"><a class="action" href="${esc(s.checkoutUrl)}" rel="noopener noreferrer">Support public work · USD $${s.monthlyUsd}/month →</a></div>
 <details class="terms"><summary>Subscription and billing terms</summary><p>${esc(s.terms)} <a href="${esc(s.contactUrl)}">Request private billing help</a>.</p></details></section>`;
 return frame(home,estate,"home","561 Group · Research that becomes useful",body);
}

export function renderWork(home,estate){
 const p=validated(home,estate);
 const groups=[...estate.groups].sort((a,b)=>a.title.localeCompare(b.title,"en")).map(g=>{
  const nodes=estate.nodes.filter(n=>n.group===g.id).sort((a,b)=>a.name.localeCompare(b.name,"en"));
  return nodes.length?`<section class="group" aria-labelledby="g-${esc(g.id)}"><h2 id="g-${esc(g.id)}">${esc(g.title)}</h2>
  <ul class="directory">${nodes.map(n=>`<li><a href="${esc(link(n))}">${esc(n.name)} →</a><p>${esc(n.line)}</p></li>`).join("")}</ul></section>`:"";
 }).join("");
 const body=`<header class="page-intro wrap"><p class="eyebrow">Public work</p><h1>${esc(p.workDirectoryHeadline)}</h1>
 <p class="intro">${esc(p.workDirectoryIntro)}</p><p class="note">For dated HTTP readings, see <a href="/estate.json">the public estate</a>. An HTTP response does not prove service fulfillment.</p></header>
 <div class="wrap">${groups}</div><section class="section wrap"><h2>Can't find what you need?</h2>
 <p class="lead">Tell us what you're trying to do.</p><a class="text-action" href="/contact/">Get in touch →</a></section>`;
 return frame(home,estate,"work","Work · 561 Group",body);
}

export function renderApproach(home,estate){
 const p=validated(home,estate),f=foundation(home.foundation);
 const steps=f.stages.map((st,i)=>`<li><p class="kind">${esc(st.kind)}</p><h2>${esc(st.name)}</h2><p>${esc(p.approachStages[i])}</p>
 <p class="source"><a href="${esc(st.sourceUrl)}" rel="noopener noreferrer">Read the original source →</a></p>
 <details><summary>Read the technical context and evidence boundary</summary><p>${esc(st.account)}</p><p><strong>Evidence boundary:</strong> ${esc(st.limit)}</p></details></li>`).join("");
 const body=`<header class="page-intro wrap"><p class="eyebrow">Research → Technology → Practice</p>
 <h1>How our research becomes technology.</h1><p class="intro">${esc(p.approachPageIntro)}</p></header>
 <section class="section wrap"><h2>The work has a direction.</h2><p class="lead">${esc(p.approachIntro)}</p>
 <ol class="steps">${steps}</ol><p class="note">${esc(f.frontier)}</p></section>
 <section class="section wrap split"><div><h2>Then the world answers back.</h2></div>
 <div><p>What our software accomplishes—and where it fails—gives the next questions back to the research.</p><a class="text-action" href="/work/">Explore the projects →</a></div></section>`;
 return frame(home,estate,"approach","Approach · 561 Group",body);
}

export function renderLlms(home,estate){
 const p=validated(home,estate),s=support(home.support);
 const groups=[...estate.groups].sort((a,b)=>a.title.localeCompare(b.title,"en")).map(g=>{
  const n=estate.nodes.filter(x=>x.group===g.id).sort((a,b)=>a.name.localeCompare(b.name,"en"));
  return n.length?`### ${g.title}\n${n.map(x=>`- [${x.name}](${link(x)}): ${x.line}`).join("\n")}`:"";
 }).filter(Boolean).join("\n\n");
 return `# ${home.name}
${p.headline} ${p.intro}

${p.aim}

## Find the right page
- [Approach](${home.origin}/approach/): Original mathematics, software, and evidence boundaries.
- [Contact](${home.origin}/contact/): Public reports or a private email draft; neither grants permission to work.
- [Work](${home.origin}/work/): Projects and real entry links.

## Featured projects
${p.featured.map(x=>{const n=estate.nodes.find(n=>n.host===x.host);return `- [${n.name}](${link(n)}): ${x.summary}`}).join("\n")}

## Mathematical foundation
${p.approachIntro}
${foundation(home.foundation).stages.map((x,i)=>`${i+1}. [${x.name}](${x.sourceUrl}): ${p.approachStages[i]} Evidence boundary: ${x.limit}`).join("\n")}
${home.foundation.frontier}

## Public project directory
${groups}

## Machine endpoints
${estate.machine.map(m=>`- ${m.verb} [${m.url}](${m.url}) — ${m.what}`).join("\n")}
The [public estate](${home.origin}/estate.json) reports dated HTTP readings, not guaranteed service fulfillment.

## Support
${s.description}
[Voluntary USD $${s.monthlyUsd}/month sustaining support](${s.checkoutUrl}). ${s.terms} Billing help: ${new URL(s.contactUrl,home.origin).href}
`;
}

export function renderHumans(home,updated){
 return `/* OFFICES */\nAuthority is held by offices, not persons.\nNo persons are listed.\n\n/* SITE */\nLast update: ${updated}\nWebsite: ${home.origin}/\nSource: https://github.com/561-group/561.group\n`;
}

export function renderRobots(home){return serializeRobots(new URL("/sitemap.xml",home.origin).href);}

export function renderSitemap(home){return serializeSitemap(publicSitemapEntries(home));}

export function renderSitemapText(home){return serializeSitemapText(publicSitemapEntries(home));}

function publicSitemapEntries(home){return ["/","/approach/","/contact/","/work/"].map(p=>({loc:new URL(p,home.origin).href}));}
