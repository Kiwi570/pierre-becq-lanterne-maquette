/* Accueil : flamme sur la boiserie, la maison, la salle des coups de coeur, la frise des siecles, la Lorraine, l'expertise. */
import PB, { demarrer } from './base.js';
import { fondLanterne } from './lumiere-gl.js';
import { FRANCE } from './formes.js';
import { pieceSalle, visuelPiece, hauteurRelative } from './cartes.js';
import { construireMarqueteries, construireCaisse } from './decors.js';

demarrer();
const { gsap, ScrollTrigger, calme } = PB;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const bureau = () => !PB.etroit() && !calme;
const o = (id) => PB.parId[id];

/* ---------------- 1. ouverture ---------------- */
let fond = null;
if (PB.gl) fond = fondLanterne($('[data-fond-gl]'), { image: PB.amb('g-boiserie-laque-16x9'), imageMobile: PB.amb('g-boiserie-laque-9x16'), vitrailForce: 0 });
const pieceEntree = $('[data-piece-entree]');
if (!calme) {
  gsap.set(pieceEntree.querySelector('img'), { opacity: 0, y: 40, scale: 0.96 });
  gsap.set($$('.entree [data-apparait]'), { opacity: 0, y: 24 });
  gsap.set(pieceEntree.querySelector('.etiquette'), { opacity: 0, x: 30 });
  PB.pret.then(() => {
    const tl = gsap.timeline();
    tl.to(pieceEntree.querySelector('img'), { opacity: 1, y: 0, scale: 1, duration: 1.8, ease: 'power3.out' }, 0.1)
      .fromTo(pieceEntree.querySelector('.halo-piece'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 2.2, ease: 'power2.out' }, 0)
      .to($$('.entree [data-apparait]'), { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12 }, 0.5)
      .to(pieceEntree.querySelector('.etiquette'), { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }, 1.1)
      .fromTo(pieceEntree.querySelector('.etiquette'), { rotation: 14 }, { rotation: 0, duration: 2.4, ease: 'elastic.out(1.1, 0.16)' }, 1.1);
  });
  gsap.to('.entree-grille', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.entree--accueil', start: 'top top', end: 'bottom top', scrub: true } });
  // la piece suit doucement la flamme
  if (PB.pointeurFin) {
    const img = pieceEntree.querySelector('img');
    const rx = gsap.quickTo(img, 'rotationY', { duration: 1.2, ease: 'power3' });
    gsap.set(img, { transformPerspective: 900 });
    addEventListener('pointermove', (e) => rx(((e.clientX / innerWidth) - 0.5) * 8), { passive: true });
  }
}

/* ---------------- 2. la maison ---------------- */
const annees = PB.annees();
$('[data-annees-depuis]').textContent = `${annees} ans d'antiquités`;
if (!calme) {
  const ann = $('[data-annee]'); const c = { v: new Date().getFullYear() };
  ScrollTrigger.create({ trigger: '.maison', start: 'top 70%', once: true, onEnter: () => gsap.to(c, { v: 1969, duration: 2.4, ease: 'power3.out', onUpdate: () => { ann.textContent = Math.round(c.v); } }) });
  gsap.from($$('[data-cachets] .cachet'), { opacity: 0, duration: 0.01, stagger: 0.16, scrollTrigger: { trigger: '[data-cachets]', start: 'top 82%', once: true } });
  gsap.from($$('[data-cachets] .cire'), { scale: 1.9, opacity: 0, rotation: () => gsap.utils.random(-30, 30), duration: 0.55, ease: 'back.out(2.2)', stagger: 0.16, scrollTrigger: { trigger: '[data-cachets]', start: 'top 82%', once: true } });
  gsap.from($$('[data-cachets] .cachet strong, [data-cachets] .cachet > span:not(.cire)'), { opacity: 0, y: 10, duration: 0.6, stagger: 0.08, delay: 0.3, scrollTrigger: { trigger: '[data-cachets]', start: 'top 82%', once: true } });
  gsap.fromTo('[data-parallaxe-photo] img', { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.maison-photo', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.maison-photo', { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'power3.inOut', scrollTrigger: { trigger: '.maison-photo', start: 'top 80%', once: true } });
}

/* ---------------- 3. coups de coeur ---------------- */
const piste = $('[data-piste-salle]');
const hauteurSalle = () => (bureau() ? Math.max(260, Math.min(470, innerHeight - 380)) : Math.min(innerHeight * 0.4, 330));
const rendreSalle = () => {
  const H = hauteurSalle();
  piste.innerHTML = PB.objets.map((x) => pieceSalle(x, hauteurRelative(x, H, H * 0.42))).join('');
  PB.majSelection(piste); PB.balancer(piste);
};
rendreSalle();
const teinte = (hex, k = 0.16) => {
  const c = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
  const b = [11, 9, 8];
  return `rgb(${c.map((v, i) => Math.round(b[i] + (v - b[i]) * k)).join(',')})`;
};
function animerSalle() {
  const sec = $('#coups-de-coeur');
  const pieces = $$('.piece', piste);
  const colorer = (p) => { if (p) sec.style.backgroundColor = teinte(p.dataset.couleur); };
  colorer(pieces[0]);
  if (!bureau()) {
    const zone = $('.salle-piste-zone');
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) colorer(en.target); }), { root: zone, threshold: 0.6 });
    pieces.forEach((p) => io.observe(p));
    return;
  }
  const distance = () => piste.scrollWidth - innerWidth;
  const tw = gsap.to(piste, { x: () => -distance(), ease: 'none' });
  sec.insertAdjacentHTML('beforeend', `<div class="hud-salle" aria-hidden="true"><span class="chiffres" data-hud-n>1 / ${pieces.length}</span><strong data-hud-t>${PB.esc(PB.objets[0].titre)}</strong><span class="barre"><i data-hud-barre></i></span></div>`);
  const hudN = $('[data-hud-n]', sec); const hudT = $('[data-hud-t]', sec); const hudB = $('[data-hud-barre]', sec);
  const vit = $('[data-vitrail]', sec);
  const st = ScrollTrigger.create({
    trigger: sec, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.7, animation: tw, invalidateOnRefresh: true, anticipatePin: 1,
  });
  tw.eventCallback('onUpdate', () => {
    const pr = tw.progress();
    hudB.style.transform = `scaleX(${pr})`;
    gsap.set(vit, { xPercent: -18 + pr * 36, opacity: 0.25 + Math.sin(pr * Math.PI * 3) ** 2 * 0.5 });
    const mid = innerWidth / 2; let best = null; let bd = 1e9;
    pieces.forEach((p) => { const r = p.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = p; } });
    if (best && best !== sec._actif) { sec._actif = best; colorer(best); const k = pieces.indexOf(best); hudN.textContent = `${k + 1} / ${pieces.length}`; hudT.textContent = PB.objets[k].titre; }
  });
  pieces.forEach((p) => {
    gsap.fromTo($('.piece-visuel', p), { y: 80, opacity: 0.15 }, { y: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: p, containerAnimation: tw, start: 'left 98%', end: 'left 60%', scrub: true } });
  });
  // clavier : la carte qui recoit le focus vient au centre
  piste.addEventListener('focusin', (ev) => {
    const p = ev.target.closest('.piece'); if (!p) return;
    const d = distance(); if (d <= 0) return;
    const pr = Math.min(1, Math.max(0, (p.offsetLeft + p.offsetWidth / 2 - innerWidth / 2) / d));
    const y = st.start + (st.end - st.start) * pr;
    if (PB.lenis) PB.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  });
}

