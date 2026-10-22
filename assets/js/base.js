/* Pierre Becq — socle commun : en-tete, defilement, curseur flamme, dorure, son de pendule, selection, transitions, ouverture. */
import { Lenis } from '../vendor/lenis.mjs';
import { NOM, PB as MONO } from './formes.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
if (window.CustomEase) {
  gsap.registerPlugin(window.CustomEase);
  window.CustomEase.create('feuille', 'M0,0 C0.25,0.6 0.15,1 1,1');
}

/* ---------- stockage prudent ---------- */
const memo = {
  lire(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } },
  session(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } return null; },
};

/* ---------- etat global ---------- */
const prefereCalme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const calme = memo.lire('pb-calme', prefereCalme);
const pointeurFin = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const etroit = () => window.innerWidth < 861;
const glDispo = (() => {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
})();
document.documentElement.classList.toggle('calme', calme);

const PB = {
  gsap, ScrollTrigger, memo, calme, pointeurFin, etroit, gl: glDispo && !calme,
  objets: window.OBJETS || [], familles: window.FAMILLES || {}, lenis: null, souris: null,
};
PB.parId = Object.fromEntries(PB.objets.map((o) => [o.id, o]));
export default PB;

/* ---------- utilitaires ---------- */
PB.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
PB.srcset = (img) => img.tailles.map(([suf, w]) => `assets/${img.src}-${suf}.webp ${w}w`).join(', ');
PB.src = (img, cible = 900) => {
  const t = img.tailles.find(([, w]) => w >= cible) || img.tailles[img.tailles.length - 1];
  return `assets/${img.src}-${t[0]}.webp`;
};
PB.amb = (nom, cible = 1200) => {
  const a = (window.AMBIANCE || {})[nom];
  if (!a) return '';
  const t = a.tailles.find(([, w]) => w >= cible) || a.tailles[a.tailles.length - 1];
  return `assets/img/ambiance/${nom}-${t[0]}.webp`;
};
PB.visuel = (o) => o.detoure || o.vues[0];
PB.estDetoure = (o) => !!o.detoure;
PB.lien = (o) => `objet.html?o=${encodeURIComponent(o.id)}`;
PB.dims = (o) => {
  const d = o.dim;
  if (!d) return '';
  const n = (v) => String(v).replace('.', ',');
  const p = [];
  if (d.h) p.push(`H\u00a0${n(d.h)}`);
  if (d.l) p.push(`L\u00a0${n(d.l)}`);
  if (d.p) p.push(`P\u00a0${n(d.p)}`);
  if (d.d) p.push(`Ø\u00a0${n(d.d)}`);
  return p.length ? `${p.join(' ×\u00a0')}\u00a0cm` : '';
};
/* piece en vente libre, ou soumise a un certificat (ivoire) */
PB.enVente = (o) => o.vente !== 'certificat';
PB.ancienne = (o) => (o.annee || 0) < 1950;
PB.mentionPrix = (o) => (PB.enVente(o) ? 'Prix sur demande' : 'Certificat CITES à compléter');
/* typographie francaise des textes ajoutes par le code : espaces insecables, apostrophes */
const LETTRES = 'A-Za-zÀ-ÖØ-öø-ÿŒœ';
const reApo = new RegExp(`([${LETTRES}])'(?=[${LETTRES}])`, 'g');
PB.typo = (t) => t.replace(reApo, '$1’').replace(/[ \u00a0\u202f]+([;!?])/g, '\u202f$1').replace(/[ \u00a0\u202f]+:(?=\s|$)/g, '\u00a0:')
  .replace(/«[ \u00a0\u202f]*/g, '«\u00a0').replace(/[ \u00a0\u202f]*»/g, '\u00a0»');
const horsTypo = 'script, style, textarea, svg, input, select';
const typoTexte = (n) => { if (n.parentElement?.closest(horsTypo)) return; const v = PB.typo(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; };
const typoArbre = (racine) => {
  const w = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT);
  let n; while ((n = w.nextNode())) typoTexte(n);
};
function monterTypo() {
  typoArbre(document.body);
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) typoArbre(n); else if (n.nodeType === 3) typoTexte(n); })))
    .observe(document.body, { childList: true, subtree: true });
}
PB.alt = (o) => `${o.titre}${o.materiaux ? `, ${o.materiaux.toLowerCase()}` : ''}`;
PB.annees = () => new Date().getFullYear() - 1969;

const ICO = {
  plus: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.4" fill="none"/></svg>',
  ok: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8.5l3.5 3.5 7.5-8" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>',
  calme: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 12c2.5-3 4.5-3 7 0s4.5 3 7 0" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>',
  menu: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7h14M3 13h14" stroke="currentColor" stroke-width="1.4"/></svg>',
  croix: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.4"/></svg>',
  etiquette: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10.5l7.5-7.5H17v6.5L9.5 17 3 10.5z" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linejoin="round"/><circle cx="13.6" cy="6.4" r="1.4" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>',
  balancier: '<svg class="balancier" viewBox="0 0 18 20" aria-hidden="true"><g><line x1="9" y1="2" x2="9" y2="14"/><circle cx="9" cy="16" r="2.6"/></g></svg>',
  fleche: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.4" fill="none"/></svg>',
};
PB.ICO = ICO;

PB.monoSVG = (cls = 'mono') => {
  const [x0, y0, x1, y1] = MONO.bbox;
  const w = x1 - x0; const h = y1 - y0;
  const R = 70; const k = (R * 1.02) / w;
  const tx = 80 - (x0 + w / 2) * k; const ty = 80 - (y0 + h / 2) * k;
  return `<svg class="${cls}" viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="74"/><g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${k.toFixed(3)})">${MONO.paths.map((d) => `<path d="${d}"/>`).join('')}</g></svg>`;
};

/* ---------- dialogues : le reste de la page devient inerte ---------- */
PB.isoler = (dialogue, on) => {
  [...document.body.children].forEach((el) => {
    if (el === dialogue || el.contains(dialogue) || el.matches('script, .flamme, .curseur-anneau, .toast, .voile, .iris, .aiguille')) return;
    if (on) { if (!el.inert) { el.inert = true; el.dataset.inertPb = '1'; } } else if (el.dataset.inertPb) { el.inert = false; delete el.dataset.inertPb; }
  });
};

