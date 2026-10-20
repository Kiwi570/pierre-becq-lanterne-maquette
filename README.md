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

## À compléter
E-mail, horaires des boutiques, mentions légales (SIRET, hébergeur, CGV, données personnelles), dimensions des 3 fauteuils, délais et honoraires d'expertise, photo de la boutique de Senon, conditions de vente de l'objet en ivoire.

## Bibliothèques
GSAP 3 (ScrollTrigger, CustomEase), Lenis, OGL. Polices Bodoni Moda et Jost (licence OFL), hébergées dans `assets/fonts`.