/* ---------------- 4. frise des siecles ---------------- */
const DEBUT = 1670; const FIN = 2000;
function construireFrise() {
  const scene = $('[data-frise]'); const pisteF = $('[data-frise-piste]');
  const k = bureau() ? Math.max(9, innerWidth / 110) : 7.5; // pixels par annee
  const marge = bureau() ? innerWidth * 0.5 : 60;
  const X = (a) => marge + (a - DEBUT) * k;
  const largeur = X(FIN) + marge;
  const triees = [...PB.objets].sort((a, b) => a.annee - b.annee);
  let html = '<div class="frise-axe"></div>';
  for (let a = 1680; a <= FIN; a += 10) html += `<span class="frise-tic${a % 50 === 0 ? ' decennie' : ''}" style="left:${X(a)}px">${a % 50 === 0 ? `<span class="chiffres">${a}</span>` : ''}</span>`;
  [['XVIIe', 1670, 1700], ['XVIIIe', 1701, 1800], ['XIXe', 1801, 1900], ['XXe', 1901, 2000]].forEach(([n, a]) => { html += `<span class="frise-siecle dore" style="left:${X(Math.max(a, DEBUT)) + 6}px">${n}<span class="sr"> siècle</span></span>`; });
  const Hh = bureau() ? Math.min(270, innerHeight * 0.27) : 150;
  triees.forEach((x, i) => {
    const pos = i % 2 ? 'bas' : 'haut';
    html += `<a class="frise-piece ${pos}" href="${PB.lien(x)}" data-carte data-annee="${x.annee}" style="left:${X(x.annee)}px" aria-label="${PB.esc(x.titre)}, ${PB.esc(x.epoque)}">
      ${visuelPiece(x, { hauteur: hauteurRelative(x, Hh, Hh * 0.5) })}<span class="date">${PB.esc(x.epoque)}</span><span class="t">${PB.esc(x.titre)}</span></a>`;
  });
  pisteF.innerHTML = html;
  pisteF.style.width = `${largeur}px`;
  const anneeEl = $('[data-frise-annee]');
  if (!bureau()) {
    scene.style.overflowX = 'auto'; scene.style.height = `${Hh * 2 + 330}px`;
    scene.addEventListener('scroll', () => { anneeEl.textContent = Math.round(DEBUT + (scene.scrollLeft + scene.clientWidth / 2 - marge) / k); }, { passive: true });
    return;
  }
  scene.insertAdjacentHTML('beforeend', '<div class="frise-pendule" aria-hidden="true"><i></i><b></b></div>');
  const dist = () => largeur - innerWidth;
  const tw = gsap.to(pisteF, { x: () => -dist(), ease: 'none' });
  const st = ScrollTrigger.create({
    trigger: '#frise', start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.8, animation: tw, invalidateOnRefresh: true, anticipatePin: 1,
  });
  tw.eventCallback('onUpdate', () => {
    const x = -gsap.getProperty(pisteF, 'x') + innerWidth / 2;
    anneeEl.textContent = Math.max(DEBUT, Math.min(FIN, Math.round(DEBUT + (x - marge) / k)));
  });
  gsap.to('.frise-pendule', { rotation: 2.5, transformOrigin: '50% 0%', duration: 1, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  $$('.frise-piece', pisteF).forEach((p) => {
    const haut = p.classList.contains('haut');
    gsap.fromTo(p, { y: haut ? -160 : 160, opacity: 0 }, { y: 0, opacity: 1, ease: 'bounce.out', duration: 1, scrollTrigger: { trigger: p, containerAnimation: tw, start: 'left 62%', toggleActions: 'play none none reverse' } });
  });
  pisteF.addEventListener('focusin', (ev) => {
    const p = ev.target.closest('.frise-piece'); if (!p) return;
    const pr = Math.min(1, Math.max(0, (p.offsetLeft - innerWidth / 2) / dist()));
    const y = st.start + (st.end - st.start) * pr;
    if (PB.lenis) PB.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  });
}

/* ---------------- 5. tresors de lorraine ---------------- */
function construireLorraine() {
  const bois = ['christ-sainte-lucie', 'coffret-sainte-lucie', 'coffret-circulaire'].map(o);
  const Hb = PB.etroit() ? 170 : 260;
  $('[data-pieces-bois]').innerHTML = bois.map((x) => `<a href="${PB.lien(x)}" data-curseur="Voir" aria-label="${PB.esc(x.titre)}">${visuelPiece(x, { hauteur: x.id === 'christ-sainte-lucie' ? Hb * 1.25 : Math.round(Hb * 0.55) })}</a>`).join('');
  const daum = o('vase-daum');
  $('[data-pieces-verre]').innerHTML = `<a href="${PB.lien(daum)}" data-curseur="Voir" aria-label="${PB.esc(daum.titre)}">${visuelPiece(daum, { hauteur: PB.etroit() ? 260 : 380 })}</a>`;
  // veines du bois
  const svg = $('[data-veines]');
  let d = '';
  for (let i = 0; i < 16; i++) {
    const y0 = 20 + i * 24 + (Math.random() - 0.5) * 8;
    let p = `M-10 ${y0.toFixed(1)}`;
    for (let x = 0; x <= 620; x += 40) p += ` Q${x + 20} ${(y0 + Math.sin((x + i * 37) / 70) * 14 + (Math.random() - 0.5) * 6).toFixed(1)} ${x + 40} ${(y0 + Math.sin((x + 40 + i * 37) / 70) * 10).toFixed(1)}`;
    d += `<path d="${p}"/>`;
  }
  svg.innerHTML = d;
  if (calme) return;
  const veines = $$('path', svg);
  veines.forEach((v) => { const l = v.getTotalLength(); v.style.strokeDasharray = l; v.style.strokeDashoffset = l; });
  const tlB = gsap.timeline({ scrollTrigger: { trigger: '[data-bois]', start: 'top 72%', once: true } });
  tlB.to(veines, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.04 })
    .fromTo('[data-bois] .matiere-fond img', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: 'power3.inOut' }, 0.5)
    .to(veines, { opacity: 0.25, duration: 1 }, 1.8)
    .from($$('[data-pieces-bois] img'), { y: 90, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.15 }, 1.1);
  // gravure a l'acide : le vase apparait par morsures successives (canvas temporaire)
  const img = $('[data-pieces-verre] img');
  const lancer = () => {
    if (!img.complete || !img.naturalWidth) { img.addEventListener('load', lancer, { once: true }); return; }
    const r = img.getBoundingClientRect(); const pr = img.parentElement.getBoundingClientRect();
    const cv = document.createElement('canvas'); cv.className = 'gravure';
    const W = Math.round(r.width); const H = Math.round(r.height);
    cv.width = W; cv.height = H; cv.style.left = `${r.left - pr.left}px`; cv.style.top = `${r.top - pr.top}px`; cv.style.width = `${W}px`; cv.style.height = `${H}px`;
    img.parentElement.style.position = 'relative'; img.parentElement.append(cv);
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, W, H);
    const src = ctx.getImageData(0, 0, W, H); const out = ctx.createImageData(W, H);
    const bruit = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const n = Math.sin(x * 0.09 + Math.sin(y * 0.05) * 2.2) * 0.25 + Math.sin(y * 0.11 + x * 0.03) * 0.25 + Math.random() * 0.5; bruit[y * W + x] = n * 0.6 + (1 - y / H) * 0.4; }
    img.style.opacity = '0';
    const etat = { p: 0 };
    gsap.to(etat, {
      p: 1, duration: 2.2, ease: 'power1.inOut',
      onUpdate: () => {
        const s = src.data; const dd = out.data; const seuil = 1.1 - etat.p * 1.4;
        for (let i = 0; i < bruit.length; i++) {
          const v = Math.max(0, Math.min(1, (bruit[i] - seuil) * 6));
          const j = i * 4; dd[j] = s[j]; dd[j + 1] = s[j + 1]; dd[j + 2] = s[j + 2]; dd[j + 3] = s[j + 3] * v;
        }
        ctx.putImageData(out, 0, 0);
      },
      onComplete: () => { img.style.opacity = '1'; cv.remove(); },
    });
  };
  ScrollTrigger.create({ trigger: '[data-verre]', start: 'top 68%', once: true, onEnter: lancer });
}

