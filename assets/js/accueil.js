/* Accueil : flamme sur la boiserie, la maison, la salle des coups de coeur, la frise des siecles, la Lorraine, l'expertise. */
import PB, { demarrer } from './base.js?v=20261028';
import { fondLanterne } from './lumiere-gl.js?v=20261028';
import { FRANCE } from './formes.js?v=20261028';
import { pieceSalle, visuelPiece, hauteurRelative, largeurPiece, hauteurPourLargeur } from './cartes.js?v=20261028';
import { construireMarqueteries, construireCaisse } from './decors.js?v=20261028';

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
$('[data-annees-depuis]').textContent = annees;
if (!calme) {
  const ann = $('[data-annee]'); const c = { v: new Date().getFullYear() };
  let dernier = 0;
  // largeur fixe : la plus large des annees affichees, pour que rien ne bouge pendant le defilement des chiffres
  const fixerLargeur = () => {
    ann.style.minWidth = ''; let max = 0;
    for (let a = 1969; a <= new Date().getFullYear(); a++) { ann.textContent = a; max = Math.max(max, ann.getBoundingClientRect().width); }
    ann.style.minWidth = `${Math.ceil(max)}px`; ann.textContent = dernier || new Date().getFullYear();
  };
  fixerLargeur();
  if (document.fonts) document.fonts.ready.then(fixerLargeur);
  addEventListener('resize', () => { clearTimeout(ann._t); ann._t = setTimeout(fixerLargeur, 300); });
  const compter = (duree = 2.4) => { c.v = new Date().getFullYear(); gsap.to(c, { v: 1969, duration: duree, ease: 'power3.out', overwrite: true, onUpdate: () => { const v = Math.round(c.v); if (v !== dernier) { dernier = v; ann.textContent = v; if (PB.son.actif && v % 5 === 0) PB.son.tic(0.18, v % 10 === 0); } } }); };
  // le medaillon : son anneau tourne lentement (plus vite au survol), l'annee remonte le temps jusqu'a 1969
  const med = $('[data-medaillon]'); const anneau = $('.medaillon-anneau', med);
  const tour = gsap.to(anneau, { rotation: 360, duration: 48, ease: 'none', repeat: -1, transformOrigin: '50% 50%', paused: true });
  ScrollTrigger.create({ trigger: med, start: 'top bottom', end: 'bottom top', onToggle: (st) => (st.isActive ? tour.play() : tour.pause()) });
  med.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { gsap.to(tour, { timeScale: 7, duration: 0.6 }); compter(1.4); } });
  med.addEventListener('pointerleave', () => gsap.to(tour, { timeScale: 1, duration: 1.4 }));
  med.addEventListener('click', () => { compter(1.4); gsap.fromTo(tour, { timeScale: 9 }, { timeScale: 1, duration: 2 }); });
  const nb = $('[data-annees-depuis]'); const cn = { v: 0 }; nb.textContent = 0;
  const tlM = gsap.timeline({ scrollTrigger: { trigger: '.maison-grille', start: 'top 78%', once: true } });
  tlM.from('.maison-photo .cadre-photo', { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'power3.inOut', clearProps: 'clipPath' }, 0)
    .from('.maison-photo .filet-or', { x: -22, y: 22, opacity: 0, duration: 1.2, ease: 'power3.out' }, 0.5)
    .from(med, { scale: 0.4, rotation: -60, opacity: 0, duration: 1, ease: 'back.out(1.8)', onStart: () => compter() }, 0.8)
    .from('.maison-photo figcaption', { opacity: 0, y: 10, duration: 0.7, ease: 'power2.out' }, 0.8);
  gsap.timeline({ scrollTrigger: { trigger: '[data-reperes]', start: 'top 94%', once: true } })
    .fromTo('.reperes', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 -10% 0 0)', duration: 1.2, ease: 'power3.inOut', clearProps: 'clipPath' }, 0)
    .from($$('.reperes li'), { y: 18, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12 }, 0.25)
    .to(cn, { v: annees, duration: 1.6, ease: 'power2.out', onUpdate: () => { nb.textContent = Math.round(cn.v); } }, 0.3);
  gsap.from($$('[data-cachets] .cachet'), { opacity: 0, duration: 0.01, stagger: 0.16, scrollTrigger: { trigger: '[data-cachets]', start: 'top 92%', once: true } });
  gsap.from($$('[data-cachets] .cire'), { scale: 1.9, opacity: 0, rotation: () => gsap.utils.random(-30, 30), duration: 0.55, ease: 'back.out(2.2)', stagger: 0.16, clearProps: 'transform,opacity', scrollTrigger: { trigger: '[data-cachets]', start: 'top 92%', once: true } });
  gsap.from($$('[data-cachets] .cachet strong, [data-cachets] .cachet > span:not(.cire)'), { opacity: 0, y: 10, duration: 0.6, stagger: 0.08, delay: 0.3, scrollTrigger: { trigger: '[data-cachets]', start: 'top 92%', once: true } });
  gsap.fromTo('[data-parallaxe-photo] img', { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.maison-photo', start: 'top bottom', end: 'bottom top', scrub: true } });
}

// un cachet se presse comme un sceau qu'on appose
$$('[data-cachets] .cachet').forEach((li) => li.addEventListener('pointerdown', () => {
  const cire = $('.cire', li); cire.classList.remove('presse'); void cire.offsetWidth; cire.classList.add('presse');
  PB.son.tic(0.45, false);
}));

/* ---------------- 3. coups de coeur ---------------- */
const piste = $('[data-piste-salle]');
// sur ordinateur, la salle tient dans l'ecran : pieces, etiquettes et boutons toujours visibles
const hauteurSalle = () => {
  if (!bureau()) return Math.min(innerHeight * 0.4, 330);
  $('#coups-de-coeur').classList.add('est-epinglee');
  return Math.max(130, Math.min(440, $('.salle-piste-zone').clientHeight - 190));
};
const rendreSalle = () => {
  const H = hauteurSalle();
  // sur telephone, chaque piece tient entiere dans la largeur de l'ecran
  const limite = (x, h) => (bureau() ? h : Math.min(h, hauteurPourLargeur(x, innerWidth - 56)));
  piste.innerHTML = PB.objets.map((x) => pieceSalle(x, Math.round(limite(x, hauteurRelative(x, H, H * 0.42))))).join('');
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
    // compteur, titre et barre d'avancement sous la salle ; images chargees avant le premier geste
    zone.insertAdjacentHTML('afterend', `<div class="hud-salle hud-salle--mobile" aria-hidden="true"><span class="chiffres" data-hud-n>1 / ${pieces.length}</span><strong data-hud-t>${PB.esc(PB.objets[0].titre)}</strong><span class="barre"><i data-hud-barre></i></span></div><p class="mini indice-glisser indice-salle" aria-hidden="true">Faites glisser les pièces →</p>`);
    const hudN = $('[data-hud-n]', sec); const hudT = $('[data-hud-t]', sec); const hudB = $('[data-hud-barre]', sec);
    new IntersectionObserver(([en], obs) => { if (en.isIntersecting) { $$('img[loading="lazy"]', piste).forEach((i) => { i.loading = 'eager'; }); obs.disconnect(); } }, { rootMargin: '900px 0px' }).observe(sec);
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (!en.isIntersecting) return;
      colorer(en.target); const k = pieces.indexOf(en.target);
      hudN.textContent = `${k + 1} / ${pieces.length}`; hudT.textContent = PB.objets[k].titre;
    }), { root: zone, threshold: 0.6 });
    pieces.forEach((p) => io.observe(p));
    let x0 = zone.scrollLeft; let t0 = performance.now(); let repos;
    const balanM = gsap.quickTo(sec, '--balan', { duration: 0.4, ease: 'power2' });
    zone.addEventListener('scroll', () => {
      const m = zone.scrollWidth - zone.clientWidth; hudB.style.transform = `scaleX(${m > 0 ? zone.scrollLeft / m : 0})`;
      if (!calme) {
        const t = performance.now(); const v = (zone.scrollLeft - x0) / Math.max(16, t - t0) * 1000; x0 = zone.scrollLeft; t0 = t;
        balanM(gsap.utils.clamp(-10, 10, -v / 160));
        clearTimeout(repos); repos = setTimeout(() => gsap.to(sec, { '--balan': 0, duration: 1.8, ease: 'elastic.out(1.1, 0.2)' }), 140);
      }
      $('.indice-salle', sec)?.classList.add('vu');
    }, { passive: true });
    return;
  }
  const distance = () => piste.scrollWidth - innerWidth;
  const tw = gsap.to(piste, { x: () => -distance(), ease: 'none' });
  sec.insertAdjacentHTML('beforeend', `<div class="hud-salle" aria-hidden="true"><span class="chiffres" data-hud-n>1 / ${pieces.length}</span><strong data-hud-t>${PB.esc(PB.objets[0].titre)}</strong><span class="barre"><i data-hud-barre></i></span></div>`);
  const hudN = $('[data-hud-n]', sec); const hudT = $('[data-hud-t]', sec); const hudB = $('[data-hud-barre]', sec);
  const vit = $('[data-vitrail]', sec);
  // les etiquettes se balancent selon la vitesse du defilement, puis reviennent en oscillant
  const balan = gsap.quickTo(sec, '--balan', { duration: 0.5, ease: 'power2' });
  let retour = null;
  const st = ScrollTrigger.create({
    trigger: sec, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.7, animation: tw, invalidateOnRefresh: true, anticipatePin: 1,
    onScrubComplete: () => { retour = gsap.to(sec, { '--balan': 0, duration: 1.5, ease: 'elastic.out(1.1, 0.22)' }); },
  });
  tw.eventCallback('onUpdate', () => {
    const pr = tw.progress();
    const v = st.getVelocity();
    if (Math.abs(v) > 30) { retour?.kill(); retour = null; balan(gsap.utils.clamp(-8, 8, -v / 140)); }
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
    ScrollTrigger.update(); st.getTween?.()?.progress(1);
  });
}

