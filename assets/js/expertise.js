/* Expertise : la loupe sur le bureau de l'expert, les trois missions, le rapport, le formulaire en quatre etapes. */
import PB, { demarrer } from './base.js';
import { fondLoupe } from './lumiere-gl.js';
import { construireMarqueteries, construireCaisse } from './decors.js';

demarrer();
const { gsap, ScrollTrigger, calme } = PB;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

if (PB.gl) fondLoupe($('[data-fond-loupe]'), { image: PB.amb('g-bureau-expert-16x9'), imageMobile: PB.amb('g-bureau-expert-9x16') });
if (!calme) {
  gsap.set($$('.entree-exp-texte .lead, .entree-exp-texte .actions'), { opacity: 0, y: 24 });
  PB.pret.then(() => gsap.to($$('.entree-exp-texte .lead, .entree-exp-texte .actions'), { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.4 }));
}
construireMarqueteries();
construireCaisse($('[data-caisse-svg]'));
$('[data-mono]').innerHTML = PB.monoSVG('mono');

/* ---------- le rapport se compose ---------- */
if (!calme) {
  const tl = gsap.timeline({ scrollTrigger: { trigger: '[data-rapport]', start: 'top 72%', once: true } });
  tl.from('.rapport', { y: 80, rotation: 6, opacity: 0, duration: 1.1, ease: 'power3.out' })
    .from($$('.rapport-ligne'), { x: -30, opacity: 0, duration: 0.6, stagger: 0.18, ease: 'power2.out' }, 0.5)
    .from($$('.rapport .lignes i'), { scaleX: 0, transformOrigin: 'left', duration: 0.5, stagger: 0.03 }, 0.6)
    .from('.tampon', { scale: 2.6, opacity: 0, rotation: -30, duration: 0.45, ease: 'back.out(2.5)' }, 1.6);
  gsap.from($$('[data-etapes] li'), { opacity: 0, x: -30, duration: 0.8, ease: 'power3.out', stagger: 0.18, scrollTrigger: { trigger: '[data-etapes]', start: 'top 80%', once: true } });
  gsap.from($$('.logos-titres img'), { scale: 0.6, opacity: 0, rotation: -20, duration: 0.9, ease: 'back.out(2)', stagger: 0.15, scrollTrigger: { trigger: '.logos-titres', start: 'top 85%', once: true } });
}

/* ---------- formulaire en quatre etapes ---------- */
const f = $('[data-form-expertise]');
$('[data-familles-exp]').innerHTML = ['Mobilier', 'Tableaux', 'Pendules et bronzes', 'Objets d\'art', 'Art sacré', 'Argenterie', 'Verre et céramique', 'Autre'].map((n) => `<label><input type="checkbox" name="familles" value="${n}"><span>${n}</span></label>`).join('');
const etapes = $$('.etape', f); const prog = $$('[data-progression] li', f);
const err = $('[data-erreur]', f); err.id = 'err-exp';
let n = 0;
const fichiers = [];
function aller(k, focus = true) {
  n = k;
  etapes.forEach((el, i) => { el.hidden = i !== n; });
  prog.forEach((li, i) => { li.classList.toggle('fait', i < n); if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
  $('[data-prec]', f).hidden = n === 0;
  $('[data-suiv]', f).hidden = n === etapes.length - 1;
  $('[data-envoyer]', f).hidden = n !== etapes.length - 1;
  err.textContent = '';
  if (n === 3) recap();
  if (!calme && focus) gsap.from(etapes[n], { opacity: 0, x: 30, duration: 0.5, ease: 'power3.out' });
  if (focus) { const l = etapes[n].querySelector('legend'); l.setAttribute('tabindex', '-1'); l.focus({ preventScroll: true }); }
}
function recap() {
  const motif = f.querySelector('input[name="motif"]:checked')?.value || '';
  const fams = [...f.querySelectorAll('input[name="familles"]:checked')].map((x) => x.value);
  $('[data-recap]', f).innerHTML = `<span>Motif : <strong>${PB.esc(motif)}</strong></span><span>Objets : <strong>${PB.esc(fams.join(', ') || 'non précisé')}</strong>, ${PB.esc($('#e-nombre').value.toLowerCase())}</span><span>Photos : <strong>${fichiers.length}</strong></span>`;
}
$('[data-suiv]', f).addEventListener('click', () => aller(Math.min(etapes.length - 1, n + 1)));
$('[data-prec]', f).addEventListener('click', () => aller(Math.max(0, n - 1)));
// photos : apercu local seulement
const depot = $('[data-depot]', f); const entree = $('[data-fichiers]', f); const apercus = $('[data-apercus]', f);
const afficher = () => {
  apercus.innerHTML = fichiers.map((x, i) => `<figure><img src="${x.url}" alt="Photo ${i + 1} : ${PB.esc(x.nom)}"><button type="button" data-oter="${i}" aria-label="Retirer la photo ${i + 1}">×</button></figure>`).join('');
};
entree.addEventListener('change', () => {
  [...entree.files].slice(0, 12 - fichiers.length).forEach((fi) => { if (fi.type.startsWith('image/')) fichiers.push({ nom: fi.name, url: URL.createObjectURL(fi) }); });
  entree.value = ''; afficher();
  PB.toast(`${fichiers.length} ${fichiers.length > 1 ? 'photos ajoutées' : 'photo ajoutée'}, elles restent sur votre appareil.`);
});
['dragenter', 'dragover'].forEach((t) => depot.addEventListener(t, () => depot.classList.add('survol')));
['dragleave', 'drop'].forEach((t) => depot.addEventListener(t, () => depot.classList.remove('survol')));
apercus.addEventListener('click', (ev) => { const b = ev.target.closest('[data-oter]'); if (!b) return; const [x] = fichiers.splice(Number(b.dataset.oter), 1); URL.revokeObjectURL(x.url); afficher(); });
f.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const champs = [...f.querySelectorAll('[data-etape="4"] [required]')];
  let premier = null;
  champs.forEach((c) => {
    const ko = !c.value.trim() || (c.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value));
    c.setAttribute('aria-invalid', String(ko));
    if (ko) c.setAttribute('aria-describedby', err.id); else c.removeAttribute('aria-describedby');
    if (ko && !premier) premier = c;
  });
  if (premier) { err.textContent = premier.type === 'email' && premier.value ? "L'adresse e-mail semble incomplète." : 'Merci d\'indiquer votre nom et votre e-mail.'; premier.focus(); return; }
  const c = document.createElement('div');
  c.className = 'confirmation'; c.setAttribute('role', 'status'); c.tabIndex = -1;
  c.innerHTML = `<h3>Demande d'expertise notée</h3><p>Merci${$('#e-nom').value ? `, ${PB.esc($('#e-nom').value.trim())}` : ''}. Nous revenons vers vous pour fixer la suite : examen des photos, rendez-vous en boutique ou à domicile.</p><p class="mini">Maquette : rien n'a été envoyé, et vos ${fichiers.length} ${fichiers.length > 1 ? 'photos sont restées' : 'photo est restée'} sur votre appareil.</p>`;
  f.replaceWith(c); c.focus(); PB.son.carillon();
});
aller(0, false);
PB.dorer(); PB.aimants();
ScrollTrigger.refresh();