/* ---------------- 7. carte ---------------- */
function construireCarte() {
  const z = $('[data-carte-est]');
  const P = FRANCE.pts;
  const vb = [628, 110, 304, 214];
  const lbl = (pt, t, cls, dx = 10, dy = -8, ancre = 'start') => `<text class="${cls}" x="${pt[0] + dx}" y="${pt[1] + dy}" text-anchor="${ancre}">${t}</text>`;
  z.innerHTML = `<svg viewBox="${vb.join(' ')}" role="img" aria-label="Carte du nord-est de la France : les boutiques de Metz et de Senon, près des frontières du Luxembourg, de l'Allemagne et de la Belgique">
    <path class="pays" d="${FRANCE.d}"/>
    <path class="route" d="M${P.metz[0]},${P.metz[1]} Q${P.metz[0] + 6},${P.metz[1] - 30} ${P.luxembourg[0]},${P.luxembourg[1]}"/>
    <path class="route" d="M${P.metz[0]},${P.metz[1]} Q${P.metz[0] + 40},${P.metz[1] - 14} ${P.allemagne[0]},${P.allemagne[1]}"/>
    <path class="route" d="M${P.metz[0]},${P.metz[1]} Q${P.metz[0] - 50},${P.metz[1] - 50} ${P.belgique[0]},${P.belgique[1]}"/>
    <circle class="halo" cx="${P.metz[0]}" cy="${P.metz[1]}" r="5"/><circle class="point" cx="${P.metz[0]}" cy="${P.metz[1]}" r="3.2"/>
    <circle class="halo" cx="${P.senon[0]}" cy="${P.senon[1]}" r="4"/><circle class="point" cx="${P.senon[0]}" cy="${P.senon[1]}" r="2.6"/>
    <circle class="point" cx="${P.nancy[0]}" cy="${P.nancy[1]}" r="1.6" style="opacity:.6"/>
    ${lbl(P.metz, 'Metz', 'ville', 8, 12)}${lbl(P.senon, 'Senon', 'ville', -8, -6, 'end')}${lbl(P.nancy, 'Nancy', '', 6, 3)}
    ${lbl(P.luxembourg, 'Luxembourg', 'voisin', 0, -6, 'middle')}${lbl(P.allemagne, 'Allemagne', 'voisin', 4, 0)}${lbl(P.belgique, 'Belgique', 'voisin', -4, -4, 'end')}
  </svg>`;
  if (calme) return;
  const routes = $$('.route', z);
  routes.forEach((r) => { const l = r.getTotalLength(); gsap.set(r, { strokeDasharray: `${l}`, strokeDashoffset: l }); });
  gsap.timeline({ scrollTrigger: { trigger: z, start: 'top 75%', once: true } })
    .from($('.pays', z), { opacity: 0, duration: 1.2 })
    .from($$('.point, .halo, text', z), { opacity: 0, scale: 0, transformOrigin: 'center', duration: 0.5, stagger: 0.08, ease: 'back.out(2)' }, 0.5)
    .to(routes, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.2, onComplete: () => routes.forEach((r) => gsap.set(r, { strokeDasharray: '5 6', strokeDashoffset: 0 })) }, 1);
}

