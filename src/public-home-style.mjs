// The Group's original visual identity lives in apex-house-style.mjs.
// This is ONLY the four-journey, two-frontier and commerce component layer.
// It does not override the house's colors, typography, giant 561 masthead,
// dark mode, print behavior, responsive base, or TUFTE renderer.
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
#introduction .site-overline {color:var(--house-alarm)}
.site-display {
  font:700 clamp(2.65rem,6.3vw,6.4rem)/.97 var(--house-sans);
  letter-spacing:-.058em;text-wrap:balance;max-width:17ch;margin:.35rem 0 1.3rem
}
.site-intro {font:400 clamp(1.15rem,1.8vw,1.55rem)/1.5 var(--house-slab);max-width:67ch}
.site-hero-note {font:400 .92rem/1.55 var(--house-mono);max-width:70ch;opacity:.92}
.site-actions {display:flex;gap:.55rem 1rem;flex-wrap:wrap;margin:1.5rem 0}
a.site-action {
  display:inline-flex;justify-content:center;align-items:center;
  font:700 .84rem/1.2 var(--house-mono);min-height:2.9rem;
  padding:.9rem 1.1rem;text-decoration:none;letter-spacing:.01em;
  border:2px solid currentColor;background:var(--house-alarm);
  color:#0A0A0A;border-radius:0
}
a.site-action--quiet {background:transparent;color:inherit}
a.site-action:hover {outline:2px solid currentColor;outline-offset:3px}
.site-card-grid,.site-project-grid,.site-house-list,.site-service-grid {
  display:grid;list-style:none;padding:0!important;margin:0;gap:clamp(.7rem,1.8vw,1.5rem)
}
.site-card-grid {grid-template-columns:repeat(4,minmax(0,1fr))}
.site-card-grid--three,.site-project-grid {grid-template-columns:repeat(3,minmax(0,1fr))}
.site-service-grid,.site-house-list {grid-template-columns:repeat(2,minmax(0,1fr))}
.site-card,.site-project,.site-house-list li {
  display:flex;flex-direction:column;min-width:0;gap:.65rem;
  padding:1.1rem;border:1px solid var(--house-rule);
  border-top:4px solid var(--house-ink);background:transparent
}
.site-card h3,.site-project h3,.site-house-list strong {
  font:700 clamp(1.1rem,1.5vw,1.55rem)/1.2 var(--house-sans);
  letter-spacing:-.03em;margin:0
}
.site-card p,.site-project p,.site-house-list p {
  font:400 .94rem/1.55 var(--house-slab);margin:.2rem 0 .7rem
}
.site-card a,.site-project a,.site-house-list a,
.site-service a {font-weight:700;text-underline-offset:.18em}
.site-card a:last-child {margin-top:auto}
.site-card .site-category {color:var(--house-witness)}
.site-card .site-category::before {content:"■ "}
.site-section-lead {font:400 clamp(1.07rem,1.5vw,1.27rem)/1.55 var(--house-slab);margin:0 0 1.45rem}
.site-service {border-top:4px solid var(--house-ink);padding:1rem 0;min-width:0}
.site-service h3 {font:700 clamp(1.18rem,1.8vw,1.55rem)/1.15 var(--house-sans);margin:.5rem 0}
.site-service p {font-size:.96rem;line-height:1.5;margin:.5rem 0}
.site-service .site-provider {color:var(--house-witness)}
.site-service .site-example {font-size:.88rem;color:var(--house-soft)}
.site-steps {display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.3rem;list-style:none;padding:0!important}
.site-step {border-top:3px solid var(--house-ink);padding-top:1rem}
.site-step h3 {font:700 1.1rem/1.2 var(--house-sans);margin:.5rem 0}
.site-step p {font:.9rem/1.5 var(--house-slab)}
.site-step-number {color:var(--house-witness)}
.site-muted {font:.86rem/1.55 var(--house-mono);color:var(--house-soft)}
.site-quote {font:500 clamp(1.25rem,2.3vw,2.15rem)/1.35 var(--house-slab);max-width:42ch}
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
#frontiers {border-top:8px solid var(--house-alarm)}
#frontiers header h2 {font:700 clamp(1.75rem,3.6vw,3.7rem)/1.06 var(--house-sans);
  letter-spacing:-.047em;text-transform:none;max-width:24ch}
