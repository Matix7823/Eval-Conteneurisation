# TP2 - Déploiement multi-services avec Docker Compose

Ce projet déploie une stack web complète (Frontend, API, Base de données et Interface d'administration) orchestrée par Docker Compose.

## Rapport
> [!NOTE]
> Le fichier **`tp2-Mathis Ducarois.pdf`** est le rapport complet de ce TP.

## Arborescence du projet
```text
SujetTP2/
 ├── .env                        # Variables d'environnement (secrets, ports)
 ├── docker-compose.yml          # Configuration de l'orchestration Docker Compose
 ├── README.md                   # Ce fichier
 ├── tp2-Mathis Ducarois.pdf     # Le rapport du TP
 │
 ├── api/                        # Service API Node.js
 │    ├── .dockerignore          # Fichiers exclus du build API
 │    ├── Dockerfile             # Instructions de build de l'API optimisée
 │    ├── index.js               # Code source de l'API
 │    └── package.json           # Dépendances de l'API
 │
 └── frontend/                   # Service Frontend Nginx
      ├── .dockerignore          # Fichiers exclus du build Frontend
      ├── Dockerfile             # Instructions de build du Frontend
      └── index.html             # Code source du Frontend
```

## Architecture

- **Frontend** : Servi par Nginx (image `nginx:alpine`). Accessible sur le port `8080`.
- **API** : Application Node.js REST (image `node:18-alpine`). Accessible sur le port `3000`.
- **Base de données** : PostgreSQL (image `postgres:15-alpine`). Isolée sur le réseau interne.
- **Adminer** : Interface web d'administration de la BDD. Accessible sur le port `8081`.

## Bonnes pratiques mises en place
- **Sécurité et Secrets** : Tous les mots de passe sont extraits du `docker-compose.yml` et placés dans le fichier `.env`.
- **Persistance des données** : Un volume Docker nommé `pgdata` a été créé pour PostgreSQL.
- **Ordre de démarrage** : L'API attend que PostgreSQL soit complètement prêt via `depends_on: service_healthy`.
- **Résilience** : Politique `restart: on-failure` sur l'API, et `unless-stopped` sur les autres services.

## Lancement du projet

Construire et démarrer l'ensemble de la stack en arrière-plan :
```bash
docker compose up --build -d
```

Stopper l'application (en conservant les données de la BDD) :
```bash
docker compose down
```

Réinitialiser l'application (supprimer les containers **et** le volume) :
```bash
docker compose down -v
```
