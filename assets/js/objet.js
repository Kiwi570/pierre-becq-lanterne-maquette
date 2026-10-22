/* Fiche d'une piece : sortie de l'ombre, vues a la loupe d'expert, description, vue a l'echelle, demande de prix. */
import PB, { demarrer } from './base.js';
import { fondLanterne } from './lumiere-gl.js';
import { visuelPiece, carteGalerie, boutonSelection } from './cartes.js';

demarrer();
const { gsap, ScrollTrigger, calme } = PB;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const e = PB.esc;

const demande = new URLSearchParams(location.search).get('o');
const O = PB.parId[demande] || PB.parId['pendule-empire'];
if (demande && !PB.parId[demande]) {
  $('main').insertAdjacentHTML('afterbegin', `<div class="introuvable" role="status"><div class="contenu"><p>Cette pièce n'est plus en ligne ou a changé d'adresse. Voici la pendule Empire ; toutes les pièces sont dans la <a class="lien" href="galerie.html">galerie</a>.</p></div></div>`);
}
document.title = `${O.titre} — Pierre Becq, antiquaire à Metz`;
const desc = `${O.titre}, ${O.epoque}${PB.dims(O) ? `, ${PB.dims(O)}` : ''}. ${PB.mentionPrix(O)}. Pierre Becq, antiquaire à Metz.`;
document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
document.querySelector('meta[property="og:title"]')?.setAttribute('content', O.titre);
document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
document.querySelector('meta[property="og:image"]')?.setAttribute('content', new URL(`assets/${PB.visuel(O).src}-${PB.visuel(O).tailles.at(-1)[0]}.webp`, location.href).href);
const ld = document.createElement('script'); ld.type = 'application/ld+json';
ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: O.titre, description: O.texte.join(' '), material: O.materiaux, image: `assets/${PB.visuel(O).src}-${PB.visuel(O).tailles.at(-1)[0]}.webp`, brand: { '@type': 'Organization', name: 'Pierre Becq Antiquaire' } });
document.head.append(ld);

/* ---------- entree ---------- */
const fam = PB.familles[O.famille] || 'La galerie';
$('[data-fil]').innerHTML = `<a href="index.html">Accueil</a><span aria-hidden="true">/</span><a href="galerie.html?f=${O.famille}">${e(fam)}</a><span aria-hidden="true">/</span><span aria-current="page">${e(O.titre)}</span>`;
$('[data-titre]').textContent = O.titre;
$('[data-epoque]').textContent = O.auteur || fam;
const lignes = [
  ['Époque', O.epoque], ['Auteur', O.auteur], ['Signature', O.signature], ['Matériaux', O.materiaux],
  ['Dimensions', PB.dims(O) || '<span class="a-completer">à compléter</span>'], ['Provenance', O.provenance],
].filter(([, v]) => v);
$('[data-cartel]').innerHTML = lignes.map(([k, v]) => `<dt>${k}</dt><dd>${k === 'Dimensions' ? v : e(v)}</dd>`).join('');
const vente = PB.enVente(O);
$('[data-actions]').innerHTML = vente
  ? `<a class="bouton bouton--or" href="#demande"><span>Demander le prix</span></a>${boutonSelection(O, 'bouton')}`
  : '<a class="bouton bouton--or" href="#demande"><span>Se renseigner</span></a>';
if (vente) $('[data-actions] [data-selection]').innerHTML = '<span>Ajouter à ma sélection</span>';
$('[data-actions]').insertAdjacentHTML('afterend', '<p class="visite-lien"><a class="lien" href="#demande" data-visite>La voir en boutique, 5 rue Gambetta à Metz</a></p>');
$('[data-visite]').addEventListener('click', () => { const r = $('input[value="Voir la pièce en boutique"]'); if (r) r.checked = true; });
$('.garantie').textContent = `${PB.ancienne(O) ? 'Marchandise garantie ancienne. ' : ''}Certificat d'authenticité à la demande.${vente ? ' Expédition par des professionnels.' : ''}`;
if (!vente) {
  $('.prix-objet').innerHTML = '<span class="sur-titre">Vente</span><strong>Soumise à certificat</strong>';
  $('#titre-demande').innerHTML = '<span class="dore" data-dorure>Se renseigner</span> sur la pièce';
}