/* ---------- chrome ---------- */
function monterChrome() {
  const page = document.body.dataset.page || '';
  const cur = (p) => (p === page ? ' aria-current="page"' : '');
  const entete = document.createElement('header');
  entete.className = 'entete';
  entete.innerHTML = `
    <a class="marque" href="index.html" aria-label="Pierre Becq Antiquaire, accueil">${PB.monoSVG()}<span class="nom-marque"><strong>Pierre Becq</strong><small>Antiquaire</small></span></a>
    <nav class="nav" aria-label="Navigation principale">
      <a href="galerie.html"${cur('galerie') || cur('objet')}>La galerie</a>
      <a href="expertise.html"${cur('expertise')}>L'expertise</a>
      <a href="index.html#maison">La maison</a>
      <a href="index.html#boutiques">Boutiques</a>
      <a href="index.html#contact">Contact</a>
    </nav>
    <div class="outils">
      <button class="outil" type="button" data-son aria-pressed="false" title="Son de pendule">${ICO.balancier}<span class="lib">Son</span><span class="sr">Activer le son de pendule</span></button>
      <button class="outil" type="button" data-calme aria-pressed="${calme}" title="Réduire les animations">${ICO.calme}<span class="lib">Mode calme</span></button>
      <button class="outil" type="button" data-selection-ouvrir aria-label="Ouvrir ma sélection">${ICO.etiquette}<span class="lib">Sélection</span><span class="pastille chiffres" data-compte-sel>0</span></button>
      <button class="outil menu-bouton" type="button" data-menu aria-expanded="false" aria-controls="menu-plein" aria-label="Ouvrir le menu">${ICO.menu}</button>
    </div>`;
  document.body.prepend(entete);
  const evite = document.createElement('a');
  evite.className = 'evite'; evite.href = '#principal'; evite.textContent = 'Aller au contenu';
  document.body.prepend(evite);

  const menu = document.createElement('div');
  menu.className = 'menu-plein'; menu.id = 'menu-plein'; menu.inert = true;
  menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-modal', 'true'); menu.setAttribute('aria-label', 'Menu');
  menu.innerHTML = `
    <button class="outil fermer" type="button" data-menu-fermer aria-label="Fermer le menu">${ICO.croix}</button>
    <a href="galerie.html">La galerie</a><a href="expertise.html">L'expertise</a><a href="index.html#maison">La maison</a>
    <span class="sep" aria-hidden="true"></span>
    <a class="second" href="index.html#lorraine">Trésors de Lorraine</a><a class="second" href="index.html#successions">Successions</a><a class="second" href="index.html#boutiques">Boutiques</a><a class="second" href="index.html#contact">Contact</a>
    <div class="menu-pied">
      <a class="bouton bouton--or" href="expertise.html#formulaire"><span>Demander une expertise</span></a>
      <button class="menu-option" type="button" data-menu-selection>${ICO.etiquette}<span>Ma sélection</span><span class="chiffres" data-compte-sel-menu>0</span></button>
      <div class="menu-reglages">
        <button class="menu-option" type="button" data-menu-son aria-pressed="false">${ICO.balancier}<span>Son de pendule</span></button>
        <button class="menu-option" type="button" data-menu-calme aria-pressed="${calme}">${ICO.calme}<span>Mode calme</span></button>
      </div>
      <p>5 rue Gambetta, 57000 Metz</p>
      <div class="menu-contact"><a class="bouton" href="tel:+33387636161"><span>Appeler</span></a><a class="bouton" href="https://www.google.com/maps/search/?api=1&amp;query=5+rue+Gambetta+57000+Metz" target="_blank" rel="noopener"><span>Itinéraire</span></a></div>
    </div>`;
  document.body.append(menu);

  const voile = document.createElement('div'); voile.className = 'voile'; voile.dataset.voile = '';
  const tiroir = document.createElement('div');
  tiroir.className = 'tiroir'; tiroir.setAttribute('role', 'dialog'); tiroir.setAttribute('aria-modal', 'true'); tiroir.setAttribute('aria-label', 'Ma sélection'); tiroir.setAttribute('aria-hidden', 'true'); tiroir.inert = true;
  tiroir.innerHTML = `
    <header><h2>Ma sélection</h2><button class="outil" type="button" data-selection-fermer aria-label="Fermer ma sélection">${ICO.croix}</button></header>
    <div class="liste" data-selection-liste></div>
    <footer data-selection-pied></footer>`;
  document.body.append(voile, tiroir);

  const toast = document.createElement('div');
  toast.className = 'toast'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite');
  document.body.append(toast);

  if (pointeurFin) {
    const f = document.createElement('div'); f.className = 'flamme'; f.innerHTML = '<i></i><b></b>';
    const a = document.createElement('div'); a.className = 'curseur-anneau'; a.innerHTML = '<span>Voir</span>';
    document.body.append(f, a);
  }
  const aig = document.createElement('div');
  aig.className = 'aiguille'; aig.setAttribute('aria-hidden', 'true');
  aig.innerHTML = `<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="20"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => { const a2 = (i / 12) * Math.PI * 2; const r1 = i % 3 ? 17 : 15; return `<line class="graduation" x1="${22 + Math.sin(a2) * r1}" y1="${22 - Math.cos(a2) * r1}" x2="${22 + Math.sin(a2) * 19}" y2="${22 - Math.cos(a2) * 19}"/>`; }).join('')}<line class="main" x1="22" y1="22" x2="22" y2="8"/><circle class="axe" cx="22" cy="22" r="2"/></svg>`;
  document.body.append(aig);
  const iris = document.createElement('div');
  iris.className = 'iris'; iris.setAttribute('aria-hidden', 'true'); iris.innerHTML = '<div class="fumee"></div>';
  document.body.append(iris);

  // menu mobile
  const btnMenu = entete.querySelector('[data-menu]');
  const ouvrirMenu = (on) => {
    menu.classList.toggle('ouvert', on);
    btnMenu.setAttribute('aria-expanded', String(on));
    PB.isoler(menu, on);
    menu.inert = !on;
    if (on) {
      PB.lenis?.stop(); menu.querySelector('a').focus();
      if (!calme) gsap.fromTo(menu.querySelectorAll(':scope > a, .sep, .menu-pied'), { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.05, overwrite: true });
    } else { PB.lenis?.start(); btnMenu.focus(); }
  };
  btnMenu.addEventListener('click', () => ouvrirMenu(true));
  // reglages du menu : memes actions que les boutons de l'en-tete
  menu.querySelector('[data-menu-son]').addEventListener('click', (e) => { entete.querySelector('[data-son]').click(); e.currentTarget.setAttribute('aria-pressed', String(Pendule.actif)); });
  menu.querySelector('[data-menu-calme]').addEventListener('click', () => entete.querySelector('[data-calme]').click());
  menu.querySelector('[data-menu-selection]').addEventListener('click', () => { ouvrirMenu(false); setTimeout(() => Selection.ouvrir(), 120); });
  menu.querySelector('[data-menu-fermer]').addEventListener('click', () => ouvrirMenu(false));
  menu.querySelectorAll('a').forEach((l) => l.addEventListener('click', () => ouvrirMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('ouvert')) ouvrirMenu(false); });

  entete.querySelector('[data-calme]').addEventListener('click', () => { memo.ecrire('pb-calme', !calme); location.reload(); });

  // fonds de repli sans WebGL
  document.querySelectorAll('.gl-repli').forEach((r) => {
    const choisir = () => { r.style.backgroundImage = `url("${innerWidth < innerHeight && r.dataset.imgM ? r.dataset.imgM : r.dataset.img}")`; };
    choisir(); addEventListener('resize', choisir, { passive: true });
    if (pointeurFin && !calme) {
      r.closest('section, .entree')?.addEventListener('pointermove', (e) => {
        const b = r.getBoundingClientRect();
        r.style.setProperty('--lx', `${((e.clientX - b.left) / b.width) * 100}%`); r.style.setProperty('--ly', `${((e.clientY - b.top) / b.height) * 100}%`);
      });
    }
  });
}

