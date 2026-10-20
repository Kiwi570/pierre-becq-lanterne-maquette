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
const desc = `${O.titre}, ${O.epoque}${PB.dims(O) ? `, ${PB.dims(O)}` : ''}. Prix sur demande. Pierre Becq, antiquaire à Metz.`;
document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
document.querySelector('meta[property="og:title"]')?.setAttribute('content', O.titre);
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
$('[data-actions]').innerHTML = `<a class="bouton bouton--or" href="#demande"><span>Demander le prix</span></a>${boutonSelection(O, 'bouton')}<a class="bouton" href="#demande" data-visite><span>Voir en boutique</span></a>`;
$('[data-actions] [data-selection]').innerHTML = '<span>Ajouter à ma sélection</span>';
$('[data-visite]').addEventListener('click', () => { const r = $('input[value="Voir la pièce en boutique"]'); if (r) r.checked = true; });

const scene = $('[data-scene]');
const v = PB.visuel(O);
const haut = Math.round(Math.min(innerHeight * (PB.etroit() ? 0.42 : 0.68), 660));
scene.innerHTML = `<span class="halo-piece" aria-hidden="true"></span>${visuelPiece(O, { hauteur: haut, lazy: false, cls: PB.estDetoure(O) ? 'piece-grande' : '' })}${PB.estDetoure(O) ? '<span class="ombre-piece" aria-hidden="true"></span>' : ''}`;
let fond = null;
if (PB.gl) {
  fond = fondLanterne($('[data-fond-gl]'), { image: PB.amb('g-boiserie-laque-16x9'), imageMobile: PB.amb('g-boiserie-laque-9x16'), teinte: 0.22 });
  if (fond) fond.teinter(O.couleur, 0.28);
}
document.documentElement.classList.remove('attente');
if (!calme) {
  const img = $('img', scene);
  gsap.set(img.closest('.cadre-dore') || img, { opacity: 0, y: 40 });
  gsap.set($$('.objet-infos > *'), { opacity: 0, y: 24 });
  PB.pret.then(() => {
    gsap.timeline()
      .fromTo($('.halo-piece', scene), { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 2, ease: 'power2.out' }, 0)
      .to(img.closest('.cadre-dore') || img, { opacity: 1, y: 0, duration: 1.6, ease: 'power3.out' }, 0.2)
      .to($$('.objet-infos > *'), { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, 0.3);
  });
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
    loupe.style.backgroundImage = `url("${grande(p)}")`;
    vis.style.backgroundColor = p.fond || '#e8e4dd'; loupe.style.backgroundColor = p.fond || '#e8e4dd';
  };
  if (!anime || calme) { poser(); return; }
  gsap.to(vue, { opacity: 0, scale: 0.98, duration: 0.25, onComplete: () => { poser(); gsap.fromTo(vue, { opacity: 0, scale: 1.02 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }); } });
}
$('[data-vignettes]').innerHTML = VUES.map((p, i) => `<button type="button" role="listitem" aria-label="Vue ${i + 1}" aria-current="${i === 0}"><img src="${PB.src(p, 300)}" alt="" loading="lazy"></button>`).join('') +
  `<p class="mini" style="grid-column:1/-1">${VUES.length} ${VUES.length > 1 ? 'vues' : 'vue'}, photos de la boutique.</p>`;