const scene = $('[data-scene]');
const v = PB.visuel(O);
const haut = Math.round(Math.min(innerHeight * (PB.etroit() ? 0.38 : 0.68), 660));
// la piece est deja posee par le script de la page (pour la transition depuis la galerie) ; sinon on la pose ici
if (scene.dataset.pret) {
  scene.insertAdjacentHTML('afterbegin', '<span class="halo-piece" aria-hidden="true"></span>');
  if (PB.estDetoure(O)) scene.insertAdjacentHTML('beforeend', '<span class="ombre-piece" aria-hidden="true"></span>');
} else {
  scene.innerHTML = `<span class="halo-piece" aria-hidden="true"></span>${visuelPiece(O, { hauteur: haut, lazy: false, cls: PB.estDetoure(O) ? 'piece-grande' : '' })}${PB.estDetoure(O) ? '<span class="ombre-piece" aria-hidden="true"></span>' : ''}`;
}
const viaTransition = PB.memo.session('pb-vt') === '1';
if (viaTransition) PB.memo.session('pb-vt', '0');
let fond = null;
if (PB.gl) {
  fond = fondLanterne($('[data-fond-gl]'), { image: PB.amb('g-boiserie-laque-16x9'), imageMobile: PB.amb('g-boiserie-laque-9x16'), teinte: 0.22 });
  if (fond) fond.teinter(O.couleur, 0.28);
}
document.documentElement.classList.remove('attente');
if (!calme) {
  const img = $('img', scene);
  if (!viaTransition) gsap.set(img.closest('.cadre-dore') || img, { opacity: 0, y: 40 });
  gsap.set($$('.objet-infos > *'), { opacity: 0, y: 24 });
  PB.pret.then(() => {
    gsap.timeline()
      .fromTo($('.halo-piece', scene), { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 2, ease: 'power2.out' }, 0)
      .to(img.closest('.cadre-dore') || img, { opacity: 1, y: 0, duration: viaTransition ? 0.01 : 1.6, ease: 'power3.out' }, 0.2)
      .to($$('.objet-infos > *'), { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, 0.3);
  });
}

// la piece tourne legerement vers la flamme du curseur
if (!calme && PB.pointeurFin) {
  const cible = $('img', scene).closest('.cadre-dore') || $('img', scene);
  gsap.set(cible, { transformPerspective: 1000 });
  const ry = gsap.quickTo(cible, 'rotationY', { duration: 1.2, ease: 'power3' });
  const rx = gsap.quickTo(cible, 'rotationX', { duration: 1.2, ease: 'power3' });
  addEventListener('pointermove', (ev) => { if (scrollY > innerHeight) return; ry(((ev.clientX / innerWidth) - 0.6) * 10); rx((0.5 - ev.clientY / innerHeight) * 5); }, { passive: true });
}

/* ---------- vues et loupe d'expert ---------- */
const vis = $('[data-visionneuse]'); const vue = $('[data-vue]'); const loupe = $('.loupe', vis);
const VUES = O.vues;
let courant = 0;
const grande = (p) => `assets/${p.src}-${p.tailles.at(-1)[0]}.webp`;
function montrer(i, anime = true) {
  const p = VUES[i]; if (!p) return;
  courant = i;
  $$('[data-vignettes] button').forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
  const poser = () => {
    vue.src = PB.src(p, 1200); vue.srcset = PB.srcset(p); vue.sizes = '(max-width: 860px) 92vw, 60vw';
    vue.alt = `${PB.alt(O)}, vue ${i + 1} sur ${VUES.length}`;
    loupe.dataset.src = grande(p); if (loupe.style.backgroundImage) loupe.style.backgroundImage = `url("${loupe.dataset.src}")`;
    vis.style.backgroundColor = p.fond || '#e8e4dd'; loupe.style.backgroundColor = p.fond || '#e8e4dd';
  };
  if (!anime || calme) { poser(); return; }
  gsap.to(vue, { opacity: 0, scale: 0.98, duration: 0.25, onComplete: () => { poser(); gsap.fromTo(vue, { opacity: 0, scale: 1.02 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }); } });
}
$('[data-vignettes]').innerHTML = VUES.map((p, i) => `<button type="button" aria-label="Vue ${i + 1} sur ${VUES.length}" aria-current="${i === 0}"><img src="${PB.src(p, 300)}" alt="" loading="lazy"></button>`).join('') +
  `<p class="mini" style="grid-column:1/-1">${VUES.length} ${VUES.length > 1 ? 'vues' : 'vue'}, photos de la boutique.</p>`;
$$('[data-vignettes] button').forEach((b, i) => b.addEventListener('click', () => { if (i !== courant) montrer(i); }));
montrer(0, false);
const zoom = 2.6;
const placer = (x, y) => {
  const r = vue.getBoundingClientRect(); const rv = vis.getBoundingClientRect();
  if (x < r.left || x > r.right || y < r.top || y > r.bottom) { vis.classList.remove('loupe-on'); return; }
  if (!loupe.style.backgroundImage) loupe.style.backgroundImage = `url("${loupe.dataset.src}")`;
  vis.classList.add('loupe-on');
  const R = loupe.offsetWidth / 2;
  loupe.style.left = `${x - rv.left}px`; loupe.style.top = `${y - rv.top}px`;
  loupe.style.backgroundSize = `${r.width * zoom}px ${r.height * zoom}px`;
  loupe.style.backgroundPosition = `${-((x - r.left) * zoom - R)}px ${-((y - r.top) * zoom - R)}px`;
};
vis.addEventListener('pointermove', (ev) => { if (ev.pointerType === 'mouse') placer(ev.clientX, ev.clientY); });
vis.addEventListener('pointerleave', () => vis.classList.remove('loupe-on'));
vis.addEventListener('click', (ev) => { if (ev.target.closest('[data-plein]')) return; ouvrirPlein(courant, vis); });
// l'aide s'efface d'elle-meme pour ne pas cacher la piece
new IntersectionObserver(([en], obs) => { if (en.isIntersecting) { setTimeout(() => $('[data-aide]').classList.add('vu'), 4000); obs.disconnect(); } }, { threshold: 0.6 }).observe(vis);
vis.addEventListener('pointerenter', () => setTimeout(() => $('[data-aide]').classList.add('vu'), 1200), { once: true });
vis.tabIndex = 0; vis.setAttribute('role', 'group'); vis.setAttribute('aria-label', 'Visionneuse : flèches gauche et droite pour changer de vue');
vis.addEventListener('keydown', (ev) => { if (ev.key === 'ArrowRight') montrer((courant + 1) % VUES.length); if (ev.key === 'ArrowLeft') montrer((courant - 1 + VUES.length) % VUES.length); });
if (!PB.pointeurFin) $('[data-aide]').textContent = 'Touchez la photo pour l’agrandir.';
/* plein ecran : vues precedente et suivante, balayage, zoom au toucher ou au clic, deplacement du zoom */
const pe = $('[data-plein-ecran]'); pe.inert = true;
const peCadre = $('[data-pe-cadre]', pe); const peImg = $('[data-pe-img]', pe); const peCompte = $('[data-pe-compte]', pe);
let peI = 0; let retourPlein = null;
const peMontrer = (i) => {
  peI = (i + VUES.length) % VUES.length; peCadre.classList.remove('zoom');
  peImg.src = grande(VUES[peI]); peImg.alt = `${PB.alt(O)}, vue ${peI + 1} sur ${VUES.length}`;
  peCompte.textContent = `${peI + 1} / ${VUES.length}`;
  $('[data-pe-prec]', pe).hidden = VUES.length < 2; $('[data-pe-suiv]', pe).hidden = VUES.length < 2;
};
const ouvrirPlein = (i, depuis) => {
  retourPlein = depuis || $('[data-plein]'); peMontrer(i);
  pe.classList.add('on'); pe.inert = false; PB.isoler(pe, true); PB.lenis?.stop(); $('[data-fermer-plein]').focus();
  setTimeout(() => $('[data-pe-aide]', pe).classList.add('vu'), 3500);
};
$('[data-pe-aide]', pe).textContent = PB.pointeurFin ? 'Cliquez sur la photo pour zoomer, flèches pour changer de vue' : 'Touchez la photo pour zoomer, balayez pour changer de vue';
$('[data-plein]').addEventListener('click', (ev) => { ev.stopPropagation(); ouvrirPlein(courant); });
const fermer = () => { if (!pe.classList.contains('on')) return; pe.classList.remove('on'); peCadre.classList.remove('zoom'); pe.inert = true; PB.isoler(pe, false); PB.lenis?.start(); (retourPlein || $('[data-plein]')).focus(); };
$('[data-fermer-plein]').addEventListener('click', fermer);
$('[data-pe-prec]', pe).addEventListener('click', () => peMontrer(peI - 1));
$('[data-pe-suiv]', pe).addEventListener('click', () => peMontrer(peI + 1));
document.addEventListener('keydown', (ev) => {
  if (!pe.classList.contains('on')) return;
  if (ev.key === 'Escape') fermer();
  if (ev.key === 'ArrowRight') peMontrer(peI + 1);
  if (ev.key === 'ArrowLeft') peMontrer(peI - 1);
});
// geste : un toucher bref zoome ou dezoome, un balayage change de vue, un glisser deplace le zoom
let g = null;
peCadre.addEventListener('pointerdown', (ev) => {
  g = { x: ev.clientX, y: ev.clientY, t: performance.now(), tx: parseFloat(peCadre.style.getPropertyValue('--tx')) || 0, ty: parseFloat(peCadre.style.getPropertyValue('--ty')) || 0 };
  peCadre.setPointerCapture?.(ev.pointerId);
});
peCadre.addEventListener('pointermove', (ev) => {
  if (!g || !peCadre.classList.contains('zoom')) return;
  peCadre.style.setProperty('--tx', `${g.tx + (ev.clientX - g.x)}px`); peCadre.style.setProperty('--ty', `${g.ty + (ev.clientY - g.y)}px`);
});
peCadre.addEventListener('pointerup', (ev) => {
  if (!g) return;
  const dx = ev.clientX - g.x; const dy = ev.clientY - g.y; const bref = Math.hypot(dx, dy) < 8;
  const zoome = peCadre.classList.contains('zoom');
  if (bref) {
    if (zoome) { peCadre.classList.remove('zoom'); }
    else {
      const r = peImg.getBoundingClientRect();
      peCadre.style.setProperty('--ox', `${((ev.clientX - r.left) / r.width) * 100}%`); peCadre.style.setProperty('--oy', `${((ev.clientY - r.top) / r.height) * 100}%`);
      peCadre.style.setProperty('--tx', '0px'); peCadre.style.setProperty('--ty', '0px');
      peCadre.classList.add('zoom'); $('[data-pe-aide]', pe).classList.add('vu');
    }
  } else if (!zoome && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) peMontrer(peI + (dx < 0 ? 1 : -1));
  g = null;
});
pe.addEventListener('click', (ev) => { if (ev.target === pe) fermer(); });

/* ---------- l'oeil de l'expert ---------- */
let h = O.texte.map((t) => `<p>${e(t)}</p>`).join('');
if (O.fait) h += `<div class="fait-cle"><b>Exposée</b><span>${e(O.fait)}</span></div>`;
if (O.signature) h += `<div class="fait-cle"><b>Signature</b><span>${e(O.signature)}</span></div>`;
if (O.technique) {
  h += `<h3>La technique des paperolles</h3>${O.technique.map((t) => `<p>${e(t)}</p>`).join('')}`;
  h += '<svg class="paperolle" viewBox="0 0 140 140" aria-hidden="true" data-paperolle></svg>';
}
if (O.reglement) h += `<p class="reglement">${e(O.reglement)}</p>`;
if (O.verifier) h += `<p class="verifier"><span class="a-completer">À vérifier : ${e(O.verifier)}</span></p>`;
h += PB.ancienne(O) ? '<p class="mini">Notre marchandise vous est garantie ancienne et accompagnée d\'un certificat d\'authenticité à la demande.</p>' : '<p class="mini">Certificat d\'authenticité à la demande.</p>';
$('[data-description]').innerHTML = h;
const pap = $('[data-paperolle]');
if (pap) {
  let d = '';
  [[44, 44], [96, 44], [70, 96], [30, 100], [110, 100]].forEach(([cx, cy], n) => {
    let p = ''; const tours = 3.2 + (n % 2) * 0.6;
    for (let t = 0; t <= tours * Math.PI * 2; t += 0.18) { const r = 2 + t * 2.1; p += `${p ? 'L' : 'M'}${(cx + Math.cos(t + n) * r).toFixed(1)} ${(cy + Math.sin(t + n) * r).toFixed(1)}`; }
    d += `<path d="${p}"/>`;
  });
  pap.innerHTML = d;
  if (!calme) {
    const ps = $$('path', pap); ps.forEach((p) => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
    gsap.to(ps, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', stagger: 0.2, scrollTrigger: { trigger: pap, start: 'top 85%', once: true } });
  }
}
if (!calme) gsap.from($$('.oeil-texte > *'), { opacity: 0, y: 24, duration: 0.9, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: '.oeil-texte', start: 'top 92%', once: true } });

/* ---------- vue a l'echelle ---------- */
const zoneE = $('[data-echelle]');
function echelle() {
  const d = O.dim;
  if (!d || !d.h) {
    zoneE.outerHTML = '<div class="echelle-vide"><p>Les dimensions de cette pièce sont <span class="a-completer">à compléter</span> : la vue à l\'échelle s\'affichera dès qu\'elles seront connues.</p></div>';
    $('[data-echelle-texte]').textContent = 'La pièce à ses vraies dimensions, à côté d\'une silhouette de 1,70 m.';
    return;
  }
  zoneE.style.backgroundImage = `url("${PB.amb(innerWidth < 700 ? 'g-salon-parquet-9x16' : 'g-salon-parquet-16x9')}")`;
  const W = zoneE.clientWidth; const H = zoneE.clientHeight;
  const sol = H * (innerWidth < 700 ? 0.84 : 0.78);
  const mur = O.pose === 'mur'; const console_ = O.pose === 'console';
  const hauteurConsole = 80;
  // la hauteur reelle fixe l'echelle ; la largeur suit le vrai rapport de la photo (jamais deformee)
  const objH = d.h; const objL = d.h * v.l / v.h;
  const basMur = Math.max(60, 145 - objH / 2);
  const hautMax = mur ? basMur + objH : console_ ? hauteurConsole + objH : objH;
  const k = Math.min((sol * 0.9) / Math.max(185, hautMax + 15), (W * 0.8) / (70 + 60 + Math.max(objL, console_ ? 100 : 0)));
  const xs = W / 2 - (60 + 40 + Math.max(objL, console_ ? 100 : 0)) * k / 2;
  // silhouette 1,70 m
  const sil = `<svg class="silhouette" viewBox="0 0 60 170" style="left:${xs}px;top:${sol - 170 * k}px;width:${60 * k}px;height:${170 * k}px" aria-hidden="true"><circle cx="30" cy="11.5" r="9.6"/><path d="M30 23.5c6 0 10 1.5 14 3.6 5 2.6 7 6.6 7.5 12.9l1.6 38c.3 4.2-1.1 7-3.1 7-1.8 0-2.5-1.5-2.6-4l-.9-31.2-1 36.4-1 38.4-1 39.3c2.6 1.4 3.6 3 3.1 5.6H32.6l-.6-39.6-1.2-34h-1.6l-1.2 34-.6 39.6H13.5c-.5-2.6.5-4.2 3.1-5.6l-1-39.3-1-38.4-1-36.4-.9 31.2c-.1 2.5-.8 4-2.6 4-2 0-3.4-2.8-3.1-7l1.6-38c.5-6.3 2.5-10.3 7.5-12.9 4-2.1 8-3.6 14-3.6z"/></svg>`;
  const xo = xs + (60 + 40) * k;
  let meuble = ''; let bas = sol;
  if (console_) {
    const cl = Math.max(100, objL + 30);
    meuble = `<svg class="meuble" viewBox="0 0 ${cl} ${hauteurConsole}" style="left:${xo}px;top:${sol - hauteurConsole * k}px;width:${cl * k}px;height:${hauteurConsole * k}px" aria-hidden="true"><rect x="0" y="0" width="${cl}" height="4"/><rect x="4" y="4" width="3" height="${hauteurConsole - 4}"/><rect x="${cl - 7}" y="4" width="3" height="${hauteurConsole - 4}"/><rect x="4" y="12" width="${cl - 8}" height="1.5"/></svg>`;
    bas = sol - hauteurConsole * k;
  }
  if (mur) bas = sol - basMur * k;
  const larg = objL * k; const haut = objH * k;
  const xObj = console_ ? xo + (Math.max(100, objL + 30) * k - larg) / 2 : xo;
  // la cote se place a droite de la piece, ou sous elle s'il n'y a pas la place
  const aDroite = xObj + larg + 110 <= W;
  const xLigne = xObj + larg + 14 <= W - 4 ? xObj + larg + 14 : xObj - 14;
  const etiq = aDroite ? `left:${xLigne + 8}px;top:${Math.max(6, bas - haut / 2 - 12)}px` : `left:${Math.max(6, Math.min(xObj + larg / 2 - 45, W - 100))}px;top:${bas + 10}px`;
  const cotes = `<span class="ligne-cote" style="left:${xLigne}px;top:${bas - haut}px;height:${haut}px"></span><span class="cote chiffres" style="${etiq}">H\u00a0${String(objH).replace('.', ',')}\u00a0cm</span>`;
  zoneE.innerHTML = `${sil}${meuble}<img class="objet-echelle" src="${PB.src(v, Math.max(80, larg * 2))}" alt="${e(O.titre)} à l'échelle" style="left:${xObj}px;top:${bas - haut}px;width:${larg}px;height:${haut}px">${cotes}<span class="cote" style="left:${xs}px;top:${sol + 8}px">Silhouette de 1,70 m</span>`;
  $('[data-echelle-texte]').textContent = mur ? 'La pièce accrochée au mur, à ses vraies dimensions, à côté d\'une silhouette de 1,70 m.' : console_ ? 'La pièce posée sur une console de 80 cm, à ses vraies dimensions, à côté d\'une silhouette de 1,70 m.' : 'La pièce à ses vraies dimensions, à côté d\'une silhouette de 1,70 m.';
  if (!calme && !zoneE.dataset.anime) zoneE.dataset.anime = '1', gsap.from($('.objet-echelle', zoneE), { y: -60, opacity: 0, duration: 1.2, ease: 'bounce.out', scrollTrigger: { trigger: zoneE, start: 'top 88%', once: true } });
}
echelle();
let minuterieEchelle;
addEventListener('resize', () => { clearTimeout(minuterieEchelle); minuterieEchelle = setTimeout(() => { if (document.querySelector('[data-echelle]')) echelle(); }, 250); });

/* ---------- barre d'action en bas de l'ecran (telephone) ---------- */
if (PB.etroit()) {
  const barre = document.createElement('div');
  barre.className = 'barre-action'; barre.setAttribute('aria-label', 'Actions sur la pièce');
  barre.innerHTML = `<a class="bouton bouton--or" href="#demande"><span>${vente ? 'Demander le prix' : 'Se renseigner'}</span></a><a class="bouton bouton--icone" href="tel:+33387636161" aria-label="Appeler la boutique de Metz"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5.2 2.8l2.6 2.9-1.4 2.2c.9 1.9 2.4 3.4 4.3 4.3l2.2-1.4 2.9 2.6-1.3 2.6c-6.3-.4-11.1-5.2-11.5-11.5z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg></a>`;
  document.body.append(barre);
  const vus = new Map();
  const maj = () => { const cacher = [...vus.values()].some(Boolean); barre.classList.toggle('on', !cacher); document.documentElement.style.setProperty('--barre-bas', cacher ? '0px' : '76px'); };
  // la barre reste visible tant que les boutons de la fiche ne sont pas entierement a l'ecran
  const io = new IntersectionObserver((es) => { es.forEach((en) => vus.set(en.target, en.target.id === 'demande' ? en.isIntersecting : en.intersectionRatio > 0.98)); maj(); }, { threshold: [0, 0.5, 1] });
  [$('[data-actions]'), $('#demande')].forEach((el) => io.observe(el));
}

/* ---------- demande ---------- */
const msg = $('[data-message]');
msg.value = PB.typo(vente ? `Bonjour,\nla pièce « ${O.titre} » m'intéresse. Pourriez-vous m'indiquer son prix ?\n` : `Bonjour,\nla pièce « ${O.titre} » m'intéresse. Pourriez-vous me renseigner à son sujet ?\n`);
PB.monterFormulaire($('[data-formulaire-objet]'), { message: () => `Votre demande pour « ${O.titre} » a bien été notée.` });

/* ---------- meme famille, precedente et suivante ---------- */
const memes = PB.objets.filter((x) => x.famille === O.famille && x.id !== O.id);
const autres = memes.length ? memes : PB.objets.filter((x) => x.id !== O.id && x.lorraine === O.lorraine).slice(0, 4);
$('[data-titre-famille]').innerHTML = memes.length ? `<span class="dore" data-dorure>${e(fam)}</span>, d'autres pièces` : '<span class="dore" data-dorure>D\'autres pièces</span> de la galerie';
$('[data-lien-famille]').href = memes.length ? `galerie.html?f=${O.famille}` : 'galerie.html';
$('[data-famille]').innerHTML = autres.slice(0, 4).map(carteGalerie).join('');
const i = PB.objets.indexOf(O);
const prec = PB.objets[(i - 1 + PB.objets.length) % PB.objets.length]; const suiv = PB.objets[(i + 1) % PB.objets.length];
$('[data-suite]').innerHTML = `<a href="${PB.lien(prec)}"><span>Pièce précédente</span><strong>${e(prec.titre)}</strong></a><a class="suivant" href="${PB.lien(suiv)}"><span>Pièce suivante</span><strong>${e(suiv.titre)}</strong></a>`;
PB.majSelection(); PB.inclinaison(); PB.dorer(); PB.balancer(); PB.aimants();
ScrollTrigger.refresh();
