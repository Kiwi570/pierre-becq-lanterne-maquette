/* Cartes et visuels des pieces : piece detouree sur lumiere, ou photo dans un cadre dore. */
import PB from './base.js?v=20261028';

const e = PB.esc;

/* image d'une piece a une hauteur donnee (px) : detouree ou photo encadree, jamais recadree ni deformee.
   La largeur se deduit de la hauteur et du vrai rapport de l'image ; le CSS peut seulement la reduire (meme rapport). */
export function visuelPiece(o, { hauteur = 360, lazy = true, cls = '' } = {}) {
  const v = PB.visuel(o);
  const ratio = v.l / v.h;
  const chargement = lazy ? ' loading="lazy" decoding="async"' : ' decoding="async"';
  const detoure = PB.estDetoure(o);
  const h = detoure ? hauteur : Math.round(hauteur * 0.92);
  const w = Math.round(h * ratio);
  const img = `<img class="vp ${cls}" src="${PB.src(v, w * 2)}" srcset="${PB.srcset(v)}" sizes="${w}px" alt="${e(PB.alt(o))}" width="${v.l}" height="${v.h}" style="--w:${w}px;--r:${ratio.toFixed(4)}"${chargement}>`;
  return detoure ? img : `<span class="cadre-dore">${img}</span>`;
}

/* largeur affichee (px) d'une piece pour une hauteur donnee, cadre compris ; et hauteur maxi pour tenir dans une largeur */
export function largeurPiece(o, hauteur) {
  const v = PB.visuel(o); const r = v.l / v.h;
  return PB.estDetoure(o) ? Math.round(hauteur * r) : Math.round(hauteur * 0.92 * r) + 20;
}
export function hauteurPourLargeur(o, largeur) {
  const v = PB.visuel(o); const r = v.l / v.h;
  return PB.estDetoure(o) ? largeur / r : (largeur - 20) / (0.92 * r);
}

export function etiquette(o, { prix = true } = {}) {
  const d = PB.dims(o);
  return `<span class="etiquette" data-etiquette><span class="fil" aria-hidden="true"></span><strong>${e(o.titre)}</strong><span>${e(o.epoque)}${d ? `, ${e(d)}` : ''}</span>${prix ? `<span class="prix">${PB.mentionPrix(o)}</span>` : ''}</span>`;
}

export function boutonSelection(o, cls = 'ajout') {
  if (!PB.enVente(o)) return `<a class="${cls} ajout--info" href="${PB.lien(o)}#demande">${PB.ICO.fleche}<span>Se renseigner</span></a>`;
  return `<button class="${cls}" type="button" data-selection="${o.id}" aria-pressed="false" aria-label="Ajouter à ma sélection : ${e(o.titre)}">${PB.ICO.plus}<span>Sélection</span></button>`;
}

/* piece de la salle horizontale : hauteur proportionnelle a la taille reelle, dans des bornes lisibles */
export function pieceSalle(o, hauteur) {
  return `<article class="piece" data-carte data-couleur="${o.couleur}" data-id="${o.id}">
    <a class="piece-visuel" href="${PB.lien(o)}" data-curseur="Voir" aria-label="${e(o.titre)}, voir la fiche">
      <span class="halo-piece" aria-hidden="true"></span>${visuelPiece(o, { hauteur })}${PB.estDetoure(o) ? '<span class="socle-lumiere" aria-hidden="true"></span>' : ''}
    </a>
    ${etiquette(o)}
    <div class="piece-actions">${boutonSelection(o)}</div>
  </article>`;
}

/* carte de galerie */
export function carteGalerie(o) {
  return `<article class="carte" data-carte data-tilt data-id="${o.id}">
    <div class="carte-visuel">${o.lorraine ? '<span class="badge-lorraine">Lorraine</span>' : ''}${visuelPiece(o, { hauteur: 300 })}</div>
    <div class="carte-texte">
      <h3 class="t">${e(o.titre)}</h3>
      <p class="e">${e(o.epoque)}${PB.dims(o) ? ` · ${e(PB.dims(o))}` : ''}</p>
      <div class="bas"><span class="p">${PB.mentionPrix(o)}</span>${boutonSelection(o)}</div>
    </div>
    <a class="lien-carte" href="${PB.lien(o)}" data-curseur="Voir"><span class="sr">${e(o.titre)}, voir la fiche</span></a>
  </article>`;
}

/* hauteur d'affichage selon la taille reelle (cm) : les grandes pieces restent plus grandes */
export function hauteurRelative(o, Hmax, Hmin) {
  const h = o.dim?.h || (o.famille === 'mobilier' ? 95 : 40);
  const t = Math.min(1, Math.pow(h / 145, 0.55));
  return Math.round(Hmin + (Hmax - Hmin) * t);
}