.site-frontier-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(1rem,2vw,2rem);margin:1.8rem 0}
.site-frontier {min-width:0;border-top:6px solid var(--house-ink);padding:1.4rem 0}
.site-frontier:nth-child(2) {border-color:var(--house-alarm)}
.site-frontier h3 {font:700 clamp(1.35rem,2.3vw,2.45rem)/1.09 var(--house-sans);
  letter-spacing:-.045em;margin:0 0 1rem;max-width:19ch}
.site-frontier .site-frontier-thesis {font:400 clamp(1.05rem,1.35vw,1.2rem)/1.5 var(--house-slab)}
.site-frontier .site-frontier-present {font-size:.94rem;line-height:1.55}
.site-frontier .site-frontier-boundary {font:.84rem/1.55 var(--house-mono);
  color:var(--house-soft);border-top:1px solid var(--house-rule);padding-top:1rem;margin-top:1rem}
.site-frontier-throughline {font:700 clamp(1.05rem,1.5vw,1.35rem)/1.4 var(--house-sans);max-width:66ch}
/* One source-owned editorial work-score. Symbols are illustrative, not logos.
   Source words and company identities come from data/frontdoor.json + data/home.json.
   Restrained existing House colors; no new palettes, fonts, images or CDN. */
.tufte-grid>#work-folio {
  grid-column:span 12;
  border-top:8px solid var(--house-witness);
  border-bottom:3px solid var(--house-ink);
  padding:clamp(1.4rem,3vw,2.5rem) 0 clamp(2rem,4vw,3rem);
}
#work-folio header {
  border:0;
  border-bottom:1px solid var(--house-rule);
  padding:0 0 .8rem;
  margin:0 0 clamp(1rem,2vw,2rem)
}
#work-folio h2 {
  font:700 clamp(2.45rem,5.9vw,5.7rem)/.96 var(--house-sans);
  letter-spacing:-.065em;text-transform:none;
  text-wrap:balance;max-width:16ch
}
.site-folio {margin:0;padding:0}
.site-folio-eyebrow {
  margin:0 0 .65rem;
  font:700 .76rem/1.4 var(--house-mono);
  letter-spacing:.11em;text-transform:uppercase;
  color:var(--house-witness)
}
.site-folio-introduction {
  max-width:55ch;margin:0 0 clamp(1.25rem,3vw,2.5rem);
  font:400 clamp(1.15rem,1.72vw,1.5rem)/1.42 var(--house-slab);
  text-wrap:pretty
}
.site-folio-grid {
  display:grid;grid-template-columns:repeat(4,minmax(0,1fr));
  gap:2px;background:var(--house-ink);
  border:2px solid var(--house-ink);
  margin:0 0 .85rem
}
.site-folio-movement {
  min-width:0;display:flex;flex-direction:column;
  gap:.9rem;padding:clamp(1rem,1.8vw,1.55rem);
  background:var(--house-bone);color:var(--house-ink);
  min-height:clamp(25rem,36vw,31rem);
  transition:background-color .32s ease
}
.site-folio-movement:nth-child(even) {
  background:var(--house-ink);color:var(--house-bone)
}
.site-folio-movement:hover,.site-folio-movement:focus-within {
  box-shadow:inset 0 0 0 4px var(--house-witness)
}
.site-folio-meta {
  display:grid;grid-template-columns:minmax(0,1fr);gap:.5rem;
  padding-bottom:.6rem;border-bottom:1px solid currentColor
}
.site-folio-number {
  font:700 clamp(3.5rem,7vw,7rem)/.83 var(--house-sans);
  letter-spacing:-.115em;display:block;
  padding-right:.15em
}
.site-folio-register {
  display:block;width:100%;min-width:0;max-width:none;
  font:700 .67rem/1.3 var(--house-mono);
  letter-spacing:.045em;text-transform:uppercase;text-align:right;
  white-space:nowrap;overflow-wrap:normal;word-break:normal;
  margin-bottom:.2rem
}
.site-folio-figure {
  display:block;width:100%;height:clamp(7rem,10.8vw,10.5rem);
  overflow:visible;
  color:var(--house-witness);
  margin:.25rem 0
}
.site-folio-structure {
  fill:none;stroke:currentColor;stroke-width:2.35;
  stroke-linecap:round;stroke-linejoin:round
}
.site-folio-seed {
  fill:var(--house-witness);stroke:none
}
.site-folio-current {
  fill:none;stroke:currentColor;stroke-width:2.2;
  stroke-dasharray:8 11;
  animation:site-folio-tide 15s linear infinite
}
.site-folio-movement:nth-child(2) .site-folio-current {animation-delay:-3s}
.site-folio-movement:nth-child(3) .site-folio-current {animation-delay:-6s}
.site-folio-movement:nth-child(4) .site-folio-current {animation-delay:-9s}
@keyframes site-folio-tide {
  to {stroke-dashoffset:-228}
}
.site-folio-movement h3 {
  font:700 clamp(1.55rem,2.2vw,2.35rem)/1.06 var(--house-sans);
  letter-spacing:-.043em;max-width:14ch;
  text-wrap:balance;
  margin:0
}
.site-folio-verse {
  font:400 clamp(.96rem,1.16vw,1.08rem)/1.5 var(--house-slab);
  margin:0 0 auto;
  max-width:25ch
}
.site-folio-owner {
  font:700 .72rem/1.5 var(--house-mono);
  letter-spacing:.045em;text-transform:uppercase;
  border-top:1px solid currentColor;
  padding-top:.75rem;margin-top:1.1rem
}
a.site-folio-link {
  display:block;width:fit-content;max-width:100%;
  padding:.45rem 0;margin:0;
  color:inherit;
  font:700 .8rem/1.4 var(--house-mono);
  text-decoration:underline;text-underline-offset:.25em
}
a.site-folio-link:hover {text-decoration-thickness:3px}
a.site-folio-link:focus-visible {
  outline:3px solid var(--house-witness)!important;
  outline-offset:4px!important
}
.site-folio-boundary {
  max-width:76ch;padding:.35rem 0 0;
  font:400 .72rem/1.6 var(--house-mono);
  color:var(--house-soft);letter-spacing:.005em
}