/* ---------------- 4. frise des siecles ---------------- */
const DEBUT = 1670; const FIN = 2000;
/* sur telephone : frise verticale, au fil du defilement, avec un balancier qui reste au milieu de l'ecran */
function construireFriseVerticale() {
  const scene = $('[data-frise]'); const pisteF = $('[data-frise-piste]');
  const anneeTete = $('[data-frise-annee]'); anneeTete.hidden = true;
  $('#frise').classList.add('est-verticale');
  const triees = [...PB.objets].sort((a, b) => a.annee - b.annee);
  const siecleDe = (a) => (a <= 1700 ? 'XVIIe' : a <= 1800 ? 'XVIIIe' : a <= 1900 ? 'XIXe' : 'XXe');
  let html = `<div class="frise-v-aiguille" aria-hidden="true"><b></b><span class="chiffres" data-frise-v-annee>${triees[0].annee}</span></div><ol class="frise-v">`;
  let siecle = '';
  triees.forEach((x) => {
    const sc = siecleDe(x.annee);
    if (sc !== siecle) { siecle = sc; html += `<li class="frise-v-siecle" aria-hidden="true"><span class="dore">${sc}</span> siècle</li>`; }
    html += `<li class="frise-v-piece" data-annee="${x.annee}"><a href="${PB.lien(x)}" data-carte aria-label="${PB.esc(x.titre)}, ${PB.esc(x.epoque)}"><span class="frise-v-visuel">${visuelPiece(x, { hauteur: Math.round(hauteurRelative(x, 170, 120)) })}</span><span class="frise-v-texte"><span class="date">${PB.esc(x.epoque)}</span><span class="t">${PB.esc(x.titre)}</span></span></a></li>`;
  });
  html += `</ol><a class="frise-fin frise-fin--v" href="galerie.html"><span class="mini">Les ${PB.objets.length} pièces</span><strong>Toute la galerie</strong>${PB.ICO.fleche}</a>`;
  pisteF.innerHTML = html;
  const an = $('[data-frise-v-annee]', pisteF);
  let active = null;
  const items = $$('.frise-v-piece', pisteF);
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (!en.isIntersecting) return;
    const li = en.target; an.textContent = li.dataset.annee;
    if (active !== li) { active?.classList.remove('au-balancier'); li.classList.add('au-balancier'); active = li; PB.son.tic(0.22, true); }
  }), { rootMargin: '-48% 0px -48% 0px' });
  items.forEach((li) => io.observe(li));
  if (calme) return;
  items.forEach((li) => gsap.from($('a', li), { x: 40, opacity: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: li, start: 'top 95%', once: true } }));
  gsap.from($$('.frise-v-siecle', pisteF), { opacity: 0, x: -20, duration: 0.8, ease: 'power3.out', stagger: 0, scrollTrigger: { trigger: pisteF, start: 'top 85%', once: true } });
}