/* ---------- defilement ---------- */
function monterDefilement() {
  if (!calme) {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
    PB.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add('lenis');
    // apres un defilement natif provoque par le focus clavier, Lenis repart de la vraie position
    document.addEventListener('focusin', () => requestAnimationFrame(() => requestAnimationFrame(() => { if (lenis.isScrolling !== 'smooth') lenis.reset(); })));
  }
  // ancres internes : defilement doux et focus qui suit
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"], a[href^="index.html#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    const hash = href.slice(href.indexOf('#'));
    if (href.startsWith('index.html') && document.body.dataset.page !== 'accueil') return;
    const cible = hash.length > 1 && document.querySelector(hash);
    if (!cible) return;
    e.preventDefault();
    if (PB.lenis) PB.lenis.scrollTo(cible, { offset: 0, duration: a.classList.contains('evite') ? 0.6 : 1.6 });
    else cible.scrollIntoView({ behavior: calme ? 'auto' : 'smooth' });
    history.replaceState(null, '', hash);
    if (!cible.matches('a, button, input, textarea, select, [tabindex]')) cible.setAttribute('tabindex', '-1');
    cible.focus({ preventScroll: true });
  });
  document.querySelectorAll('a[target="_blank"]').forEach((a) => { if (!a.querySelector('.sr')) a.insertAdjacentHTML('beforeend', '<span class="sr"> (nouvel onglet)</span>'); });
  // en-tete qui se cache, aiguille de progression
  const entete = document.querySelector('.entete');
  const main = document.querySelector('.aiguille .main');
  let dernier = 0;
  const maj = () => {
    const y = window.scrollY;
    entete.classList.toggle('est-plein', y > 40);
    entete.classList.toggle('est-cache', y > 320 && y > dernier + 2 && !document.querySelector('.menu-plein.ouvert'));
    if (y < dernier - 2) entete.classList.remove('est-cache');
    dernier = y;
    const h = document.documentElement.scrollHeight - innerHeight;
    if (main) main.style.transform = `rotate(${h > 0 ? (y / h) * 360 : 0}deg)`;
  };
  addEventListener('scroll', maj, { passive: true });
  maj();
  entete.addEventListener('focusin', () => entete.classList.remove('est-cache'));
  if (location.hash && document.body.dataset.page === 'accueil') {
    const cible = document.querySelector(location.hash);
    if (cible) {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      PB.pret.then(() => setTimeout(() => {
        ScrollTrigger.refresh();
        const y = cible.getBoundingClientRect().top + scrollY;
        if (PB.lenis) { PB.lenis.resize(); PB.lenis.scrollTo(y, { immediate: true, force: true }); } else scrollTo(0, y);
      }, 450));
    }
  }
}

/* ---------- curseur flamme ---------- */
function monterCurseur() {
  addEventListener('pointermove', (e) => { PB.souris = { x: e.clientX, y: e.clientY }; }, { passive: true });
  if (!pointeurFin || calme) return;
  document.documentElement.classList.add('curseur-actif');
  const f = document.querySelector('.flamme');
  const anneau = document.querySelector('.curseur-anneau');
  const lib = anneau.querySelector('span');
  const fx = gsap.quickTo(f, 'x', { duration: 0.06, ease: 'power2' }); const fy = gsap.quickTo(f, 'y', { duration: 0.06, ease: 'power2' });
  const ax = gsap.quickTo(anneau, 'x', { duration: 0.45, ease: 'power3' }); const ay = gsap.quickTo(anneau, 'y', { duration: 0.45, ease: 'power3' });
  const penche = gsap.quickTo(f.querySelector('i'), 'rotation', { duration: 0.5, ease: 'power2' });
  let px = 0;
  addEventListener('pointermove', (e) => {
    document.documentElement.classList.add('curseur-vu');
    fx(e.clientX); fy(e.clientY); ax(e.clientX); ay(e.clientY);
    penche(Math.max(-25, Math.min(25, (px - e.clientX) * 1.2))); px = e.clientX;
  }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const v = e.target.closest('[data-curseur]');
    const l = e.target.closest('a, button, label, select');
    anneau.classList.toggle('voir', !!v);
    lib.textContent = v ? (v.dataset.curseur || 'Voir') : 'Voir';
    anneau.classList.toggle('lien-on', !v && !!l);
  });
  document.addEventListener('pointerleave', () => gsap.to([f, anneau], { opacity: 0, duration: 0.3 }));
  document.addEventListener('pointerenter', () => gsap.to([f, anneau], { opacity: 1, duration: 0.3 }));
}

