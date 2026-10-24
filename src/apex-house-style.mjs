// Projection-only adapter for the 561 Group visual identity in the original
// TUFTE/LivingWebServer homepage. Visual source: 561 Group Visual Design
// Bible v0.4 candidate (especially the apex habitat), existing
// 561-group-website-theme src/index.mts, and the earlier apex src/render.mjs.
// These are recovered design precedents, not newly-adopted institutional law.
// No new renderer, external fonts, CDNs, decorative stock imagery or site router.
export const HOUSE_STYLES = String.raw`
@font-face{font-family:"Space Grotesk";src:url("/fonts/space-grotesk.woff2") format("woff2");font-weight:300 700;font-display:swap}
@font-face{font-family:"Roboto Slab";src:url("/fonts/roboto-slab.woff2") format("woff2");font-weight:300 800;font-display:swap}
@font-face{font-family:"JetBrains Mono";src:url("/fonts/jetbrains-mono.woff2") format("woff2");font-weight:400 700;font-display:swap}
:root{
  color-scheme:light;
  --house-bone:#F2EAD8;--house-ink:#0A0A0A;
  --house-witness:#3D5588;--house-alarm:#FF4530;
  --house-soft:#494742;--house-rule:#CDC6B7;
  --house-dark:#120C02;
  --house-sans:"Space Grotesk","Helvetica Neue",Arial,sans-serif;
  --house-slab:"Roboto Slab",Rockwell,Georgia,serif;
  --house-mono:"JetBrains Mono",ui-monospace,"Courier New",monospace;
  --tufte-bg:var(--house-bone);--tufte-surface:var(--house-bone);
  --tufte-ink:var(--house-ink);--tufte-muted:var(--house-soft);
  --tufte-line:var(--house-rule);--tufte-accent:var(--house-witness);
  --tufte-radius:0;--tufte-gap:clamp(1rem,2.4vw,2rem);
}
html{scroll-behavior:smooth;scroll-padding-top:1.2rem}
body{
  background-color:var(--house-bone);
  background-image:none;
  color:var(--house-ink);font-family:var(--house-slab);
  line-height:1.6;overflow-wrap:break-word;
}
::selection{background:var(--house-witness);color:#fff}
.tufte-shell{width:min(1320px,100%);max-width:1320px;padding:clamp(1rem,3.6vw,3.5rem);margin-inline:auto}
.tufte-masthead{
  display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;
  gap:.6rem 1.3rem;border-top:1px solid var(--house-rule);
  border-bottom:1px solid var(--house-rule);padding:1rem 0;
  margin-bottom:clamp(1rem,2vw,2rem);background:transparent;
}
.tufte-masthead::before{
  content:"561";display:block;flex-basis:auto;width:auto;order:-1;
  font:700 clamp(3rem,5.6vw,4.75rem)/1 var(--house-sans);
  letter-spacing:-.075em;margin:0 1rem 0 0;padding:.16rem 0 0;
  border-top:8px solid var(--house-ink);
  color:var(--house-ink);user-select:none;pointer-events:none;
}
.tufte-masthead h1{
  font:650 clamp(1.1rem,1.65vw,1.55rem)/1.2 var(--house-sans);
  letter-spacing:-.025em;text-transform:none;color:var(--house-ink);
}
.tufte-eyebrow,.tufte-subtitle{
  font-family:var(--house-mono);font-size:clamp(.66rem,.83vw,.8rem);
  letter-spacing:.1em;text-transform:uppercase;color:var(--house-soft);
  max-width:42rem;line-height:1.55;
}
[data-tufte-navigation]{
  display:flex;flex-wrap:wrap;gap:.3rem 1.1rem;
  justify-content:flex-end;align-items:center;
  font:600 clamp(.72rem,.85vw,.84rem)/1.5 var(--house-mono);
  text-transform:uppercase;letter-spacing:.025em;
}
[data-tufte-navigation] a{
  display:inline-block;padding:.25rem 0;color:var(--house-ink);
  border-bottom:2px solid transparent;text-decoration:none;
}
[data-tufte-navigation] a:hover,[data-tufte-navigation] a[aria-current=page]{
  border-color:var(--house-ink);
}
.tufte-grid{gap:clamp(1rem,2.4vw,2rem);align-items:start}
.tufte-grid>.tufte-tile{
  min-width:0;background:transparent;color:var(--house-ink);
  border:0;border-top:2px solid var(--house-ink);border-radius:0;box-shadow:none;
  padding:clamp(.8rem,1.6vw,1.4rem) 0 clamp(1.6rem,2.4vw,2.5rem);
}
.tufte-tile header{
  border:0;border-bottom:1px solid var(--house-rule);
  padding:0 0 .8rem;margin:0 0 1rem;
}
.tufte-tile h2{
  font:700 .79rem/1.5 var(--house-mono);letter-spacing:.105em;
  text-transform:uppercase;color:inherit;
}
.tufte-tile-body{
  font:400 clamp(1rem,1.16vw,1.17rem)/1.6 var(--house-slab);
  overflow-wrap:anywhere;
}
.tufte-tile-body p{max-width:45rem;margin:0 0 1rem}
.tufte-tile-body ul{padding-left:1.25rem}
.tufte-tile-body li{padding:.15rem 0}
.tufte-tile-body a{color:var(--house-witness);text-decoration:underline;text-underline-offset:.18em;text-decoration-thickness:1px}
.tufte-grid>#introduction{
  grid-column:span 12;min-height:0;background:transparent;color:var(--house-ink);
  border-top:1px solid var(--house-rule);
  padding:clamp(.75rem,1.5vw,1.5rem) 0;
}
#introduction h2{font:650 .81rem/1.5 var(--house-mono);letter-spacing:.02em}
#introduction header{border-bottom-color:var(--house-rule)}
#introduction .tufte-tile-body p:first-child{
  font:650 .74rem/1.5 var(--house-mono);max-width:38rem;
}
#introduction a{color:var(--house-ink)}
.tufte-grid>#contact{grid-column:span 4;border-top:8px solid var(--house-witness)}
.tufte-grid>#explore,.tufte-grid>#physical-world{grid-column:span 12}
#explore .tufte-tile-body ul{
  list-style:none;padding:0;display:grid;
  grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));
  gap:0;border-top:1px solid var(--house-rule);
}
#explore .tufte-tile-body li{
  border-bottom:1px solid var(--house-rule);padding:clamp(.8rem,2vw,1.5rem) 1rem;
}
#explore .tufte-tile-body li a{
  display:block;font:650 clamp(1.02rem,1.45vw,1.24rem)/1.32 var(--house-sans);
  color:var(--house-ink);text-decoration:none;letter-spacing:-.03em;
}
#explore .tufte-tile-body li a:hover{text-decoration:underline;text-decoration-thickness:2px}
#explore .tufte-tile-body li p{font:400 .95rem/1.5 var(--house-slab);color:var(--house-soft);margin:.65rem 0 0}
#physical-world{
  border-top:1px solid var(--house-rule);
  border-bottom:1px solid var(--house-rule);padding:clamp(1rem,2vw,2rem) 0;
}
#physical-world h2{
  max-width:46ch;font:650 clamp(1.5rem,2.5vw,2.25rem)/1.17 var(--house-sans);
  letter-spacing:-.025em;text-transform:none;
}
#physical-world .tufte-tile-body p:first-child{
  font:400 clamp(1.04rem,1.4vw,1.24rem)/1.48 var(--house-slab);max-width:46rem;
}
#physical-world .tufte-tile-body p:last-child{
  font:400 .82rem/1.65 var(--house-mono);max-width:62rem;color:var(--house-soft);
}
.tufte-grid>#support,.tufte-grid>#companies{grid-column:span 6}
.tufte-footer{
  margin-top:clamp(1.5rem,3vw,3rem);padding:1.2rem 0;
  border-top:1px solid var(--house-rule);background:transparent;
  color:var(--house-ink);border-radius:0;
  font:400 .75rem/1.7 var(--house-mono);
}
.tufte-footer a{color:var(--house-witness)}
:where(a,button,input,select,textarea):focus-visible{
  outline:3px solid var(--house-witness)!important;outline-offset:4px!important;
}
@media(max-width:780px){
  .tufte-masthead{align-items:flex-start}
  .tufte-masthead::before{font-size:clamp(2.7rem,10vw,4rem)}
  [data-tufte-navigation]{justify-content:flex-start}
  .tufte-grid>.tufte-tile{grid-column:span 12!important}
  #introduction{min-height:unset!important}
  .tufte-shell{padding:1rem}
  #explore .tufte-tile-body ul{grid-template-columns:1fr}
}
/* The six real visitor paths should form two intentional rows on phones,
   not strand Contact by itself after five tiny navigation links. */
@media(max-width:430px){
  [data-tufte-navigation]{
    display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
    width:100%;column-gap:.7rem;row-gap:.15rem;justify-content:stretch;
  }
  [data-tufte-navigation] a{
    display:inline-flex;align-items:center;min-height:2.5rem;
  }
}
@media(prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  *,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important}
}
@media(prefers-color-scheme:dark){
  :root{color-scheme:dark;--house-ink:#F2EAD8;--house-bone:#120C02;
    --house-soft:#C3BCAA;--house-rule:#494035;--house-witness:#A4B8EF;
    --tufte-bg:var(--house-bone);--tufte-surface:var(--house-bone);
    --tufte-ink:var(--house-ink);--tufte-muted:var(--house-soft);
    --tufte-line:var(--house-rule);--tufte-accent:var(--house-witness)}
  ::selection{background:#A4B8EF;color:#120C02}
  #introduction{background:transparent;color:var(--house-ink)}
  #introduction header{border-bottom-color:var(--house-rule)}
  #introduction a{color:var(--house-ink)}
  .tufte-footer{background:transparent;color:var(--house-ink)}
  .tufte-footer a{color:var(--house-witness)}
}
@media print{
  html{color-scheme:light}
  body{background:#fff!important;color:#000!important}
  .tufte-masthead::before{color:#000}
  .tufte-tile,.tufte-footer,#introduction{background:#fff!important;color:#000!important}
  .tufte-grid>.tufte-tile{break-inside:avoid}
}
`;
