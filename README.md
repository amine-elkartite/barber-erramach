# ER RAMMACH Mohamed Barber Shop

Site français de salon de coiffure à Meknès, réalisé à partir des six maquettes publiques fournies dans `website-images`. Interface noire et dorée, photos locales WebP, prise de rendez-vous et formulaire de contact reliés à une base SQL.

## Stack

- React 19, Vite 7, JavaScript, React Router, Lucide React, CSS personnalisé et Fetch API.
- Node.js 22.12+ (testé sur Node 24), Express 5, express-validator, mysql2, CORS et limitation des requêtes.
- MySQL 8+ ou MariaDB 10.4+ avec InnoDB. Validation locale réalisée sur MariaDB via XAMPP.
- Tests Node natifs pour les horaires et Playwright/Chrome pour les parcours navigateur.

## Installation

À la racine :

```sh
npm install
cp .env.example .env
```

Renseignez la connexion SQL dans `.env`, puis importez la structure avec un compte autorisé à créer une base :

```sh
mysql -u root -p < server/database/schema.sql
```

Créez un utilisateur applicatif dédié à `barber_rammach` avec les droits `SELECT`, `INSERT`, `UPDATE`, `DELETE`. Renseignez cet utilisateur et son mot de passe dans `.env`. La création de tables reste une opération d’administration.

```sh
npm run db:seed
npm run dev
```

- Interface : http://127.0.0.1:5173
- API : http://127.0.0.1:5000/api
- Vite relaie `/api` vers Express. Les deux processus sont lancés par la commande racine.
- Le seed initialise les 16 prestations officielles, 3 barbiers et 9 photos. Les prix existants du catalogue sont mis à jour, et les anciennes prestations hors catalogue sont désactivées.

Démarrage séparé : `npm run dev -w client` et `npm run dev -w server`.

## Configuration

| Variable                            | Rôle                                                                 |
| ----------------------------------- | -------------------------------------------------------------------- |
| `PORT`, `HOST`                      | Port et adresse d’écoute Express ; `5000`, `127.0.0.1` en local      |
| `DB_HOST`, `DB_PORT`                | Hôte et port SQL (`3308` en local)                                   |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Identifiants du compte applicatif (`rammach_app`)                     |
| `MIGRATION_DB_USER`                 | Compte root/sa utilisé par `npm run db:migrate` (défaut `root`)       |
| `MIGRATION_DB_PASSWORD`             | Mot de passe du compte migration (vide en local sans mot de passe)    |
| `CLIENT_ORIGIN`                     | Origines autorisées, séparées par une virgule                        |
| `SITE_URL`                          | URL publique utilisée par les métadonnées serveur, robots et sitemap |
| `VITE_API_URL`                      | Préfixe API ; `/api` lorsque le site et l’API partagent le domaine   |
| `VITE_SITE_URL`                     | URL canonique publique du frontend ; à définir avant le build        |

Vite lit `.env` à la racine. Seules les variables `VITE_` sont exposées au navigateur. Ne placez jamais de secret dans ces variables. `.env` est ignoré par Git.

`shared/business.js` centralise téléphone, WhatsApp, Instagram, adresse et horaires. `shared/catalog.js` contient le catalogue officiel initial et le formatage des prix. `npm run db:seed` ajoute les colonnes `category` et `price_type` si elles manquent, puis synchronise les 16 prestations.

Les informations commerciales, barbiers et statistiques proviennent du brief. L’adresse est celle de la maquette et doit être confirmée avant publication. La carte interactive est centrée sur Meknès ; aucune coordonnée précise du salon n’a été fournie. Le lien Facebook lance une recherche du salon, faute d’URL de page vérifiée.

### Local database (quick start)

Le serveur local utilise MariaDB 10.4 sur le port **3308** avec ses données dans `.db/data` (exclu du dépôt par `.gitignore`). Utilisez le script d'assistance :

```sh
scripts/mysql.sh start     # démarre le serveur MariaDB local
scripts/mysql.sh status    # vérifie l'état
scripts/mysql.sh stop      # arrête le serveur
```

À la première utilisation, initialisez la base :

```sh
npm run db:migrate          # crée/active l'utilisateur applicatif + tables manquantes
npm run db:seed             # insère les 16 services, 3 barbiers et 9 photos
```

L'administrateur par défaut est `admin@errammach.ma` / `admin123` (haché en base via `npm run db:migrate`). Les comptes utilisateurs et les sessions sont stockés en base SQL, pas dans des fichiers.

## Fonctionnalités