PB.aimants = (racine = document) => {
  if (!pointeurFin || calme) return;
  racine.querySelectorAll('.bouton, [data-aimant]').forEach((el) => {
    if (el.dataset.aimantOk) return;
    el.dataset.aimantOk = '1';
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.25); yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
};

/* avant de remplacer des cartes : on arrete leurs animations d'inclinaison */
PB.liberer = (racine) => {
  racine.querySelectorAll('[data-tilt]').forEach((el) => { el._tilt?.forEach((q) => q.tween?.kill()); el._tilt = null; gsap.killTweensOf(el); });
  ScrollTrigger.getAll().forEach((st) => { if (st.trigger && st.trigger !== racine && racine.contains(st.trigger)) st.kill(); });
};
PB.inclinaison = (racine = document) => {
  if (calme) return;
  if (!pointeurFin) {
    // ecran tactile : la lumiere balaie le velours de chaque carte quand elle arrive a l'ecran
    racine.querySelectorAll('[data-tilt] .carte-visuel').forEach((vis) => {
      if (vis.dataset.balaye) return; vis.dataset.balaye = '1';
      ScrollTrigger.create({ trigger: vis, start: 'top 88%', once: true, onEnter: () => gsap.fromTo(vis, { '--mx': '12%', '--my': '18%' }, { '--mx': '58%', '--my': '38%', duration: 1.8, ease: 'power2.out' }) });
    });
    return;
  }
  racine.querySelectorAll('[data-tilt]').forEach((el) => {
    if (el.dataset.tiltOk) return;
    el.dataset.tiltOk = '1';
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.7, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.7, ease: 'power3' });
    el._tilt = [rx, ry];
    gsap.set(el, { transformPerspective: 1000 });
    const vis = el.querySelector('.carte-visuel');
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width; const y = (e.clientY - r.top) / r.height;
      ry((x - 0.5) * 10); rx((0.5 - y) * 8);
      if (vis) { vis.style.setProperty('--mx', `${x * 100}%`); vis.style.setProperty('--my', `${y * 100}%`); }
    });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
};

/* ---------- etiquette de marchand qui se balance ---------- */
PB.balancer = (racine = document) => {
  if (calme) return;
  racine.querySelectorAll('[data-etiquette]').forEach((t) => {
    if (t.dataset.balOk) return;
    t.dataset.balOk = '1';
    const declencheur = t.closest('[data-carte], figure') || t;
    const secouer = (force = 1) => gsap.fromTo(t, { rotation: 9 * force }, { rotation: 0, duration: 2.2, ease: 'elastic.out(1.1, 0.18)', overwrite: true });
    declencheur.addEventListener('pointerenter', () => secouer(1));
    ScrollTrigger.create({ trigger: t, start: 'top 92%', once: true, onEnter: () => secouer(1.4) });
  });
};

/* ---------- dorure a la feuille ---------- */
PB.dorer = (racine = document, { debut = 'top 93%', delai = 0 } = {}) => {
  racine.querySelectorAll('[data-dorure]').forEach((el) => {
    if (el.dataset.dorOk) return;
    el.dataset.dorOk = '1';
    const texte = el.textContent;
    el.innerHTML = `<span class="sr">${PB.esc(texte)}</span>` + texte.split(/(\s+)/).map((m) => (m.trim() ? `<span class="dore-mot" aria-hidden="true">${PB.esc(m)}</span>` : m)).join('');
    el.classList.remove('dore');
    const mots = [...el.querySelectorAll('.dore-mot')];
    mots.forEach((m) => m.classList.add('dore'));
    if (calme) { gsap.set(mots, { backgroundPosition: '60px 0px, 0% 0%' }); return; }
    const tl = gsap.timeline({ paused: true, delay: delai });
    // le titre entier attend la dorure : pas de mots ordinaires seuls a l'ecran
    const titre = el.closest('h1, h2, h3');
    if (titre && titre !== el) { gsap.set(titre, { opacity: 0 }); tl.to(titre, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 0); }
    tl.fromTo(mots, { clipPath: 'inset(-40% 100% -60% -10%)', y: 14, skewX: -6 }, { clipPath: 'inset(-40% -10% -60% -10%)', y: 0, skewX: 0, duration: 1.15, ease: 'feuille', stagger: 0.09, onComplete: () => gsap.set(mots, { clearProps: 'clipPath' }) }, 0)
      .fromTo(mots, { backgroundPosition: '0px 0px, 100% 0%' }, { backgroundPosition: '60px 0px, 0% 0%', duration: 2.4, ease: 'power2.out', stagger: 0.09 }, 0);
    el._dorure = tl;
    if (el.closest('.entree')) { PB.pret.then(() => tl.play()); return; }
    ScrollTrigger.create({ trigger: el, start: PB.etroit() && debut === 'top 93%' ? 'top 97%' : debut, once: true, onEnter: () => tl.play() });
  });
};

