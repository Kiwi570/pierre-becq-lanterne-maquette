/* Galerie : filtres par famille et par siecle, vitrine sur velours ou classement par siecle. */
import PB, { demarrer } from './base.js?v=20261028';
import { carteGalerie } from './cartes.js?v=20261028';

demarrer();
const { gsap, ScrollTrigger, calme } = PB;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const zone = $('[data-galerie]');

const q = new URLSearchParams(location.search);
const etat = { famille: q.get('f') || null, siecle: ['XVIIe', 'XVIIIe', 'XIXe', 'XXe'].includes(q.get('s')) ? q.get('s') : null, lorraine: q.get('lorraine') === '1', vue: 'vitrine' };
const SIECLES = ['XVIIe', 'XVIIIe', 'XIXe', 'XXe'];
const compte = (pred) => PB.objets.filter(pred).length;

$('[data-filtres-familles]').innerHTML = `<button class="filtre" type="button" data-fam="" aria-pressed="${!etat.famille}">Toutes<small aria-hidden="true">${PB.objets.length}</small><span class="sr">, ${PB.objets.length} pièces</span></button>` +
  Object.entries(PB.familles).map(([k, n]) => `<button class="filtre" type="button" data-fam="${k}" aria-pressed="${etat.famille === k}">${n}<small aria-hidden="true">${compte((o) => o.famille === k)}</small><span class="sr">, ${compte((o) => o.famille === k)} pièces</span></button>`).join('');
$('[data-filtres-siecles]').innerHTML = SIECLES.map((s) => `<button class="filtre" type="button" data-siecle="${s}" aria-pressed="${etat.siecle === s}">${s} siècle</button>`).join('');
$('[data-f-lorraine]').setAttribute('aria-pressed', String(etat.lorraine));
// telephone : une seule rangee visible, les autres filtres derriere un bouton
const rang2 = $('.filtres-2'); rang2.id = 'filtres-2';
if (PB.etroit()) {
  $('[data-filtres-familles]').insertAdjacentHTML('afterbegin', '<button class="filtre filtre-plus" type="button" data-plus aria-expanded="false" aria-controls="filtres-2">Filtres<small data-nb-plus aria-hidden="true"></small></button>');
  $('[data-plus]').addEventListener('click', (e) => { const b = e.currentTarget; const on = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', String(on)); $('.barre-filtres').classList.toggle('plus', on); ScrollTrigger.refresh(); });
}

const filtrer = () => PB.objets.filter((o) => (!etat.famille || o.famille === etat.famille) && (!etat.siecle || o.siecle === etat.siecle) && (!etat.lorraine || o.lorraine));

function rendre(defiler = false) {
  PB.liberer(zone);
  const liste = filtrer();
  $('[data-nb]').textContent = `${liste.length} ${liste.length > 1 ? 'pièces' : 'pièce'}`;
  const nbp = $('[data-nb-plus]'); if (nbp) nbp.textContent = liste.length;
  $$('[data-vue]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.vue === etat.vue)));
  if (!liste.length) {
    zone.innerHTML = '<div class="vide-filtres"><p class="lead">Aucune pièce ne correspond à ces filtres pour le moment.</p><p class="petit">Écrivez-nous ce que vous cherchez : époque, style, dimensions.</p><button class="bouton" type="button" data-raz><span>Voir toute la galerie</span></button></div>';
    $('[data-raz]', zone).addEventListener('click', () => { etat.famille = null; etat.siecle = null; etat.lorraine = false; majFiltres(); rendre(); });
  } else if (etat.vue === 'siecles') {
    zone.innerHTML = SIECLES.map((s) => {
      const l = liste.filter((o) => o.siecle === s).sort((a, b) => a.annee - b.annee);
      return l.length ? `<section class="groupe-siecle" aria-label="${s} siècle"><h2><span class="dore">${s} siècle</span><small>${l.length} ${l.length > 1 ? 'pièces' : 'pièce'}</small></h2><div class="vitrines">${l.map(carteGalerie).join('')}</div></section>` : '';
    }).join('');
  } else {
    zone.innerHTML = `<div class="vitrines">${liste.map(carteGalerie).join('')}</div>`;
  }
  PB.majSelection(zone); PB.inclinaison(zone);
  if (!calme) {
    gsap.from($$('.carte', zone), { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: { each: 0.05, from: 'start' }, clearProps: 'opacity' });
  }
  ScrollTrigger.refresh();
  if (defiler) {
    const y = $('.barre-filtres').getBoundingClientRect().top + scrollY + 1;
    if (scrollY > y) { if (PB.lenis) PB.lenis.scrollTo(y, { duration: 0.8 }); else scrollTo(0, y); }
  }
}
function majFiltres() {
  $$('[data-fam]').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.fam || null) === etat.famille)));
  $$('[data-siecle]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.siecle === etat.siecle)));
  $('[data-f-lorraine]').setAttribute('aria-pressed', String(etat.lorraine));
  const u = new URL(location.href);
  u.search = ''; if (etat.famille) u.searchParams.set('f', etat.famille); if (etat.siecle) u.searchParams.set('s', etat.siecle); if (etat.lorraine) u.searchParams.set('lorraine', '1');
  history.replaceState(null, '', u);
}
document.addEventListener('click', (e) => {
  const f = e.target.closest('[data-fam]'); if (f) { etat.famille = f.dataset.fam || null; majFiltres(); rendre(true); }
  const s = e.target.closest('[data-siecle]'); if (s) { etat.siecle = etat.siecle === s.dataset.siecle ? null : s.dataset.siecle; majFiltres(); rendre(true); }
  if (e.target.closest('[data-f-lorraine]')) { etat.lorraine = !etat.lorraine; majFiltres(); rendre(true); }
  const v = e.target.closest('[data-vue]'); if (v) { etat.vue = v.dataset.vue; rendre(true); }
});

$('[data-compte]').textContent = PB.objets.length;
if (!calme) {
  gsap.fromTo('.entree--galerie [data-parallaxe]', { yPercent: 0, scale: 1.08 }, { yPercent: 10, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.entree--galerie', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.fromTo('.entree--galerie .vitrail', { xPercent: -14 }, { xPercent: 10, ease: 'none', scrollTrigger: { trigger: '.entree--galerie', start: 'top top', end: 'bottom top', scrub: true } });
  PB.pret.then(() => {
    gsap.from('.entree--galerie .bas > *', { opacity: 0, y: 26, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.4 });
    const c = { v: 0 }; gsap.to(c, { v: PB.objets.length, duration: 1.6, delay: 0.5, ease: 'power3.out', onUpdate: () => { $('[data-compte]').textContent = Math.round(c.v); } });
  });
}
rendre();
PB.dorer();
PB.aimants();
