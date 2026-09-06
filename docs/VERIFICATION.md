# Vérification — 6 septembre 2026

Parcours vérifié : choix d’une prestation et d’un créneau dans le navigateur → API Express → base SQL → confirmation ; formulaire de contact → API → stockage → confirmation.

| Contrôle | Résultat |
| --- | --- |
| Installation | 158 dépendances installées ; audit npm : 0 vulnérabilité signalée |
| Build Vite de production | Réussi ; pages secondaires réparties en chunks |
| Tests horaires Node | 5/5 réussis |
| Base SQL | Connexion MariaDB XAMPP isolée, port 3308 ; compte applicatif restreint |
| GET services, barbiers, galerie, avis | Réponses 200 ; 16 prestations officielles avec `category` et `price_type` |
| Création de rendez-vous | Réponse 201 et enregistrement SQL |
| Deux soumissions simultanées | Une réponse 201 et une réponse 409 |
| Chevauchement de durée | Réponse 409 ; créneau marqué réservé |
| Rendez-vous adjacent | Accepté |
| Requêtes invalides | Réponses 422 pour date passée/impossible, email invalide et contact incomplet |
| Formulaire mobile de réservation | Confirmation visible et présence SQL confirmée |
| Formulaire mobile de contact | Confirmation visible et présence SQL confirmée |
| Validation HTML téléphone | Numéro international accepté, lettres refusées, aucun diagnostic de regex dans la console |
| Chargement, erreur et réessai | Erreur API simulée visible ; réessai recharge le catalogue |
| Catalogue vide | Message explicite affiché |
| Galerie | Filtre Barbes : deux photos ; ouverture lightbox et fermeture Échap réussies |
| Navigation mobile | Menu et changement de route réussis |
| SEO HTML initial | Titres, canonical, OpenGraph et données HairSalon vérifiés |
| 404, robots et sitemap | Statut 404, robots et six URLs de sitemap vérifiés |
| Catalogue officiel | Prix cohérents sur accueil, services et réservation ; libellés "À partir de" vérifiés |
| Snapshot de réservation | `service_name`, `displayed_price` et `price_type` conservés en SQL |

Les six routes `/`, `/services`, `/booking`, `/gallery`, `/about`, `/contact` ont été vérifiées à **1920, 1600, 1440, 1366, 1200, 1024, 768, 430, 390 et 375 pixels** : aucun débordement horizontal, aucune image locale cassée, aucune erreur JavaScript ni erreur de console pendant les parcours normaux. Les erreurs HTTP déclenchées volontairement pour tester la récupération ne sont pas des défaillances de production.

Deux passes visuelles ont été comparées aux maquettes publiques. Corrections apportées : chemin d’import partagé, déclaration CSS de taille de titre, recadrages contenant du texte superposé, nombre de cartes de la page Services, nom accessible du sujet et syntaxe de validation du téléphone. Les captures de contrôle se trouvent dans `/tmp/rammach-qa`.

Les enregistrements créés par les vérifications API et formulaires ont été supprimés. Aucune donnée client réelle n’a été utilisée.

## Catalogue Officiel

Le catalogue contient 16 prestations réparties en `coupe_moderne`, `coupe_classique` et `soins_beaute`. Les prix fixes affichent le montant en DH ; Protéine, Kératine et Coloration cheveux affichent un prix de départ et conservent ce libellé dans la confirmation.

## Limites

- Kluster n’a pas démarré : `connectionError`. Aucun résultat de revue Kluster n’est disponible.
- Vérification navigateur effectuée dans Chrome, pas sur appareils physiques Safari/iOS.
- Les photographies sont des extractions WebP des maquettes ; la résolution des originaux n’était pas disponible.
- La carte interactive Google dépend du réseau externe. L’aperçu local et le lien d’itinéraire restent proposés ; l’adresse commerciale précise doit être confirmée.
- Les avis réels restent à fournir. Aucun faux témoignage n’est publié.
- Les confirmations sont affichées dans le site ; aucun prestataire email/SMS n’est connecté.
- La base locale est temporaire. Le schéma et les instructions permettent l’installation sur une base persistante ; aucun déploiement public n’a été effectué.