/* The original medium is the public service. The source-owned 404→200 witness
   cannot be confused with a customer, cultural or audience endorsement. */
.site-folio-proof {
  border:2px solid var(--house-ink);
  background:var(--house-ink);color:var(--house-bone);
  padding:clamp(1.15rem,3vw,2.4rem);
  margin:clamp(1.4rem,2.9vw,2.5rem) 0 .8rem
}
.site-folio-proof-eyebrow {
  color:var(--house-witness);
  font:700 .74rem/1.4 var(--house-mono);
  text-transform:uppercase;letter-spacing:.10em;
  margin:0 0 .5rem
}
.site-folio-proof h3 {
  margin:0 0 1.25rem;
  max-width:none;
  font:700 clamp(2.3rem,5vw,5rem)/1.03 var(--house-sans);
  letter-spacing:-.055em;
  text-wrap:balance
}
.site-folio-proof-transition {
  display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);
  align-items:stretch;gap:clamp(.5rem,2vw,2rem);
  margin:0 0 clamp(1.2rem,2vw,2rem)
}
.site-folio-proof-state {
  display:flex;flex-direction:column;justify-content:space-between;
  min-width:0;
  border-block:2px solid currentColor;
  padding:.4rem .2rem .65rem
}
.site-folio-proof-state>span {
  display:block;min-width:0;
  font:700 clamp(3.6rem,13vw,12.5rem)/.94 var(--house-sans);
  letter-spacing:-.105em;font-variant-numeric:tabular-nums;
  overflow:visible
}
.site-folio-proof-before>span {color:var(--house-alarm)}
.site-folio-proof-after>span {color:var(--house-witness)}
.site-folio-proof-arrow {
  align-self:center;
  font:500 clamp(1.6rem,4vw,4rem)/1 var(--house-mono);
  color:var(--house-witness)
}
.site-folio-proof-state p {
  margin:.15rem 0;
  font:650 clamp(.66rem,.85vw,.83rem)/1.5 var(--house-mono);
  color:var(--house-bone);
}
.site-folio-proof-explanation {
  display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
  gap:clamp(1rem,2vw,2rem);
  margin:1.2rem 0 1.5rem
}
.site-folio-proof-explanation p {
  margin:0 0 .75rem;
  font:400 clamp(1.02rem,1.45vw,1.35rem)/1.48 var(--house-slab);
}
.site-folio-proof-incident {opacity:.82}
a.site-folio-proof-action {
  display:inline-flex;padding:.8rem .9rem;margin:.35rem 0;
  color:var(--house-ink);background:var(--house-bone);
  font:700 .87rem/1.4 var(--house-mono);
  text-decoration:underline;text-underline-offset:.23em;
  border:2px solid var(--house-bone)
}
a.site-folio-proof-action:hover,a.site-folio-proof-action:focus-visible {
  outline:3px solid var(--house-witness);outline-offset:4px
}
.site-folio-proof-sources {
  display:flex;gap:.55rem 1.6rem;flex-wrap:wrap;
  border-top:1px solid var(--house-bone);
  padding-top:1rem
}
a.site-folio-proof-source {
  color:var(--house-bone);
  font:650 .76rem/1.5 var(--house-mono);
  text-decoration:underline;text-underline-offset:.25em
}
.site-folio-proof-boundary {
  color:var(--house-bone);opacity:.72;
  font:400 .72rem/1.55 var(--house-mono);
  margin:1.25rem 0 0;max-width:80ch
}