function construireFrise() {
  if (PB.etroit()) { construireFriseVerticale(); return; }
  const scene = $('[data-frise]'); const pisteF = $('[data-frise-piste]');
  const k = bureau() ? Math.max(9, innerWidth / 110) : 11; // pixels par annee
  const marge = bureau() ? innerWidth * 0.5 : 60;
  const X = (a) => marge + (a - DEBUT) * k;
  const largeur = X(FIN) + marge + (bureau() ? 0 : 300);
  const triees = [...PB.objets].sort((a, b) => a.annee - b.annee);
  let html = '<div class="frise-axe"></div>';
  for (let a = 1680; a <= FIN; a += 10) html += `<span class="frise-tic${a % 50 === 0 ? ' decennie' : ''}" style="left:${X(a)}px">${a % 50 === 0 ? `<span class="chiffres">${a}</span>` : ''}</span>`;
  [['XVIIe', 1670, 1700], ['XVIIIe', 1701, 1800], ['XIXe', 1801, 1900], ['XXe', 1901, 2000]].forEach(([n, a]) => { html += `<span class="frise-siecle dore" style="left:${X(Math.max(a, DEBUT)) + 8}px">${n}<span class="sr"> siècle</span></span>`; });
  const anneeEl0 = $('[data-frise-annee]');
  $('.frise-tete').append(anneeEl0);
  if (bureau()) $('#frise').classList.add('est-epinglee');
  else $('.frise-tete').insertAdjacentHTML('beforeend', '<p class="mini indice-glisser" aria-hidden="true">Faites glisser la frise →</p>');
  const Hh = bureau() ? Math.max(80, Math.min(240, scene.clientHeight / 2 - 128)) : 130;
  triees.forEach((x, i) => {
    const pos = i % 2 ? 'bas' : 'haut';
    html += `<a class="frise-piece ${pos}" href="${PB.lien(x)}" data-carte data-annee="${x.annee}" style="left:${X(x.annee)}px" aria-label="${PB.esc(x.titre)}, ${PB.esc(x.epoque)}">
      ${visuelPiece(x, { hauteur: hauteurRelative(x, Hh, Hh * 0.72) })}<span class="date">${PB.esc(x.epoque)}</span><span class="t">${PB.esc(x.titre)}</span></a>`;
  });
  html += `<a class="frise-fin" href="galerie.html" style="left:${X(FIN) + (bureau() ? innerWidth * 0.2 : 70)}px"><span class="mini">Les ${PB.objets.length} pièces</span><strong>Toute la galerie</strong>${PB.ICO.fleche}</a>`;
  pisteF.innerHTML = html;
  pisteF.style.width = `${largeur}px`;
  // les noms de siecle s'ecartent des fils des pieces du bas et des millesimes
  const obstacles = [
    ...triees.filter((x, i) => i % 2).map((x) => [X(x.annee) - 2, X(x.annee) + 2]),
    ...[...Array(Math.floor((FIN - 1680) / 50) + 1)].map((_, n) => 1700 + n * 50).filter((a) => a <= FIN).map((a) => [X(a) + 4, X(a) + 44]),
  ];
  $$('.frise-siecle', pisteF).forEach((el) => {
    const w = el.offsetWidth; let g = parseFloat(el.style.left); let bouge = true; let n = 0;
    while (bouge && n++ < 12) { bouge = false; obstacles.forEach(([a, z]) => { if (g < z + 8 && g + w > a - 8) { g = z + 10; bouge = true; } }); }
    el.style.left = `${g}px`;
  });
  const anneeEl = $('[data-frise-annee]');
  if (!bureau()) {
    scene.style.overflowX = 'auto'; scene.style.height = `${(Hh + 90) * 2 + 80}px`;
    scene.addEventListener('scroll', () => { anneeEl.textContent = Math.round(DEBUT + (scene.scrollLeft + scene.clientWidth / 2 - marge) / k); }, { passive: true });
    return;
  }
  scene.insertAdjacentHTML('beforeend', '<div class="frise-pendule" aria-hidden="true"><i></i><b></b></div>');
  const dist = () => largeur - innerWidth;
  const tw = gsap.to(pisteF, { x: () => -dist(), ease: 'none' });
  const st = ScrollTrigger.create({
    trigger: '#frise', start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.8, animation: tw, invalidateOnRefresh: true, anticipatePin: 1,
  });
  const piecesF = $$('.frise-piece', pisteF).map((p) => [p, parseFloat(p.style.left)]);
  let active = null;
  tw.eventCallback('onUpdate', () => {
    const x = -gsap.getProperty(pisteF, 'x') + innerWidth / 2;
    anneeEl.textContent = Math.max(DEBUT, Math.min(FIN, Math.round(DEBUT + (x - marge) / k)));
    // la piece sous le balancier s'eclaire, un tic si le son est actif
    let p = null; let bd = 70;
    piecesF.forEach(([el, px]) => { const d = Math.abs(px - x); if (d < bd) { bd = d; p = el; } });
    if (p !== active) { active?.classList.remove('au-balancier'); p?.classList.add('au-balancier'); if (p) PB.son.tic(0.22, true); active = p; }
  });
  const balancier = gsap.to('.frise-pendule', { rotation: 2.5, transformOrigin: '50% 0%', duration: 1, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });
  ScrollTrigger.create({ trigger: '#frise', start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? balancier.play() : balancier.pause()) });
  $$('.frise-piece', pisteF).forEach((p, n) => {
    const haut = p.classList.contains('haut');
    const deja = parseFloat(p.style.left) < innerWidth * 0.96;
    const st2 = deja ? { trigger: '#frise', start: 'top 70%', toggleActions: 'play none none reverse' } : { trigger: p, containerAnimation: tw, start: 'left 96%', toggleActions: 'play none none reverse' };
    gsap.fromTo(p, { y: haut ? -160 : 160, opacity: 0 }, { y: 0, opacity: 1, ease: 'bounce.out', duration: 1, delay: deja ? n * 0.12 : 0, scrollTrigger: st2 });
  });
  pisteF.addEventListener('focusin', (ev) => {
    const p = ev.target.closest('.frise-piece'); if (!p) return;
    const pr = Math.min(1, Math.max(0, (p.offsetLeft - innerWidth / 2) / dist()));
    const y = st.start + (st.end - st.start) * pr;
    if (PB.lenis) PB.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
    ScrollTrigger.update(); st.getTween?.()?.progress(1); ScrollTrigger.update();
    // la piece qui recoit le focus est montree tout de suite, sans attendre son entree animee
    gsap.getTweensOf(p).forEach((t) => t.progress(1)); gsap.set(p, { opacity: 1, y: 0 });
  });
}