/* ---------------- 8. boutiques et contact ---------------- */
function construireContact() {
  const sel = $('[data-choix-pieces]');
  sel.insertAdjacentHTML('beforeend', PB.objets.map((x) => `<option value="${x.id}">${PB.esc(x.titre)}</option>`).join(''));
  const ids = PB.selection.ids;
  const rappel = $('[data-selection-rappel]');
  const msg = $('[data-message]');
  const remplir = () => {
    if (!PB.selection.ids.length) { rappel.hidden = true; return; }
    rappel.hidden = false;
    rappel.innerHTML = `Votre sélection : ${PB.selection.ids.map((id) => `<strong>${PB.esc(o(id).titre)}</strong>`).join(', ')}.`;
    if (!msg.value.trim()) msg.value = `Bonjour,\nje souhaite connaître les prix des pièces suivantes :\n${PB.selection.texte()}\n`;
    const r = $('input[value="Demande de prix"]'); if (r) r.checked = true;
  };
  if (ids.length && PB.memo.session('pb-demande-sel') === '1') { PB.memo.session('pb-demande-sel', '0'); remplir(); }
  document.addEventListener('click', (e) => { if (e.target.closest('[data-demander-sel]')) setTimeout(remplir, 50); });
  sel.addEventListener('change', () => { const x = o(sel.value); if (x && !msg.value.trim()) msg.value = `Bonjour,\nje souhaite des renseignements sur : ${x.titre}.\n`; });
  PB.monterFormulaire($('[data-formulaire]'), { message: (f) => `Votre demande a bien été notée${f.querySelector('#c-nom').value ? `, ${f.querySelector('#c-nom').value.trim()}` : ''}.` });
  if (!calme) {
    $$('.boutique figure img').forEach((img) => gsap.fromTo(img, { yPercent: -5, scale: 1.1 }, { yPercent: 5, scale: 1.1, ease: 'none', scrollTrigger: { trigger: img.closest('figure'), start: 'top bottom', end: 'bottom top', scrub: true } }));
    gsap.from($$('.boutique'), { y: 60, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.15, scrollTrigger: { trigger: '.boutiques-grille', start: 'top 82%', once: true } });
    gsap.from('.conteneur img', { scale: 1.2, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: '.conteneur', start: 'top 85%', once: true } });
    gsap.fromTo('.caisse-fond', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.caisse-scene', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from($$('.liste-or li'), { x: -20, opacity: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out', scrollTrigger: { trigger: '.liste-or', start: 'top 85%', once: true } });
  }
}

/* ---------------- lancement ---------------- */
construireLorraine();
construireMarqueteries();
construireCaisse($('[data-caisse-svg]'));
if (!calme) gsap.fromTo('.expertise-accueil [data-parallaxe]', { yPercent: -8 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.expertise-accueil', start: 'top bottom', end: 'bottom top', scrub: true } });
construireCarte();
construireContact();
PB.dorer();
PB.balancer();
PB.aimants();
const lancer = () => { animerSalle(); construireFrise(); ScrollTrigger.sort(); ScrollTrigger.refresh(); };
if (document.fonts && document.fonts.ready) document.fonts.ready.then(lancer); else lancer();
// passage bureau / telephone : la mise en scene change, la page se recompose
const modeInitial = bureau();
addEventListener('resize', () => {
  clearTimeout(window.__pbResize);
  window.__pbResize = setTimeout(() => { if (bureau() !== modeInitial) location.reload(); }, 400);
});
