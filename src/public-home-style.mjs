// The Group's original visual identity lives in apex-house-style.mjs.
// This is only the source-owned visitor-journey and commerce component layer.
// The 561 mark is compact; alarm red is reserved for real hazards and refusals.
// Keep research/culture on their actual pages, not in homepage display modules.
export const SITE_STYLES = String.raw`
.tufte-grid>#introduction {grid-column:span 12;min-height:0}
.tufte-grid>#frontiers {grid-column:span 12}
.tufte-grid>#paths,.tufte-grid>#explore,.tufte-grid>#trade,.tufte-grid>#companies {grid-column:span 12}
.tufte-grid>#services,.tufte-grid>#method,.tufte-grid>#agents,.tufte-grid>#support {grid-column:span 6}
.tufte-grid>#physical-world {grid-column:span 12}
.site-overline,.site-category,.site-provider,.site-step-number,.site-eyeline {
  font:650 .76rem/1.5 var(--house-mono);text-transform:uppercase;
  letter-spacing:.09em
}
#introduction .site-overline {color:var(--house-soft)}
.site-display {
  font:650 clamp(2rem,3.2vw,3.1rem)/1.14 var(--house-sans);
  letter-spacing:-.035em;text-wrap:balance;max-width:30ch;margin:.4rem 0 .85rem
}
.site-intro {font:400 clamp(1rem,1.3vw,1.2rem)/1.55 var(--house-slab);max-width:67ch}
.site-hero-note {font:400 .87rem/1.55 var(--house-slab);max-width:70ch;color:var(--house-soft)}
.site-actions {display:flex;gap:.55rem 1rem;flex-wrap:wrap;margin:1.5rem 0}
a.site-action {
  display:inline-flex;justify-content:center;align-items:center;
  font:650 .85rem/1.25 var(--house-sans);min-height:2.7rem;
  padding:.7rem 1rem;text-decoration:none;letter-spacing:0;
  border:1px solid var(--house-ink);background:var(--house-ink);
  color:var(--house-bone);border-radius:0
}
a.site-action--quiet {background:transparent;color:var(--house-ink)}
a.site-action:hover {outline:2px solid currentColor;outline-offset:3px}
.site-card-grid,.site-project-grid,.site-house-list,.site-service-grid {
  display:grid;list-style:none;padding:0!important;margin:0;gap:clamp(.7rem,1.8vw,1.5rem)
}
.site-card-grid {grid-template-columns:repeat(2,minmax(0,1fr))}
.site-card-grid--three,.site-project-grid {grid-template-columns:repeat(3,minmax(0,1fr))}
.site-service-grid,.site-house-list {grid-template-columns:repeat(2,minmax(0,1fr))}
.site-card,.site-project,.site-house-list li {
  display:flex;flex-direction:column;min-width:0;gap:.65rem;
  padding:clamp(.85rem,1.3vw,1.3rem);border:1px solid var(--house-rule);
  border-top:1px solid var(--house-rule);background:transparent
}
.site-card h3,.site-project h3,.site-house-list strong {
  font:650 clamp(1.05rem,1.35vw,1.3rem)/1.3 var(--house-sans);
  letter-spacing:-.015em;margin:0
}
.site-card p,.site-project p,.site-house-list p {
  font:400 .94rem/1.55 var(--house-slab);margin:.2rem 0 .7rem
}
.site-card a,.site-project a,.site-house-list a,
.site-service a {font-weight:700;text-underline-offset:.18em}
.site-card a:last-child {margin-top:auto}
.site-card .site-category {color:var(--house-soft)}
.site-card .site-category::before {content:none}
.site-section-lead {font:400 clamp(1.07rem,1.5vw,1.27rem)/1.55 var(--house-slab);margin:0 0 1.45rem}
.site-service {border-top:1px solid var(--house-rule);padding:1rem 0;min-width:0}
.site-service h3 {font:650 clamp(1.08rem,1.5vw,1.3rem)/1.28 var(--house-sans);margin:.5rem 0}
.site-service p {font-size:.96rem;line-height:1.5;margin:.5rem 0}
.site-service .site-provider {color:var(--house-witness)}
.site-service .site-example {font-size:.88rem;color:var(--house-soft)}
.site-steps {display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.3rem;list-style:none;padding:0!important}
.site-step {border-top:1px solid var(--house-rule);padding-top:1rem}
.site-step h3 {font:700 1.1rem/1.2 var(--house-sans);margin:.5rem 0}
.site-step p {font:.9rem/1.5 var(--house-slab)}
.site-step-number {color:var(--house-witness)}
.site-muted {font:.86rem/1.55 var(--house-mono);color:var(--house-soft)}
.site-quote {font:500 clamp(1.06rem,1.5vw,1.4rem)/1.42 var(--house-slab);max-width:60ch}
.site-inline-list {display:flex;flex-wrap:wrap;gap:1rem;list-style:none;padding:0!important}
.site-endpoints {list-style:none;padding:0!important;margin:0}
.site-endpoints li {
  display:grid;grid-template-columns:4.7rem minmax(0,1fr);
  gap:.2rem .7rem;padding:.75rem 0;border-bottom:1px solid var(--house-rule)
}
.site-endpoints .site-method {font:700 .76rem/1.4 var(--house-mono);color:var(--house-witness)}
.site-endpoints a,.site-endpoints code {overflow-wrap:anywhere}
.site-endpoints p {grid-column:2;margin:0;font-size:.89rem;line-height:1.5}
.site-directory {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.2rem}
.site-directory h3 {font:700 1.2rem/1.2 var(--house-sans)}
.site-directory ul {padding-left:1rem}
.site-directory li {margin:.6rem 0}
.site-directory span {display:block;font:.84rem/1.45 var(--house-mono);color:var(--house-soft)}
#frontiers {border-top:1px solid var(--house-rule)}
#frontiers header h2 {font:650 clamp(1.35rem,2.1vw,2.05rem)/1.25 var(--house-sans);
  letter-spacing:-.025em;text-transform:none;max-width:36ch}
.site-frontier-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(1rem,2vw,2rem);margin:1.8rem 0}
.site-frontier {min-width:0;border-top:1px solid var(--house-rule);padding:1rem 0}
.site-frontier:nth-child(2) {border-color:var(--house-rule)}
.site-frontier h3 {font:650 clamp(1.12rem,1.7vw,1.55rem)/1.25 var(--house-sans);
  letter-spacing:-.025em;margin:0 0 .7rem;max-width:35ch}
.site-frontier .site-frontier-thesis {font:400 clamp(1.05rem,1.35vw,1.2rem)/1.5 var(--house-slab)}
.site-frontier .site-frontier-present {font-size:.94rem;line-height:1.55}
.site-frontier .site-frontier-boundary {font:.84rem/1.55 var(--house-mono);
  color:var(--house-soft);border-top:1px solid var(--house-rule);padding-top:1rem;margin-top:1rem}
.site-frontier-throughline {font:700 clamp(1.05rem,1.5vw,1.35rem)/1.4 var(--house-sans);max-width:66ch}
@media(max-width:1050px){
  .site-card-grid {grid-template-columns:repeat(2,minmax(0,1fr))}
  .site-project-grid {grid-template-columns:repeat(2,minmax(0,1fr))}
  .site-steps {grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:760px){
  .tufte-grid>.tufte-tile{grid-column:span 12!important}
  .site-service-grid,.site-house-list,.site-frontier-grid,.site-directory {grid-template-columns:1fr}
  .site-display {font-size:clamp(1.85rem,6.2vw,2.65rem)}
}
@media(max-width:430px){
  .site-card-grid,.site-card-grid--three,.site-project-grid,.site-steps{grid-template-columns:1fr}
  .site-actions{flex-direction:column}
  a.site-action{width:100%}
  .site-endpoints li{grid-template-columns:1fr}
  .site-endpoints p{grid-column:1}
}
@media(prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  a.site-action{transition:none}
}
@media print{
  .site-frontier,.site-project,.site-card{break-inside:avoid}
  a.site-action{background:transparent!important;color:#000!important}
}
`;
