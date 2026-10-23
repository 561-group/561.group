export const SITE_STYLES = String.raw`
:root {
  color-scheme: light;
  --tufte-bg:#f4f4ee;--tufte-surface:#fffcf6;--tufte-ink:#102b36;
  --tufte-muted:#455e66;--tufte-line:#bccbc9;--tufte-accent:#006b64;
  --tufte-gap:1rem;--tufte-radius:0;
  --site-ink:#102b36;--site-paper:#fffcf6;--site-sun:#ddf1a3;
  --site-dim:#607579;--site-rule:#bacbc9;
}
html { scroll-behavior:smooth; scroll-padding-top:1.25rem }
body { background:#f4f4ee; color:var(--site-ink); font-family:system-ui,-apple-system,"Segoe UI",sans-serif }
.tufte-shell { width:min(1280px,100%); padding:clamp(1rem,2.5vw,2.75rem) }
.tufte-masthead { align-items:flex-end; gap:2rem; border-bottom:2px solid var(--site-ink); padding:0 0 1.25rem; margin-bottom:1.25rem }
.tufte-masthead h1 { font:700 clamp(2rem,4vw,3rem)/1.03 ui-serif,Georgia,serif; letter-spacing:-.05em; color:var(--site-ink) }
.tufte-eyebrow { font-size:.72rem; letter-spacing:.11em; color:var(--tufte-accent) }
.tufte-subtitle { font-size:clamp(.92rem,1.3vw,1.05rem); color:#3e5258; max-width:35rem }
[data-tufte-navigation] { display:flex;flex-wrap:wrap;gap:.25rem 1rem;align-items:center;justify-content:flex-end;line-height:1.3 }
[data-tufte-navigation] a { font-size:.89rem; font-weight:600; padding:.35rem .1rem; border-bottom:2px solid transparent; text-decoration:none; color:#173f47 }
[data-tufte-navigation] a:hover, [data-tufte-navigation] a[aria-current=page] { border-color:var(--tufte-accent) }
.tufte-grid { align-items:stretch; gap:1rem; grid-auto-flow:row }
.tufte-tile { padding:clamp(1.05rem,2.2vw,1.8rem);border:1px solid var(--site-rule);box-shadow:none;background:var(--site-paper); min-width:0 }
.tufte-tile header { border-bottom:1px solid var(--site-rule);padding-bottom:.6rem;margin-bottom:1rem }
.tufte-tile h2 { color:#456064;letter-spacing:.13em;font-size:.77rem;text-transform:uppercase }
.tufte-tile-body { font-size:1rem; line-height:1.6; overflow-wrap:anywhere }
.tufte-tile-body a {text-underline-offset:.18em; text-decoration-thickness:1px}
.tufte-tile-body p {max-width:70ch}
.tufte-tile-body ul,.tufte-tile-body ol {padding-inline-start:1.2em}
.tufte-tile-body li + li {margin-top:.4rem}
.tufte-footer {margin-top:2.25rem;padding-top:1.25rem;border-top:2px solid var(--site-ink);font-size:.83rem;line-height:1.8}
.tufte-footer a { color:var(--tufte-accent) }
:is(a,button,input,select,textarea):focus-visible {outline:3px solid #f39339!important;outline-offset:3px!important}
.tufte-grid > #introduction, .tufte-grid > #lead { grid-column:span 12; background:var(--site-ink); color:#f8fcf8; border-color:var(--site-ink) }
#introduction h2, #lead h2 {color:var(--site-sun);border-color:#5a8184}
#introduction header,#lead header {border-color:#486970}
#introduction a,#lead a {color:#f5f7dc}
.site-overline {font:700 .72rem/1.6 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.13em;text-transform:uppercase;color:var(--tufte-accent);margin:0 0 .75rem}
#introduction .site-overline,#lead .site-overline {color:var(--site-sun)}
.site-display {font:700 clamp(2.7rem,5.5vw,5.7rem)/1.02 ui-serif,Georgia,serif;letter-spacing:-.058em;max-width:18ch!important;margin:.3rem 0 1.35rem}
.site-intro {font-size:clamp(1.08rem,1.65vw,1.32rem);line-height:1.58;max-width:63ch!important}
.site-hero-note {font-size:.93rem;color:#d6e8e2;max-width:66ch!important}
.site-actions {display:flex;flex-wrap:wrap;gap:.7rem;margin:1.4rem 0}
a.site-action {display:inline-flex;align-items:center;justify-content:center;gap:.8rem;font-weight:700;padding:.72rem 1.05rem;border:1.5px solid currentColor;text-decoration:none;min-height:2.75rem;border-radius:0;color:var(--site-ink);background:var(--site-sun)}
a.site-action:hover {background:#f6ffc7;box-shadow:3px 3px 0 #64807a}
a.site-action--quiet {background:transparent;color:inherit}
#introduction a.site-action--quiet,#lead a.site-action--quiet {color:#f5f7dc}
a.site-action--quiet:hover {background:#dff4e3;color:var(--site-ink)!important}
.site-eyeline {font-size:.84rem;color:#b8d1cc}
.site-card-grid {display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.8rem;list-style:none;padding:0!important;margin:0}
.site-card-grid--three {grid-template-columns:repeat(3,minmax(0,1fr))}
.site-card {position:relative;border:1px solid var(--site-rule);background:#f7f8f2;padding:1.05rem;min-width:0;display:flex;flex-direction:column;gap:.45rem}
.site-card h3 {font:700 clamp(1.05rem,1.4vw,1.25rem)/1.24 ui-serif,Georgia,serif;letter-spacing:-.016em;margin:0}
.site-card p {font-size:.91rem;line-height:1.5;color:#435960;margin:.2rem 0 .5rem}
.site-card a {font-weight:650;color:#005f5a;margin-top:auto}
.site-card a::after {content:" ↗";font-family:system-ui;font-weight:500}
.site-card .site-category {font:650 .72rem/1.4 ui-monospace,Consolas,monospace;color:#32675f;text-transform:uppercase;letter-spacing:.06em}
#frontiers {grid-column:span 12;background:linear-gradient(155deg,#fbf9ef 0%,#eef2e9 100%);border-top:3px solid var(--site-ink)}
#frontiers header h2 {color:#144c4d}
.site-frontier-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(.8rem,2vw,1.5rem);margin:1.3rem 0}
.site-frontier {padding:1.35rem;border:1px solid #a5bab5;background:#fffdfa;min-width:0}
.site-frontier:nth-child(2) {border-top:5px solid #a76728}
.site-frontier:first-child {border-top:5px solid #236a60}
.site-frontier h3 {font:700 clamp(1.35rem,2vw,1.9rem)/1.13 ui-serif,Georgia,serif;letter-spacing:-.025em;margin:0 0 .9rem}
.site-frontier .site-frontier-thesis {font-size:1.06rem;line-height:1.55;color:#173841}
.site-frontier .site-frontier-present {font-size:.93rem;color:#2d5054}
.site-frontier .site-frontier-boundary {font-size:.87rem;border-top:1px solid #bdd0c9;margin-top:1.1rem;padding-top:1rem;color:#4e6064}
.site-frontier-throughline {font-weight:650;font-size:1.06rem;line-height:1.55;max-width:72ch}
.site-section-lead {font-size:1.07rem;line-height:1.6;margin:0 0 1.35rem;color:#304b52}
.site-service-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.05rem;list-style:none;padding:0!important;margin:0}
.site-service {border-top:2px solid var(--tufte-accent);padding:.8rem 0 .25rem;min-width:0}
.site-service h3 {font-size:1.13rem;line-height:1.3;font-family:ui-serif,Georgia,serif;margin:0 0 .35rem}
.site-service p {font-size:.94rem;margin:.4rem 0;color:#38535a}
.site-service .site-provider,.site-step-number {font:.76rem/1.6 ui-monospace,Consolas,monospace;color:#42615d}
.site-service .site-example {font-size:.87rem}
.site-steps {display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.2rem;list-style:none;padding:0!important;margin:0}
.site-step {border-top:1px solid var(--site-rule);padding-top:.8rem}
.site-step h3 {font-size:1rem;margin:.25rem 0;line-height:1.32}
.site-step p {font-size:.89rem;color:#3e5358}
.site-project-grid {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.8rem;list-style:none;padding:0!important;margin:0}
.site-project {background:#f8f7f0;border:1px solid var(--site-rule);padding:1.05rem;min-width:0}
.site-project h3 {font:700 1.13rem/1.3 ui-serif,Georgia,serif;margin:.2rem 0}
.site-project p {font-size:.91rem;line-height:1.5;color:#39515a;margin:.4rem 0}
.site-project a {font-weight:700}
.site-muted {font-size:.86rem;color:#445b60;line-height:1.55}
.site-fact {border-inline-start:4px solid var(--tufte-accent);padding:.3rem 0 .3rem .9rem;font-size:.98rem}
.site-inline-list {display:flex;gap:.7rem 1.25rem;flex-wrap:wrap;list-style:none;padding:0!important}
.site-endpoints {list-style:none;padding:0!important;margin:0}
.site-endpoints li {display:grid;grid-template-columns:4.4rem minmax(0,1fr);gap:.1rem .7rem;padding:.8rem 0;border-bottom:1px solid var(--site-rule)}
.site-endpoints .site-method {font:700 .75rem/1.5 ui-monospace,Consolas,monospace;color:#006c64}
.site-endpoints a {overflow-wrap:anywhere}
.site-endpoints p {grid-column:2;margin:.15rem 0;font-size:.87rem;color:#4c6268}
.site-house-list {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;padding:0!important;list-style:none}
.site-house-list li {padding:1rem;background:#f6f7f0;border:1px solid var(--site-rule)}
.site-house-list strong {display:block;font:700 1.15rem/1.3 ui-serif,Georgia,serif}
.site-house-list p {font-size:.9rem;color:#465b5e}
.site-house-list a {font-size:.91rem;font-weight:700}
.site-quote {font:500 clamp(1.2rem,1.8vw,1.6rem)/1.45 ui-serif,Georgia,serif}
.site-directory {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.4rem}
.site-directory h3 {font-size:1.15rem;margin:0 0 .65rem}
.site-directory ul {margin:0;padding-inline-start:1.2rem}
.site-directory li {margin:.55rem 0}
.site-directory li span {display:block;font-size:.84rem;color:#495b5e}
@media(max-width:1050px) {
 .site-card-grid {grid-template-columns:repeat(2,minmax(0,1fr))}
 .site-project-grid {grid-template-columns:repeat(2,minmax(0,1fr))}
 .site-steps {grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:760px) {
 .tufte-shell {padding:1rem}
 .tufte-masthead {align-items:flex-start;flex-direction:column;gap:.6rem}
 [data-tufte-navigation] {justify-content:flex-start;gap:.2rem .8rem}
 .tufte-grid>.tufte-tile {grid-column:span 12!important}
 .site-service-grid,.site-house-list,.site-directory,.site-frontier-grid {grid-template-columns:1fr}
 .site-display {font-size:clamp(2.4rem,10vw,4rem)}
}
@media(max-width:430px) {
 .site-card-grid,.site-card-grid--three,.site-project-grid,.site-steps {grid-template-columns:1fr}
 .site-actions {flex-direction:column}
 a.site-action {width:100%}
 .site-endpoints li {grid-template-columns:1fr}
 .site-endpoints p {grid-column:1}
}
@media(prefers-reduced-motion:reduce) {html {scroll-behavior:auto} a.site-action {transition:none}}
@media print {
 body,.tufte-tile {background:white!important;color:black!important}
 a::after {content:""!important}
 .site-action {background:white!important;color:black!important}
}
`;