/* ---------- son : tic-tac et carillon de pendule ---------- */
const Pendule = {
  ctx: null, actif: false, maitre: null, minuteur: null, pair: false,
  creer() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    const ctx = this.ctx = new AC();
    this.maitre = ctx.createGain(); this.maitre.gain.value = 0; this.maitre.connect(ctx.destination);
    const len = ctx.sampleRate * 0.3; const b = ctx.createBuffer(1, len, ctx.sampleRate); const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.004));
    this.clic = b;
    const rl = ctx.sampleRate * 1.6; const rb = ctx.createBuffer(2, rl, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const rd = rb.getChannelData(c); for (let i = 0; i < rl; i++) rd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / rl, 3.2); }
    this.salle = ctx.createConvolver(); this.salle.buffer = rb;
    const rg = ctx.createGain(); rg.gain.value = 0.35; this.salle.connect(rg).connect(this.maitre);
    return true;
  },
  tic(force = 0.5, aigu = true) {
    if (!this.ctx || !this.actif) return;
    const ctx = this.ctx; const t = ctx.currentTime;
    const s = ctx.createBufferSource(); s.buffer = this.clic;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = aigu ? 3200 : 2300; f.Q.value = 6;
    const g = ctx.createGain(); g.gain.value = force;
    s.connect(f).connect(g); g.connect(this.maitre); g.connect(this.salle);
    s.start(t);
  },
  battre() {
    if (!this.actif) return;
    if (document.hidden) { this.minuteur = setTimeout(() => this.battre(), 1000); return; }
    this.pair = !this.pair;
    this.tic(0.16, this.pair);
    this.minuteur = setTimeout(() => this.battre(), 1000);
  },
  carillon() {
    if (!this.ctx || !this.actif) return;
    const ctx = this.ctx;
    [[659.25, 0], [523.25, 0.42]].forEach(([fr, dec]) => {
      const t = ctx.currentTime + dec;
      [1, 2.76, 5.4].forEach((p, i) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = fr * p;
        const g = ctx.createGain(); const a = [0.22, 0.07, 0.03][i];
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(a, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4 - i * 0.6);
        o.connect(g); g.connect(this.maitre); g.connect(this.salle); o.start(t); o.stop(t + 2.5);
      });
    });
  },
  basculer() {
    if (!this.ctx && !this.creer()) return false;
    this.actif = !this.actif;
    const t = this.ctx.currentTime;
    if (this.actif) { this.ctx.resume(); this.maitre.gain.cancelScheduledValues(t); this.maitre.gain.setTargetAtTime(0.5, t, 0.3); this.battre(); }
    else { this.maitre.gain.cancelScheduledValues(t); this.maitre.gain.setTargetAtTime(0, t, 0.15); clearTimeout(this.minuteur); }
    return this.actif;
  },
};
PB.son = Pendule;
function monterSon() {
  const b = document.querySelector('[data-son]');
  b.addEventListener('click', () => {
    const on = Pendule.basculer();
    b.setAttribute('aria-pressed', String(on));
    b.classList.toggle('son-on', on);
    b.querySelector('.sr').textContent = on ? 'Couper le son de pendule' : 'Activer le son de pendule';
    if (on) setTimeout(() => Pendule.carillon(), 200);
  });
  document.addEventListener('click', (e) => { if (Pendule.actif && e.target.closest('.bouton, .filtre, .ajout, .choix span, .vignettes button')) Pendule.tic(0.55, true); });
}

/* ---------- notifications ---------- */
let minuterieToast;
PB.toast = (msg) => {
  const t = document.querySelector('.toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(minuterieToast); minuterieToast = setTimeout(() => t.classList.remove('on'), 3400);
};

/* ---------- ma selection ---------- */
const Selection = {
  ids: memo.lire('pb-selection', []).filter((id) => PB.parId[id]),
  a(id) { return this.ids.includes(id); },
  sauver() { memo.ecrire('pb-selection', this.ids); this.rendre(); document.querySelectorAll('[data-selection]').forEach((b) => this.etat(b)); },
  basculer(id, depuis) {
    const o = PB.parId[id]; if (!o) return;
    if (this.a(id)) { this.ids = this.ids.filter((x) => x !== id); this.sauver(); PB.toast(`Retiré de votre sélection : ${o.titre}.`); return; }
    document.querySelector('.entete')?.classList.remove('est-cache');
    this.ids.push(id); this.sauver(); this.vol(depuis);
    Pendule.carillon();
    PB.toast(`Dans votre sélection : ${o.titre}.`);
  },
  etat(b) {
    const dedans = this.a(b.dataset.selection);
    const o = PB.parId[b.dataset.selection];
    b.classList.toggle('dans-selection', dedans);
    b.setAttribute('aria-pressed', String(dedans));
    if (b.classList.contains('ajout')) {
      b.innerHTML = `${dedans ? ICO.ok : ICO.plus}<span>${dedans ? 'Dans ma sélection' : 'Sélection'}</span>`;
      b.setAttribute('aria-label', dedans ? `${o?.titre} est dans votre sélection, la retirer` : `Ajouter ${o?.titre} à ma sélection`);
    } else if (b.querySelector('span')) { b.querySelector('span').textContent = dedans ? 'Dans ma sélection' : 'Ajouter à ma sélection'; b.setAttribute('aria-label', dedans ? `${o?.titre} est dans votre sélection, la retirer` : `Ajouter ${o?.titre} à ma sélection`); }
  },
  vol(depuis) {
    if (calme || !depuis) return;
    const img = depuis.closest('[data-carte]')?.querySelector('img') || document.querySelector('[data-scene] img');
    const cible = document.querySelector('[data-selection-ouvrir]');
    if (!img || !cible) return;
    const r = img.getBoundingClientRect(); const c = cible.getBoundingClientRect();
    const v = img.cloneNode(); v.className = 'vol'; v.removeAttribute('srcset'); v.removeAttribute('style');
    v.style.left = `${r.left + r.width / 2 - 35}px`; v.style.top = `${r.top + r.height / 2 - 35}px`;
    document.body.append(v);
    gsap.timeline({ onComplete: () => v.remove() })
      .to(v, { duration: 0.9, ease: 'power2.in', x: c.left + c.width / 2 - (r.left + r.width / 2), scale: 0.3, rotation: 12 }, 0)
      .to(v, { duration: 0.9, ease: 'back.in(1.4)', y: c.top + c.height / 2 - (r.top + r.height / 2) }, 0)
      .to(v, { opacity: 0, duration: 0.2 }, 0.75)
      .fromTo(cible, { scale: 1 }, { scale: 1.2, duration: 0.18, yoyo: true, repeat: 1 }, 0.82)
      .fromTo(cible.querySelector('svg') || cible, { rotation: -24 }, { rotation: 0, duration: 1.4, ease: 'elastic.out(1.2, 0.28)', transformOrigin: '72% 28%' }, 0.86);
  },
  ouvrir() {
    const p = document.querySelector('.tiroir');
    this.retour = document.activeElement;
    p.classList.add('ouvert'); p.setAttribute('aria-hidden', 'false'); p.inert = false;
    document.querySelector('[data-voile]').classList.add('on');
    PB.lenis?.stop(); PB.isoler(p, true);
    setTimeout(() => document.querySelector('[data-selection-fermer]').focus(), 250);
  },
  fermer() {
    const p = document.querySelector('.tiroir');
    if (!p.classList.contains('ouvert')) return;
    p.classList.remove('ouvert'); p.setAttribute('aria-hidden', 'true'); p.inert = true;
    document.querySelector('[data-voile]').classList.remove('on');
    PB.isoler(p, false); PB.lenis?.start();
    if (this.retour && document.contains(this.retour)) this.retour.focus();
  },
  rendre() {
    const n = this.ids.length;
    const p = document.querySelector('[data-compte-sel]'); if (p) { p.textContent = n; p.classList.toggle('on', n > 0); }
    const pm = document.querySelector('[data-compte-sel-menu]'); if (pm) pm.textContent = n;
    const liste = document.querySelector('[data-selection-liste]'); const pied = document.querySelector('[data-selection-pied]');
    if (!liste) return;
    if (!n) {
      liste.innerHTML = '<div class="vide"><p>Votre sélection est vide.</p><p class="petit">Notez les pièces qui vous plaisent, puis demandez leurs prix en une fois.</p><a class="bouton" href="galerie.html"><span>Visiter la galerie</span></a></div>';
      pied.innerHTML = '';
      return;
    }
    liste.innerHTML = this.ids.map((id) => {
      const o = PB.parId[id]; const v = PB.visuel(o);
      return `<div class="ligne-sel"><img src="${PB.src(v, 200)}" alt=""><div><a class="t" href="${PB.lien(o)}">${PB.esc(o.titre)}</a><div class="mini">${PB.esc(o.epoque)}</div></div><button type="button" data-retirer="${id}" aria-label="Retirer ${PB.esc(o.titre)}">Retirer</button></div>`;
    }).join('');
    pied.innerHTML = `<p class="mini">${n} ${n > 1 ? 'pièces' : 'pièce'}, prix sur demande. Nous vous répondons avec les prix et les conditions de transport.</p><a class="bouton bouton--or" href="index.html#contact" data-demander-sel><span>Demander les prix</span></a>`;
  },
  texte() { return this.ids.map((id) => `- ${PB.parId[id].titre}`).join('\n'); },
};
PB.selection = Selection;
function monterSelection() {
  document.querySelector('[data-selection-ouvrir]').addEventListener('click', () => Selection.ouvrir());
  document.querySelector('[data-selection-fermer]').addEventListener('click', () => Selection.fermer());
  document.querySelector('[data-voile]').addEventListener('click', () => Selection.fermer());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') Selection.fermer(); });
  document.querySelector('.tiroir').addEventListener('click', (e) => {
    const r = e.target.closest('[data-retirer]'); if (r) Selection.basculer(r.dataset.retirer);
    const d = e.target.closest('[data-demander-sel]');
    if (d) { memo.session('pb-demande-sel', '1'); Selection.fermer(); }
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-selection]');
    if (!b) return;
    e.preventDefault();
    Selection.basculer(b.dataset.selection, b);
  });
  Selection.rendre();
}
PB.majSelection = (racine = document) => racine.querySelectorAll('[data-selection]').forEach((b) => Selection.etat(b));