/* ---------------- 5. tresors de lorraine ---------------- */
function construireLorraine() {
  const bois = ['christ-sainte-lucie', 'coffret-sainte-lucie', 'coffret-circulaire'].map(o);
  const Hb = PB.etroit() ? 170 : 260;
  $('[data-pieces-bois]').innerHTML = bois.map((x) => { const hb = x.id === 'christ-sainte-lucie' ? Hb * 1.25 : Math.round(Hb * 0.55); return `<a href="${PB.lien(x)}" data-curseur="Voir" aria-label="${PB.esc(x.titre)}" style="flex:0 1 ${largeurPiece(x, hb)}px">${visuelPiece(x, { hauteur: hb })}</a>`; }).join('');
  const daum = o('vase-daum');
  const hd = PB.etroit() ? 260 : 380;
  $('[data-pieces-verre]').innerHTML = `<a href="${PB.lien(daum)}" data-curseur="Voir" aria-label="${PB.esc(daum.titre)}" style="flex:0 1 ${largeurPiece(daum, hd)}px">${visuelPiece(daum, { hauteur: hd })}</a>`;
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
  const tlB = gsap.timeline({ scrollTrigger: { trigger: '[data-bois]', start: 'top 85%', once: true } });
  tlB.to(veines, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.04 })
    .fromTo('[data-bois] .matiere-fond img', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: 'power3.inOut' }, 0.5)
    .to(veines, { opacity: 0.25, duration: 1 }, 1.8)
    .from($$('[data-pieces-bois] img'), { y: 90, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.12 }, 0.5);
  // gravure a l'acide : le vase apparait par morsures successives (canvas temporaire)
  const img = $('[data-pieces-verre] img');
  const lancer = () => {
    if (!img.complete || !img.naturalWidth) { img.addEventListener('load', lancer, { once: true }); return; }
    const r = img.getBoundingClientRect(); const pr = img.parentElement.getBoundingClientRect();
    const cv = document.createElement('canvas'); cv.className = 'gravure';
    // a la resolution de l'ecran (2x maxi) : la piece reste nette pendant la gravure
    const dpr = Math.min(2, devicePixelRatio || 1);
    const Wc = Math.round(r.width); const Hc = Math.round(r.height);
    const W = Math.round(Wc * dpr); const H = Math.round(Hc * dpr);
    cv.width = W; cv.height = H; cv.style.left = `${r.left - pr.left}px`; cv.style.top = `${r.top - pr.top}px`; cv.style.width = `${Wc}px`; cv.style.height = `${Hc}px`;
    img.parentElement.style.position = 'relative'; img.parentElement.append(cv);
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, W, H);
    const src = ctx.getImageData(0, 0, W, H); const out = ctx.createImageData(W, H);
    const bruit = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const xs = x / dpr; const ys = y / dpr; const n = Math.sin(xs * 0.09 + Math.sin(ys * 0.05) * 2.2) * 0.25 + Math.sin(ys * 0.11 + xs * 0.03) * 0.25 + Math.random() * 0.5; bruit[y * W + x] = n * 0.6 + (1 - y / H) * 0.4; }
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
  ScrollTrigger.create({ trigger: '[data-verre]', start: 'top 80%', once: true, onEnter: lancer });
}