- Six pages publiques et page 404 ; navigation mobile, pied de page et WhatsApp communs.
- **Panneau d'administration** : authentification par cookie httpOnly + JWT (scrypt), sessions chiffrées en base. Gestion complète des services, barbiers, galerie, avis, messages de contact, rendez-vous, clients, **horaires quotidiens (temps du travail)**, **jours fermés** et paramètres du site.
- Réservation : sélection du service et du barbier, calendrier, disponibilités réelles, coordonnées, récapitulatif et confirmation. Un rendez-vous peut aussi être créé par l'admin au nom d'un client (« Nouveau rendez-vous » sur la page Rendez-vous).
- Les dates passées et au-delà d’un an sont rejetées. L’ouverture d’une date dépend des **horaires quotidiens** (dimanche fermé par défaut) et des **jours fermés** (fêtes, congés). Tout est calculé dans `Africa/Casablanca`, indépendamment du fuseau du client.
- Les créneaux commencent toutes les 30 minutes ; l’ouverture/fin de journée et une éventuelle **pause méridienne optionnelle** sont configurées par jour dans « Horaires ». Les jours fermés bloquent tous les créneaux de la date concernée.
- Le prix, le type de prix et la durée sont lus côté serveur et ne sont pas acceptés depuis le client. Les prestations variables affichent "À partir de ..." et gardent ce libellé dans la réservation.
- Les conflits de durée sont protégés par une transaction, un verrou sur le barbier et une clé primaire unique sur chaque minute occupée dans `appointment_slots`. Une réservation concurrente ou chevauchante renvoie HTTP 409.
- Les messages de contact sont enregistrés dans `contacts`. Aucun email/SMS n’est envoyé : aucun fournisseur de messagerie n’a été configuré.
- Galerie filtrable, lightbox native avec fermeture au clavier et restitution du focus, cartes avant/après et lien Instagram.
- Les avis réels peuvent être insérés dans `reviews` ; aucun faux témoignage n’est publié. La section dispose d’un état vide.
- États de chargement, erreur/réessai et succès ; validations client et serveur ; gestion globale des erreurs.
- Titres, descriptions, canonical, OpenGraph et données HairSalon par page. Express injecte les métadonnées dans le HTML initial pour les robots de partage. `/robots.txt` et `/sitemap.xml` utilisent `SITE_URL`.

## Images et design

Les captures originales restent intactes dans `website-images`. Les photographies et le logo ont été extraits de ces références et optimisés dans `client/public/images` (environ 700 Ko au total). Leur résolution est limitée par les captures originales ; remplacez-les par les photographies originales pour un rendu haute définition. Aucun texte de navigation ni formulaire n’est une capture : toute l’interface est du HTML/React interactif.

Les styles se trouvent dans `client/src/styles/global.css` et `responsive.css`. Les variables en tête de `global.css` définissent la palette, les rayons et la largeur maximale. Les polices sont importées depuis Google Fonts avec des polices de repli. La carte Google est chargée à la demande ; l’aperçu local reste visible initialement.

## Structure

```text
client/
  public/           Images WebP et favicon
  src/
    components/     Mise en page, composants partagés et réservation
    config/         Réexport de la configuration commerciale
    contexts/       Fournisseurs React (auth, settings)
    pages/          Six pages publiques, 404, login admin et 12 pages admin
    services/       Client Fetch et hook de chargement
    styles/         Design, adaptations responsive et styles admin scoped
server/
  config/           Pool SQL et lecture de l'environnement
  controllers/      Transactions, disponibilités et admin CRUD
  data/             État initial des sessions (obsolète, supprimé)
  database/         Schéma, migration et initialisation du catalogue
  middleware/       Authentification JWT et téléversement d'images
  routes/           API REST publique et routes admin
  validators/       Validation de chaque requête entrante
  tests/            Tests des règles de calendrier et de chevauchement
  app.js            Express, sécurité HTTP et hébergement du build
  seo.js            Métadonnées HTML côté serveur
shared/             Identité commerciale, catalogue, horaires et métadonnées
scripts/            Lancement local, contrôles API/navigateur et admin
```

## API

Toutes les réponses utilisent `{ success, message, data }` ou `{ success: false, message, errors }`.

| Méthode | Route                            | Entrée                                                                                      |
| ------- | -------------------------------- | ------------------------------------------------------------------------------------------- |
| GET     | `/api/services`                  | Aucune                                                                                      |
| GET     | `/api/barbers`                   | Aucune                                                                                      |
| GET     | `/api/gallery`                   | Aucune                                                                                      |
| GET     | `/api/reviews`                   | Aucune                                                                                      |
| GET     | `/api/appointments/availability` | Query `date`, `barberId`, `serviceId`                                                       |
| POST    | `/api/appointments`              | JSON `serviceId`, `barberId`, `date`, `time`, `name`, `phone`, `email`, `message` optionnel |
| POST    | `/api/contact`                   | JSON `name`, `email`, `phone`, `subject`, `message`                                         |

