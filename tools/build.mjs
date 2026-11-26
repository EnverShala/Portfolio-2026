#!/usr/bin/env node
// Build für enver-shala.de
//
// Die Seite wird im Browser von support.js aus der <x-dc>-Vorlage gerendert.
// Ohne JavaScript (Suchmaschinen-Crawler ohne Rendering, Recruiter-Tools,
// curl) stünden im HTML nur {{ … }}-Platzhalter. Dieses Skript erzeugt deshalb
// aus denselben Daten (CONTENT, SKILLS, CERTS im data-dc-script und den
// Tech-Tags der Projekte) einen statischen, semantischen Inhaltsblock und
// schreibt ihn zwischen die STATIC-CONTENT-Marker in Portfolio.dc.html.
// Mit JavaScript blendet eine Inline-Klasse (html.dc-js) den Block aus, die
// React-Ansicht zeigt dieselben Inhalte.
//
// Danach wird Portfolio.dc.html nach dist/index.html kopiert.
//
//   node tools/build.mjs           Block erzeugen + dist/index.html schreiben
//   node tools/build.mjs --check   nur prüfen, ob beides aktuell ist (CI)

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'Portfolio.dc.html');
const DIST = join(root, 'dist', 'index.html');
const START = '<!-- STATIC-CONTENT:START (generiert von tools/build.mjs, nicht von Hand bearbeiten) -->';
const END = '<!-- STATIC-CONTENT:END -->';
const check = process.argv.includes('--check');

const src = readFileSync(SRC, 'utf8');
const nl = src.includes('\r\n') ? '\r\n' : '\n';

// --- Daten aus dem Komponenten-Skript lesen ---------------------------------
const scriptMatch = /<script type="text\/x-dc" data-dc-script[^>]*>([\s\S]*?)<\/script>/.exec(src);
if (!scriptMatch) throw new Error('data-dc-script nicht gefunden');
const sandbox = {
  DCLogic: class {},
  React: { createRef: () => ({ current: null }) },
  window: {}, document: {}
};
const Component = vm.runInNewContext(scriptMatch[1] + '\n;Component', sandbox);
const inst = new Component();
const t = inst.CONTENT.de;
const SKILLS = inst.SKILLS;
const CERTS = inst.CERTS.de;

// --- Tech-Tags der Projekte aus der Vorlage lesen ---------------------------
function projectTags(n) {
  const re = new RegExp(`\\{\\{ t\\.portfolio\\.p${n}Title \\}\\}</h3>\\s*<p[^>]*>([\\s\\S]*?)</p>`);
  const m = re.exec(src);
  if (!m) throw new Error(`Tech-Tags für Projekt ${n} nicht gefunden`);
  return m[1]
    .replace(/<[^>]+>/g, '')
    .split('·')
    .map((s) => s.trim())
    .filter(Boolean);
}

// --- HTML erzeugen -----------------------------------------------------------
const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const projects = [1, 2, 3].map((n) => ({
  title: t.portfolio[`p${n}Title`],
  tag: t.portfolio[`p${n}Tag`],
  desc: t.portfolio[`p${n}D`],
  tags: projectTags(n)
}));

const L = [];
L.push(START);
L.push('<div id="static-content">');
L.push('<header>');
L.push('<p><a href="#top">Enver Shala</a></p>');
L.push('<nav aria-label="Hauptnavigation"><ul>');
for (const [id, key] of [['about', 'about'], ['skills', 'skills'], ['portfolio', 'portfolio'], ['certificates', 'certs'], ['contact', 'contact']]) {
  L.push(`<li><a href="#s-${id}">${esc(t.nav[key])}</a></li>`);
}
L.push('</ul></nav>');
L.push('</header>');
L.push('<main>');
L.push('<section id="s-top">');
L.push(`<h1>Enver Shala</h1>`);
L.push(`<p>${esc(t.hero.iam)} ${t.hero.roles.map(esc).join(' · ')}</p>`);
L.push('</section>');