$$('[data-vignettes] button').forEach((b, i) => b.addEventListener('click', () => { if (i !== courant) montrer(i); }));
montrer(0, false);
const zoom = 2.6;
const placer = (x, y) => {
  const r = vue.getBoundingClientRect(); const rv = vis.getBoundingClientRect();
  if (x < r.left || x > r.right || y < r.top || y > r.bottom) { vis.classList.remove('loupe-on'); return; }
  vis.classList.add('loupe-on');
  const R = loupe.offsetWidth / 2;
  loupe.style.left = `${x - rv.left}px`; loupe.style.top = `${y - rv.top}px`;
  loupe.style.backgroundSize = `${r.width * zoom}px ${r.height * zoom}px`;
  loupe.style.backgroundPosition = `${-((x - r.left) * zoom - R)}px ${-((y - r.top) * zoom - R)}px`;
};
vis.addEventListener('pointermove', (ev) => placer(ev.clientX, ev.clientY));
vis.addEventListener('pointerdown', (ev) => placer(ev.clientX, ev.clientY));
vis.addEventListener('pointerleave', () => vis.classList.remove('loupe-on'));
vis.addEventListener('pointerup', (ev) => { if (ev.pointerType === 'touch') vis.classList.remove('loupe-on'); });
vis.tabIndex = 0; vis.setAttribute('role', 'group'); vis.setAttribute('aria-label', 'Visionneuse : flèches gauche et droite pour changer de vue');
vis.addEventListener('keydown', (ev) => { if (ev.key === 'ArrowRight') montrer((courant + 1) % VUES.length); if (ev.key === 'ArrowLeft') montrer((courant - 1 + VUES.length) % VUES.length); });
if (!PB.pointeurFin) $('[data-aide]').textContent = 'Touchez la photo : la loupe de l\'expert grossit les détails.';
const pe = $('[data-plein-ecran]'); pe.inert = true;
$('[data-plein]').addEventListener('click', (ev) => { ev.stopPropagation(); $('img', pe).src = grande(VUES[courant]); $('img', pe).alt = vue.alt; pe.classList.add('on'); pe.inert = false; PB.isoler(pe, true); PB.lenis?.stop(); $('[data-fermer-plein]').focus(); });
const fermer = () => { if (!pe.classList.contains('on')) return; pe.classList.remove('on'); pe.inert = true; PB.isoler(pe, false); PB.lenis?.start(); $('[data-plein]').focus(); };
$('[data-fermer-plein]').addEventListener('click', fermer);
pe.addEventListener('click', (ev) => { if (ev.target === pe) fermer(); });
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') fermer(); });

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
h += '<p class="mini">Notre marchandise vous est garantie ancienne et accompagnée d\'un certificat d\'authenticité à la demande.</p>';
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
if (!calme) gsap.from($$('.oeil-texte > *'), { opacity: 0, y: 24, duration: 0.9, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: '.oeil-texte', start: 'top 80%', once: true } });

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
  const objH = d.h; const objL = d.l || d.d || (d.h * v.l / v.h);
  const basMur = Math.max(60, 145 - objH / 2);
  const hautMax = mur ? basMur + objH : console_ ? hauteurConsole + objH : objH;
  const k = Math.min((sol * 0.9) / Math.max(185, hautMax + 15), (W * 0.8) / (70 + 60 + Math.max(objL, console_ ? 100 : 0)));
  const xs = W / 2 - (60 + 40 + Math.max(objL, console_ ? 100 : 0)) * k / 2;
  // silhouette 1,70 m
  const sil = `<svg class="silhouette" viewBox="0 0 60 170" style="left:${xs}px;top:${sol - 170 * k}px;width:${60 * k}px;height:${170 * k}px" aria-hidden="true"><path d="M30 0c7 0 11 5 11 12s-4 13-11 13-11-6-11-13S23 0 30 0zM16 30h28c5 0 9 4 9 9v42c0 3-2 5-5 5h-2l-2 40-3 44H35l-2-44h-6l-2 44h-6l-3-44-2-40h-2c-3 0-5-2-5-5V39c0-5 4-9 9-9z"/></svg>`;
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
  const cotes = `<span class="ligne-cote" style="left:${xObj + larg + 14}px;top:${bas - haut}px;height:${haut}px"></span><span class="cote chiffres" style="left:${xObj + larg + 22}px;top:${bas - haut / 2 - 12}px">H ${String(objH).replace('.', ',')} cm</span>`;
  zoneE.innerHTML = `${sil}${meuble}<img class="objet-echelle" src="${PB.src(v, 600)}" alt="${e(O.titre)} à l'échelle" style="left:${xObj}px;top:${bas - haut}px;width:${larg}px;height:${haut}px;object-fit:fill">${cotes}<span class="cote" style="left:${xs}px;top:${sol + 8}px">Silhouette de 1,70 m</span>`;
  $('[data-echelle-texte]').textContent = mur ? 'La pièce accrochée au mur, à ses vraies dimensions, à côté d\'une silhouette de 1,70 m.' : console_ ? 'La pièce posée sur une console de 80 cm, à ses vraies dimensions, à côté d\'une silhouette de 1,70 m.' : 'La pièce à ses vraies dimensions, à côté d\'une silhouette de 1,70 m.';
  if (!calme) gsap.from($('.objet-echelle', zoneE), { y: -60, opacity: 0, duration: 1.2, ease: 'bounce.out', scrollTrigger: { trigger: zoneE, start: 'top 70%', once: true } });
}
echelle();

/* ---------- demande ---------- */
const msg = $('[data-message]');
msg.value = `Bonjour,\nla pièce « ${O.titre} » m'intéresse. Pourriez-vous m'indiquer son prix ?\n`;
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