/* ---------------- 7. carte ---------------- */
function construireCarte() {
  const z = $('[data-carte-est]');
  const P = FRANCE.pts;
  const vb = [628, 110, 304, 214];
  const lbl = (pt, t, cls, dx = 10, dy = -8, ancre = 'start') => `<text class="${cls}" x="${pt[0] + dx}" y="${pt[1] + dy}" text-anchor="${ancre}">${t}</text>`;
  z.innerHTML = `<svg viewBox="${vb.join(' ')}" role="img" aria-label="Carte du nord-est de la France : la boutique de Metz, Nancy et le Luxembourg, près des frontières de l'Allemagne et de la Belgique">
    <path class="pays" d="${FRANCE.d}"/>
    <path class="route" d="M${P.metz[0]},${P.metz[1]} Q${P.metz[0] + 6},${P.metz[1] - 30} ${P.luxembourg[0]},${P.luxembourg[1]}"/>
    <path class="route" d="M${P.metz[0]},${P.metz[1]} Q${P.metz[0] + 12},${P.metz[1] + 22} ${P.nancy[0]},${P.nancy[1]}"/>
    <circle class="halo" cx="${P.metz[0]}" cy="${P.metz[1]}" r="5"/><circle class="point" cx="${P.metz[0]}" cy="${P.metz[1]}" r="3.2"/>
    <circle class="point" cx="${P.nancy[0]}" cy="${P.nancy[1]}" r="2" style="opacity:.8"/><circle class="point" cx="${P.luxembourg[0]}" cy="${P.luxembourg[1]}" r="2" style="opacity:.8"/>
    ${lbl(P.metz, 'Metz', 'ville', 8, 12)}${lbl(P.nancy, 'Nancy', 'ville-2', 6, 3)}
    ${lbl(P.luxembourg, 'Luxembourg', 'voisin', 0, -6, 'middle')}${lbl(P.allemagne, 'Allemagne', 'voisin', 4, 0)}${lbl(P.belgique, 'Belgique', 'voisin', -8, 16, 'end')}
  </svg><a class="carte-lien" href="https://www.google.com/maps/search/?api=1&amp;query=5+rue+Gambetta+57000+Metz" target="_blank" rel="noopener">Itinéraire vers la boutique</a>`;
  new IntersectionObserver(([en]) => z.classList.toggle('a-l-ecran', en.isIntersecting)).observe(z);
  if (calme) return;
  const routes = $$('.route', z);
  routes.forEach((r) => { const l = r.getTotalLength(); gsap.set(r, { strokeDasharray: `${l}`, strokeDashoffset: l }); });
  gsap.timeline({ scrollTrigger: { trigger: z, start: 'top 88%', once: true } })
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
    if (!msg.value.trim()) msg.value = PB.typo(`Bonjour,\nje souhaite connaître les prix des pièces suivantes :\n${PB.selection.texte()}\n`);
    const r = $('input[value="Demande de prix"]'); if (r) r.checked = true;
  };
  if (ids.length && PB.memo.session('pb-demande-sel') === '1') { PB.memo.session('pb-demande-sel', '0'); remplir(); }
  document.addEventListener('click', (e) => { if (e.target.closest('[data-demander-sel]')) setTimeout(remplir, 50); });
  sel.addEventListener('change', () => { const x = o(sel.value); if (x && !msg.value.trim()) msg.value = PB.typo(`Bonjour,\nje souhaite des renseignements sur : ${x.titre}.\n`); });
  PB.monterFormulaire($('[data-formulaire]'), { message: (f) => `Votre demande a bien été notée${f.querySelector('#c-nom').value ? `, ${f.querySelector('#c-nom').value.trim()}` : ''}.` });
  if (!calme) {
    $$('.boutique figure img').forEach((img) => gsap.fromTo(img, { yPercent: -5, scale: 1.1 }, { yPercent: 5, scale: 1.1, ease: 'none', scrollTrigger: { trigger: img.closest('figure'), start: 'top bottom', end: 'bottom top', scrub: true } }));
    gsap.from($$('.boutique'), { y: 60, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.15, scrollTrigger: { trigger: '.boutiques-grille', start: 'top 92%', once: true } });
    gsap.from('.conteneur img', { scale: 1.2, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: '.conteneur', start: 'top 94%', once: true } });
    gsap.fromTo('.caisse-fond', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.caisse-scene', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from($$('.liste-or li'), { x: -20, opacity: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out', scrollTrigger: { trigger: '.liste-or', start: 'top 94%', once: true } });
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
  // pas de rechargement si le visiteur a commence a remplir le formulaire
  const rempli = () => [...document.querySelectorAll('input:not([type=radio]):not([type=checkbox]), textarea')].some((c) => c.value.trim() && c.value !== c.defaultValue);
  window.__pbResize = setTimeout(() => { if (bureau() !== modeInitial && !rempli()) location.reload(); }, 400);
});