/* ---------- formulaires simules ---------- */
/* champs obligatoires : un message sous chaque champ, le premier champ fautif amene au centre de l'ecran */
const MESSAGES = { nom: 'Indiquez votre nom.', email: 'Indiquez votre adresse e-mail.', message: 'Écrivez quelques mots.' };
PB.verifierChamps = (champs, err, resume) => {
  let premier = null;
  champs.forEach((c) => {
    const vide = !c.value.trim();
    const mauvais = c.type === 'email' && c.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value);
    const ko = vide || mauvais;
    const id = `${c.id}-err`;
    let m = document.getElementById(id);
    if (ko) {
      if (!m) { m = document.createElement('p'); m.className = 'erreur-champ'; m.id = id; c.closest('.champ')?.append(m); }
      m.textContent = mauvais ? 'Cette adresse e-mail semble incomplète.' : (MESSAGES[c.name] || 'Ce champ est à remplir.');
      c.setAttribute('aria-invalid', 'true'); c.setAttribute('aria-describedby', `${id} ${err.id}`);
      c.addEventListener('input', () => { if (c.value.trim()) { c.setAttribute('aria-invalid', 'false'); m?.remove(); c.removeAttribute('aria-describedby'); } }, { once: true });
      if (!premier) premier = c;
    } else { c.setAttribute('aria-invalid', 'false'); m?.remove(); c.removeAttribute('aria-describedby'); }
  });
  if (premier) {
    err.textContent = resume;
    premier.focus({ preventScroll: true });
    if (PB.lenis) PB.lenis.scrollTo(premier, { offset: -innerHeight * 0.4, duration: 0.8 }); else premier.scrollIntoView({ block: 'center', behavior: calme ? 'auto' : 'smooth' });
  } else err.textContent = '';
  return premier;
};
/* confirmation : un cachet de cire se pose sur la carte, puis le carillon sonne */
PB.confirmer = (f, html) => {
  const c = document.createElement('div');
  c.className = 'confirmation'; c.setAttribute('role', 'status'); c.tabIndex = -1;
  c.innerHTML = `<span class="sceau" aria-hidden="true"><svg class="empreinte" viewBox="0 0 40 40"><path d="M9 21l7 7 15-16"/></svg></span>${html}`;
  f.replaceWith(c);
  c.focus({ preventScroll: true });
  if (PB.lenis) PB.lenis.scrollTo(c, { offset: -(innerHeight * 0.25), duration: 0.8 }); else c.scrollIntoView({ block: 'center' });
  if (!calme) gsap.from(c.querySelector('.sceau'), { scale: 2.2, rotation: -24, opacity: 0, duration: 0.6, ease: 'back.out(2.4)', delay: 0.25 });
  Pendule.carillon();
  return c;
};
PB.monterFormulaire = (f, { message = () => 'Message bien reçu.' } = {}) => {
  if (!f) return;
  const err = f.querySelector('[data-erreur]');
  err.id = err.id || `err-${Math.random().toString(36).slice(2, 7)}`;
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    if (PB.verifierChamps([...f.querySelectorAll('[required]')], err, 'Merci de compléter les champs indiqués.')) return;
    PB.confirmer(f, `<h3>Merci pour votre envoi</h3><p>${PB.esc(message(f))}</p><p class="mini">Maquette : rien n'a été envoyé. Sur le site final, la boutique vous répondra dans les meilleurs délais.</p>`);
  });
};

