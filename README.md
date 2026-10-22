# Pierre Becq Antiquaire — maquette

Maquette statique (HTML, CSS, JavaScript), direction « Lanterne de Metz ». Aucune étape de construction : le dossier se publie tel quel sur Vercel.

## Pages
- `index.html` : accueil (la maison, coups de cœur, frise des siècles, trésors de Lorraine, expertise, successions, transport, boutiques, contact)
- `galerie.html` : galerie filtrable (familles, siècles, Lorraine), vues « Vitrine » et « Par siècle »
- `objet.html?o=…` : fiche d'une pièce (loupe d'expert, vue à l'échelle, demande de prix)
- `expertise.html` : missions, parcours, titres, achat de successions, formulaire en 4 étapes
- `mentions.html` : mentions légales à compléter

## Données
Les 15 pièces sont dans `data/objets.js` (textes repris du site actuel, fautes évidentes corrigées). Pour ajouter une pièce : ajouter ses images dans `assets/img/objets/<id>/` et une entrée dans `window.OBJETS`.

## Simulé dans la maquette
Sélection, demandes de prix, formulaire de contact et demande d'expertise (les photos restent sur l'appareil) : rien n'est envoyé.

## À compléter ou à confirmer par la maison
- E-mail (l'annuaire de la CNE indique une adresse à confirmer), horaires de la boutique de Metz.
- Senon (Meuse) : absente du site actuel, l'adresse vient des annuaires, qui se contredisent (adresse, téléphone, horaires). Lieu d'accueil à confirmer ou à retirer.
- Cour d'appel de rattachement pour le titre d'expert judiciaire honoraire.
- Mentions légales : raison sociale, SIRET, hébergeur, conditions de vente, données personnelles, titulaire des droits sur les photos.
- Chope en ivoire : espèce et certificat CITES (vente dans l'Union européenne soumise à certificat).
- Dimensions des 3 fauteuils, délais et honoraires d'expertise, photo de la boutique de Senon.
- Photos en haute définition des pièces : plusieurs photos du site actuel font 1024 px de large, la pièce détourée n'y mesure que 300 à 500 px.
- Dates à préciser : coffret attribué à César Bagard (mort en 1709) daté « XVIIIe siècle » ; devise du coffret circulaire (« ou » ou « où »).

## Effets
Transition de page par la bougie ; vers une fiche, la pièce glisse de sa carte jusqu'à la fiche (transitions de vue du navigateur, Chrome, Edge et Safari récents). Sur téléphone : frise verticale avec balancier, salle des coups de cœur avec compteur, barre d'action sur les fiches.

## Bibliothèques
GSAP 3 (ScrollTrigger, CustomEase), Lenis, OGL. Polices Bodoni Moda et Jost (licence OFL), hébergées dans `assets/fonts`.
