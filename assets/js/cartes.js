/* Cartes et visuels des pieces : piece detouree sur lumiere, ou photo dans un cadre dore. */
import PB from './base.js';

const e = PB.esc;

/* image d'une piece a une hauteur donnee (px) : detouree ou photo encadree, jamais recadree */
export function visuelPiece(o, { hauteur = 360, sizes = '40vw', lazy = true, cls = '' } = {}) {
  const v = PB.visuel(o);
  const ratio = v.l / v.h;
  const chargement = lazy ? ' loading="lazy" decoding="async"' : '';
  if (PB.estDetoure(o)) {
    const largeur = Math.round(hauteur * ratio);
    return `<img class="${cls}" src="${PB.src(v, largeur * 1.5)}" srcset="${PB.srcset(v)}" sizes="${largeur}px" alt="${e(PB.alt(o))}" width="${v.l}" height="${v.h}" style="height:${hauteur}px"${chargement}>`;
  }
  const h = Math.round(hauteur * 0.92);
  return `<span class="cadre-dore"><img class="${cls}" src="${PB.src(v, h * ratio * 1.5)}" srcset="${PB.srcset(v)}" sizes="${Math.round(h * ratio)}px" alt="${e(PB.alt(o))}" width="${v.l}" height="${v.h}" style="height:${h}px;width:auto"${chargement}></span>`;
}

export function etiquette(o, { prix = true } = {}) {
  const d = PB.dims(o);
  return `<span class="etiquette" data-etiquette><span class="fil" aria-hidden="true"></span><strong>${e(o.titre)}</strong><span>${e(o.epoque)}${d ? `, ${e(d)}` : ''}</span>${prix ? '<span class="prix">Prix sur demande</span>' : ''}</span>`;
}

export function boutonSelection(o, cls = 'ajout') {
  return `<button class="${cls}" type="button" data-selection="${o.id}" aria-pressed="false" aria-label="Ajouter ${e(o.titre)} à ma sélection">${PB.ICO.plus}<span>Sélection</span></button>`;
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
    <div class="carte-visuel">${o.lorraine ? '<span class="badge-lorraine">Lorraine</span>' : ''}${visuelPiece(o, { hauteur: 300, sizes: '300px' })}</div>
    <div class="carte-texte">
      <h3 class="t">${e(o.titre)}</h3>
      <p class="e">${e(o.epoque)}${PB.dims(o) ? ` · ${e(PB.dims(o))}` : ''}</p>
      <div class="bas"><span class="p">Prix sur demande</span>${boutonSelection(o)}</div>
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