Disponibilités : liste de `{ time: "09:00", status: "available" | "reserved" | "unavailable" }`. HTTP 422 indique une validation invalide ; 404 un service/barbier inconnu ; 409 un conflit ; 429 trop de soumissions ; 503 une indisponibilité. Les erreurs ne révèlent pas les identifiants ni détails SQL.

Les routes admin (`/api/admin/*`) sont protégées par un cookie httpOnly contenant un JWT signé. Le login accepte `email` + `password` et renvoie un token ; le logout efface le cookie. Les routes CRUD nécessitent une session valide. Les salaires et remises n'existent pas dans le schéma : les statistiques de chiffre d'affaires utilisent uniquement `total_price` des rendez-vous. L'annulation future devra modifier le statut et libérer les lignes `appointment_slots` dans une même transaction.

## Tests

```sh
npm test
npm run build
```

Avec Express et une base de test en fonctionnement :

```sh
node scripts/verify-api.js
node scripts/verify-admin-api.js
node scripts/verify-browser.js
node scripts/verify-forms.js
node scripts/verify-admin-ui.js
```

Les scripts API et formulaires créent des données de test identifiées par email et les suppriment dans `finally`. `verify-admin-api` effectue 37 vérifications (CRUD + auth + transitions). `verify-admin-ui` utilise Playwright pour parcourir les 11 routes admin, tester la sidebar mobile et la déconnexion. Le test API suppose que le barbier 3 est disponible à 09:00 deux semaines après la date courante. Les tests navigateur utilisent Google Chrome installé (`channel: chrome`). Captures de contrôle : `/tmp/rammach-qa`.

Le contrôle responsive couvre les six routes à 1920, 1600, 1440, 1366, 1200, 1024, 768, 430, 390 et 375 px, les images, erreurs JavaScript, filtres, lightbox et navigation mobile. Les scripts de formulaires vérifient la présence effective des lignes SQL après confirmation dans le navigateur.

Kluster n’était pas accessible pendant la réalisation (`connectionError`). Aucune validation Kluster n’est revendiquée.

## Production et déploiement

1. Provisionnez une base MySQL/MariaDB persistante, importez le schéma et initialisez le catalogue.
2. Configurez les variables serveur, les véritables URLs publiques et l’origine du frontend. Utilisez un mot de passe SQL fort et un compte applicatif restreint.
3. Exécutez `npm ci`, puis `npm run build` à la racine.
4. Lancez `npm start` sous un gestionnaire de processus. Express sert `client/dist`, les routes React et l’API sur le même port.
5. Placez un reverse proxy HTTPS devant le serveur. Configurez `HOST=0.0.0.0` seulement si l’environnement le nécessite. Pour la limitation par IP derrière proxy, réglez `trust proxy` dans Express selon la topologie exacte du fournisseur ; ne faites pas confiance à tous les proxies.
6. Sauvegardez la base et vérifiez les pages, formulaires, liens externes et informations commerciales sur le domaine réel.

Un hébergement frontend séparé est possible avec `VITE_API_URL` dirigé vers l’API et une règle de réécriture vers `index.html`, mais l’injection serveur des métadonnées nécessite alors une configuration équivalente sur cet hébergement. Le déploiement Express unifié est la configuration fournie.

La confirmation à l’écran signifie que le rendez-vous ou le message a été enregistré. Le panneau d’administration permet de gérer les rendez-vous, services, barbiers, galerie, avis et messages. Pour les notifications et la gestion quotidienne, ajoutez un prestataire de messagerie selon vos besoins opérationnels.

## Environnement local préparé pendant la réalisation

Le fichier `.env` local utilise un compte restreint et un serveur MariaDB isolé sur le port **3308**, avec ses données dans `.db/data`. Démarrez-le avec `scripts/mysql.sh start` ; les fichiers `.env` et `server/database/schema.sql` sont déjà configurés. Ce serveur sert uniquement à la démonstration et aux tests ; ses données temporaires ne remplacent pas une base persistante de production. Le site construit est accessible sur http://localhost:5000 tant que les processus locaux restent actifs. Après arrêt du serveur SQL, utilisez votre instance MySQL habituelle et adaptez `.env` selon les étapes d’installation ci-dessus.