/* ---------- transitions : la bougie s'eteint, puis se rallume ---------- */
function monterTransitions() {
  const iris = document.querySelector('.iris');
  const fumee = iris.querySelector('.fumee');
  const etat = { r: 0 };
  const appliquer = () => iris.style.setProperty('--r', `${etat.r}vmax`);
  if (memo.session('pb-transition') === '1' && !calme) {
    memo.session('pb-transition', '0');
    etat.r = 0; appliquer(); iris.style.setProperty('--x', '50%'); iris.style.setProperty('--y', '50%');
    gsap.to(etat, { r: 150, duration: 1.1, ease: 'power2.inOut', delay: 0.08, onUpdate: appliquer, onComplete: () => { iris.style.visibility = 'hidden'; } });
  } else { etat.r = 150; appliquer(); iris.style.visibility = 'hidden'; }
  // vers une fiche, depuis une carte : la piece glisse jusqu'a la fiche (transition de vue du navigateur)
  const vtPossible = 'CSSViewTransitionRule' in window;
  let nommee = null;
  const nommer = (el) => { if (nommee) nommee.style.viewTransitionName = ''; nommee = el; if (el) el.style.viewTransitionName = 'piece-vue'; };
  addEventListener('pageshow', (e) => { if (e.persisted) setTimeout(() => nommer(null), 900); });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || calme || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    if (a.getAttribute('href').startsWith('#')) return;
    const carte = a.closest('[data-carte]');
    const image = carte && /objet\.html$/.test(url.pathname) ? carte.querySelector('img.vp') : null;
    if (vtPossible && image) { nommer(image); memo.session('pb-vt', '1'); return; }
    document.querySelectorAll('img.vp').forEach((i) => { if (i.style.viewTransitionName) i.style.viewTransitionName = 'none'; });
    e.preventDefault();
    memo.session('pb-transition', '1');
    iris.style.setProperty('--x', `${e.clientX || innerWidth / 2}px`); iris.style.setProperty('--y', `${e.clientY || innerHeight / 2}px`);
    iris.classList.add('actif'); iris.style.visibility = 'visible';
    gsap.timeline({ onComplete: () => { location.href = url.href; } })
      .to(etat, { r: 0, duration: 0.75, ease: 'power3.in', onUpdate: appliquer })
      .fromTo(fumee, { opacity: 0, y: 20 }, { opacity: 0.8, y: -30, duration: 0.5, ease: 'power1.out' }, 0.45);
    if (Pendule.actif) Pendule.tic(0.4, false);
  });
  addEventListener('pageshow', (e) => { if (e.persisted) { etat.r = 150; appliquer(); iris.classList.remove('actif'); iris.style.visibility = 'hidden'; gsap.set(fumee, { opacity: 0 }); } });
}

/* ---------- ouverture : une flamme s'allume dans le noir ---------- */
function ouverture() {
  return new Promise((resoudre) => {
    const premiere = memo.session('pb-vu') !== '1';
    const finIntro = () => document.documentElement.classList.remove('intro');
    if (!premiere || calme || document.body.dataset.ouverture === 'non') { finIntro(); resoudre(); return; }
    memo.session('pb-vu', '1');
    const o = document.createElement('div');
    o.className = 'ouverture'; o.setAttribute('aria-hidden', 'true');
    o.innerHTML = '<div class="scene"><div class="meche"><i></i></div><div class="mot">Pierre Becq</div><div class="depuis">Antiquaire à Metz depuis 1969</div></div><canvas class="etincelles"></canvas>';
    document.body.append(o);
    finIntro();
    const cv = o.querySelector('canvas'); const ctx = cv.getContext('2d');
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cv.style.width = '100%'; cv.style.height = '100%';
    const etincelles = [];
    const meche = o.querySelector('.meche');
    const allumer = () => {
      const r = meche.getBoundingClientRect(); const cx = r.left + r.width / 2; const cy = r.top + r.height * 0.8;
      for (let i = 0; i < 70; i++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4; const v = 2 + Math.random() * 6; etincelles.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vie: 1 }); }
    };
    const anime = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (const s of etincelles) {
        s.x += s.vx; s.y += s.vy; s.vy += 0.18; s.vx *= 0.97; s.vie *= 0.94;
        if (s.vie < 0.02) continue;
        ctx.fillStyle = `rgba(255,${190 + Math.random() * 50 | 0},110,${s.vie})`;
        ctx.fillRect(s.x * dpr, s.y * dpr, 2 * dpr, 2 * dpr);
      }
    };
    gsap.ticker.add(anime);
    const etat = { r: 0 };
    const tl = gsap.timeline({ onComplete: () => { gsap.ticker.remove(anime); o.remove(); } });
    tl.set(meche, { scale: 0 })
      .add(allumer, 0.25)
      .to(meche, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, 0.25)
      .from(o.querySelector('.mot'), { opacity: 0, y: 16, duration: 0.7, ease: 'power3.out' }, 0.55)
      .from(o.querySelector('.depuis'), { opacity: 0, duration: 0.6 }, 0.8)
      .to([o.querySelector('.mot'), o.querySelector('.depuis')], { opacity: 0, duration: 0.4 }, 1.55)
      .add(() => resoudre(), 1.7)
      .to(etat, { r: Math.hypot(innerWidth, innerHeight), duration: 1.1, ease: 'power2.in', onUpdate: () => o.style.setProperty('--r', `${etat.r}px`) }, 1.6)
      .to(meche, { scale: 3, opacity: 0, duration: 0.6, ease: 'power2.in' }, 1.6);
    // un toucher, un clic ou une touche passe l'ouverture
    const passer = () => { if (tl.progress() < 1) tl.progress(1, false); };
    o.addEventListener('pointerdown', passer, { once: true });
    addEventListener('keydown', passer, { once: true });
  });
}