L.push('<section id="s-about">');
L.push(`<h2>${esc(t.about.heading)}</h2>`);
L.push(`<p>${esc(t.about.intro)}</p>`);
for (const i of [1, 2, 3]) {
  L.push(`<h3>${esc(t.about['t' + i])}</h3>`);
  L.push(`<p>${esc(t.about['b' + i])}</p>`);
}
L.push('</section>');

L.push('<section id="s-skills">');
L.push(`<h2>${esc(t.skills.heading)}</h2>`);
L.push(`<p>${esc(t.skills.p1)}</p>`);
L.push('<ul>');
for (const sk of SKILLS) L.push(`<li>${esc(sk.name)}</li>`);
L.push('</ul>');
L.push(`<p>${esc(t.skills.look1 + t.skills.look2 + t.skills.look3)} ${esc(t.skills.p2)}</p>`);
L.push('</section>');

L.push('<section id="s-portfolio">');
L.push(`<h2>${esc(t.portfolio.heading)}</h2>`);
L.push(`<p>${esc(t.portfolio.intro)}</p>`);
for (const p of projects) {
  L.push('<article>');
  L.push(`<h3>${esc(p.title)}</h3>`);
  L.push(`<p><strong>${esc(p.tag)}</strong></p>`);
  L.push(`<p>Technologien: ${p.tags.map(esc).join(' · ')}</p>`);
  L.push(`<p>${esc(p.desc)}</p>`);
  L.push('</article>');
}
L.push('</section>');

L.push('<section id="s-certificates">');
L.push(`<h2>${esc(t.certs.heading)}</h2>`);
L.push(`<p>${esc(t.certs.intro)}</p>`);
L.push('<ul>');
for (const c of CERTS) L.push(`<li><strong>${esc(c.title)}</strong> – ${esc(c.issuer)} (${esc(c.meta)})</li>`);
L.push('</ul>');
L.push('</section>');

L.push('<section id="s-contact">');
L.push(`<h2>${esc(t.contact.heading)}</h2>`);
L.push(`<p>${esc(t.contact.q)} ${esc(t.contact.p)}</p>`);
L.push('<ul>');
L.push('<li><a href="https://github.com/EnverShala">GitHub</a></li>');
L.push('<li><a href="https://www.linkedin.com/in/enver-shala-developer/">LinkedIn</a></li>');
L.push('</ul>');
L.push('</section>');
L.push('</main>');
L.push('<footer>');
L.push(`<p><a href="/legalnotice">${esc(t.footer.legal)}</a> · <a href="/privacypolicy">Datenschutz</a> · ${esc(t.footer.copy)}</p>`);
L.push('</footer>');
L.push('</div>');
L.push(END);
const block = L.join(nl);

const s = src.indexOf(START.slice(0, 30));
const e = src.indexOf(END);
if (s === -1 || e === -1) throw new Error('STATIC-CONTENT-Marker in Portfolio.dc.html fehlen');
const out = src.slice(0, s) + block + src.slice(e + END.length);

// Der Block darf die Runtime nicht stören (sie sucht <x-dc …> und </x-dc>).
if (/<\/?x-dc/.test(block)) throw new Error('Statischer Block enthält x-dc-Tags');

if (check) {
  const norm = (x) => x.replace(/\r/g, '');
  let ok = true;
  if (norm(out) !== norm(src)) { console.error('Statischer Inhalt in Portfolio.dc.html ist veraltet. Bitte "node tools/build.mjs" ausführen.'); ok = false; }
  if (norm(readFileSync(DIST, 'utf8')) !== norm(out)) { console.error('dist/index.html weicht von Portfolio.dc.html ab. Bitte "node tools/build.mjs" ausführen.'); ok = false; }
  if (!ok) process.exit(1);
  console.log('Statischer Inhalt und dist/index.html sind aktuell.');
} else {
  writeFileSync(SRC, out);
  writeFileSync(DIST, out);
  console.log(`Portfolio.dc.html + dist/index.html geschrieben (${SKILLS.length} Skills, ${projects.length} Projekte, ${CERTS.length} Zertifikate).`);
}