@media(max-width:1050px){
  .site-card-grid {grid-template-columns:repeat(2,minmax(0,1fr))}
  .site-project-grid {grid-template-columns:repeat(2,minmax(0,1fr))}
  .site-steps {grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:1050px) and (min-width:761px){
  .site-folio-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .site-folio-movement{min-height:26rem}
}
@media(max-width:760px){
  .tufte-grid>.tufte-tile{grid-column:span 12!important}
  .site-service-grid,.site-house-list,.site-frontier-grid,.site-directory {grid-template-columns:1fr}
  .site-display {font-size:clamp(2.6rem,10vw,4.4rem)}
  .site-folio-grid{grid-template-columns:1fr}
  .site-folio-movement{min-height:unset}
  .site-folio-figure{height:8.4rem;max-width:19rem}
  .site-folio-movement h3,.site-folio-verse{max-width:unset}
  .site-folio-proof-transition{gap:.4rem}
  .site-folio-proof-state>span{font-size:clamp(3.3rem,17vw,7rem)}
  .site-folio-proof-explanation{grid-template-columns:1fr}
  .site-folio-proof h3{font-size:clamp(2.2rem,10vw,4rem)}
  .site-folio-proof-action{max-width:100%}

}
@media(max-width:430px){
  .site-card-grid,.site-card-grid--three,.site-project-grid,.site-steps{grid-template-columns:1fr}
  .site-actions{flex-direction:column}
  a.site-action{width:100%}
  .site-endpoints li{grid-template-columns:1fr}
  .site-endpoints p{grid-column:1}
}
@media(prefers-reduced-motion:reduce){
  .site-folio-current{animation:none}
  .site-folio-movement{transition:none}
  html{scroll-behavior:auto}
  a.site-action{transition:none}
}
@media print{
  .site-folio-current{animation:none}
  .site-folio-movement{background:#fff!important;color:#000!important;break-inside:avoid}
  .site-folio-grid{background:#000!important}
  .site-folio-proof{background:#fff!important;color:#000!important;border:2px solid #000!important}
  .site-folio-proof-state>span,.site-folio-proof-arrow{color:#000!important}
  .site-folio-proof-state p,a.site-folio-proof-source,.site-folio-proof-boundary{color:#000!important}
  .site-frontier,.site-project,.site-card{break-inside:avoid}
  a.site-action{background:transparent!important;color:#000!important}
}
`;