/* ---------- pied : le nom trace a l'or ---------- */
function monterPied() {
  const zone = document.querySelector('[data-grand-nom]');
  if (!zone) return;
  const [x0, y0, x1, y1] = NOM.bbox;
  const traces = NOM.paths.map((d) => `<path d="${d}"/>`).join('');
  // le nom, puis une seconde couche doree eclairee la ou passe la flamme
  zone.innerHTML = `<svg viewBox="${x0 - 4} ${y0 - 4} ${x1 - x0 + 8} ${y1 - y0 + 8}" role="img" aria-label="Pierre Becq"><defs><radialGradient id="lueur-nom" gradientUnits="userSpaceOnUse" cx="${x0 - 200}" cy="${(y0 + y1) / 2}" r="${(x1 - x0) * 0.16}"><stop offset="0" stop-color="#fbe9b6" stop-opacity=".95"/><stop offset=".45" stop-color="#d9b46a" stop-opacity=".55"/><stop offset="1" stop-color="#c9a35b" stop-opacity="0"/></radialGradient></defs><g class="nom-trace">${traces}</g><g class="nom-lueur" aria-hidden="true">${traces}</g></svg>`;
  const chemins = zone.querySelectorAll('.nom-trace path');
  if (!calme) {
    const svg = zone.querySelector('svg'); const grad = zone.querySelector('#lueur-nom');
    const pos = { x: x0 - 200, y: (y0 + y1) / 2 };
    const appliquer = () => { grad.setAttribute('cx', pos.x.toFixed(1)); grad.setAttribute('cy', pos.y.toFixed(1)); };
    const vers = (cx, cy) => {
      const m = svg.getScreenCTM(); if (!m) return;
      const pt = new DOMPoint(cx, cy).matrixTransform(m.inverse());
      gsap.to(pos, { x: pt.x, y: pt.y, duration: 0.6, ease: 'power3.out', overwrite: true, onUpdate: appliquer });
    };
    zone.addEventListener('pointermove', (e) => vers(e.clientX, e.clientY));
    zone.addEventListener('pointerdown', (e) => vers(e.clientX, e.clientY));
    // sans souris, la lueur traverse le nom quand il entre a l'ecran
    ScrollTrigger.create({ trigger: zone, start: 'top 85%', end: 'bottom top', onEnter: () => {
      if (pointeurFin) return;
      gsap.fromTo(pos, { x: x0 - 120 }, { x: x1 + 120, duration: 3.2, ease: 'sine.inOut', delay: 0.6, repeat: 1, yoyo: true, onUpdate: appliquer });
    } });
  }
  if (calme) { chemins.forEach((p) => { p.style.fill = 'rgba(201,163,91,.18)'; }); return; }
  chemins.forEach((p) => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
  gsap.timeline({ scrollTrigger: { trigger: zone, start: 'top 98%', once: true } })
    .to(chemins, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: 0.06 })
    .to(chemins, { fill: 'rgba(201,163,91,.18)', duration: 1.2 }, 1.2);
}

/* ---------- apparitions discretes ---------- */
PB.revele = (racine = document) => {
  if (calme) return;
  racine.querySelectorAll('[data-revele]').forEach((el) => {
    gsap.from(el, { opacity: 0, y: 30, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
};

/* ---------- retour arriere ---------- */
function memoirePosition() {
  const cle = `pb-pos:${location.pathname}${location.search}`;
  addEventListener('pagehide', () => { try { sessionStorage.setItem(cle, String(Math.round(scrollY))); } catch (e) { /* stockage indisponible */ } });
  const nav = performance.getEntriesByType?.('navigation')[0];
  let y = 0; try { y = Number(sessionStorage.getItem(cle)); } catch (e) { y = 0; }
  if (!nav || nav.type !== 'back_forward' || !y || location.hash) return;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  PB.pret.then(() => setTimeout(() => {
    ScrollTrigger.refresh();
    if (PB.lenis) { PB.lenis.resize(); PB.lenis.scrollTo(y, { immediate: true, force: true }); } else scrollTo(0, y);
  }, 350));
}

/* ---------- demarrage ---------- */
let resoudrePret;
PB.pret = new Promise((r) => { resoudrePret = r; });
/* clavier : un element qui recoit le focus n'attend pas la fin d'une apparition animee */
function monterFocusVisible() {
  if (calme) return;
  document.addEventListener('focusin', (e) => {
    let el = e.target;
    while (el && el !== document.body) {
      gsap.getTweensOf(el).forEach((t) => { if (t.repeat() !== -1 && !t.scrollTrigger?.vars?.scrub && !(t.vars && t.vars.scrollTrigger && t.vars.scrollTrigger.scrub)) t.progress(1); });
      el = el.parentElement;
    }
  });
}
/* telephone Android : la lumiere suit l'inclinaison de l'appareil (sans demande d'autorisation ; rien sur iPhone) */
function monterInclinaisonAppareil() {
  if (calme || pointeurFin || !window.DeviceOrientationEvent || typeof DeviceOrientationEvent.requestPermission === 'function') return;
  let base = null;
  addEventListener('deviceorientation', (e) => {
    if (e.gamma == null || e.beta == null) return;
    if (!base) base = { b: e.beta };
    const x = gsap.utils.clamp(-1, 1, e.gamma / 30); const y = gsap.utils.clamp(-1, 1, (e.beta - base.b) / 30);
    window.__pbTilt = { x, y };
  }, { passive: true });
}
export function demarrer() {
  monterChrome();
  monterInclinaisonAppareil();
  monterFocusVisible();
  monterTypo();
  monterDefilement();
  monterCurseur();
  monterSon();
  monterSelection();
  monterTransitions();
  monterPied();
  memoirePosition();
  PB.aimants();
  PB.inclinaison();
  const go = () => ouverture().then(() => resoudrePret());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  addEventListener('load', () => ScrollTrigger.refresh());
  return PB;
}
