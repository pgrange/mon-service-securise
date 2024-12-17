# MonServiceSécurisé

MonServiceSécurisé est un service numérique développé par le laboratoire
d'innovation de l'[ANSSI](https://www.cyber.gouv.fr/), en lien avec l'incubateur
[BetaGouv](https://beta.gouv.fr/) de la direction interministérielle du
numérique. Il vise à aider les collectivités territoriales et les autres
entités publiques à sécuriser et à homologuer leurs services publics numériques
(sites web, applications mobiles, API).

## Configuration de l'environnement de développement

Il est nécessaire en prérequis d'avoir installé [Git](https://git-scm.com/),
[Docker](https://www.docker.com/) et [Node.js v16](https://nodejs.org/en/).

Commencer par récupérer les sources du projet et aller dans le répertoire créé.

```sh
$ git clone https://github.com/betagouv/mon-service-securise.git && cd mon-service-securise
```

Créer un `network` Docker pour accueillir MonServiceSécurisé en local.

```sh
$ docker network create mss-network
```

Créer un `network` Docker pour accueillir les services du Lab en local, s'il n'existe pas déjà.

```sh
$ docker network create lab-network
```

Créer un fichier `.env` à partir du fichier `.env.template` et renseigner les diverses variables d'environnement.

Lancer le script `scripts/start.sh`

Se connecter au conteneur de la base de données et créer une nouvelle base `mss` pour un utilisateur postgres.

```sh
$ docker compose exec mss-db createdb -U postgres mss
```

Exécuter les migrations depuis le conteneur du serveur web.

```sh
$ docker compose exec web npx knex migrate:latest
```

Le serveur est configuré et prêt à être redémarré.

## Lancement du serveur

```sh
$ docker-compose restart web
```

(Ou arret et ré-exécution de `./script/start.sh`)

Le serveur devrait être accessible depuis un navigateur à l'URL
`http://localhost:[PORT_MSS]` (avec comme valeur pour `PORT_MSS` celle indiquée
dans le fichier `.env`).

Il est alors possible de créer un compte utilisateur à l'url `http://localhost:[PORT_MSS]/inscription`.

### Outils en local

- Il est possible d'attacher un debugger `nodejs` car MSS est démarré avec `--inspect=0.0.0.0`.
- `Postgres` est relayé sur le port `5432` de l'hôte. Donc le requêtage via un outil graphique est possible.

## Exécution de la suite de tests automatisés

Les tests peuvent être lancés depuis un conteneur Docker en exécutant le script
`scripts/tests.sh`. Les tests sont alors rejoués à chaque modification de
fichier du projet sur la machine hôte.

## Conception

### Composants Svelte

Certaines parties du frontend sont suffisament compliquées pour ne pas être codées en jQuery.
Pour celles-ci, on utilise `Svelte`. Le code est rangé dans `/svelte`.

En local, les composants sont `build` à la volée grâce à l'option `vite build --watch`.

En production, ils sont `build` via le `build` du `package.json`.

Dans les deux cas, le code généré se retrouve dans `/public/composants-svelte` pour être référencé depuis les `.pug`.
