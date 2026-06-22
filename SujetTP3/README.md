# TP3 - Conteneurisation de TaskFlow

Ce projet implémente la conteneurisation complète de l'application TaskFlow (Frontend, Backend Node.js et Cache Redis) via Docker Compose.

## Rapport

> [!NOTE]
> Le fichier **`tp3-Ducarois Mathis.pdf`** est le rapport complet de ce TP. Il documente le processus de réflexion, l'architecture choisie et les commandes de vérification.

## Arborescence du projet

```text
SujetTP3/
 ├── .env                        # Variables d'environnement locales (secrets, ports)
 ├── .env.example                # Modèle de configuration commitable (sans secrets)
 ├── .dockerignore               # Fichiers exclus de tous les builds (ex: node_modules, .env)
 ├── docker-compose.yml          # Orchestration des 3 services (Frontend, Backend, Cache)
 ├── README.md                   # Ce fichier
 ├── tp3-Ducarois Mathis.pdf     # Le rapport de TP officiel
 │
 ├── backend/                    # API Express + ioredis
 │    ├── Dockerfile             # Build Node.js (node:20-alpine)
 │    ├── package.json           # Dépendances du backend
 │    └── server.js              # Code de l'API
 │
 └── frontend/                   # Interface web
      ├── Dockerfile             # Build Nginx (nginx:alpine)
      └── index.html             # Code de l'interface (HTML/JS/CSS)
```

## Architecture

- **Frontend** : Interface statique servie par Nginx (`nginx:alpine`). Accessible publiquement sur le port `8080`.
- **Backend** : API REST en Node.js (`node:20-alpine`). Accessible sur le port `3001` (pour les tests de santé `GET /health` ou l'ajout de tâches en CLI).
- **Cache (Redis)** : Base de données en mémoire pour le stockage des tâches (`redis:7-alpine`). **Non exposée** sur la machine hôte pour des raisons de sécurité.

## Bonnes pratiques mises en place

- **Séparation des responsabilités** : Code structuré en dossiers `backend/` et `frontend/`, chacun avec son `Dockerfile` dédié qui part d'images ultra-légères Alpine.
- **Sécurité réseau** : Redis n'a pas de directive `ports:` dans le `docker-compose.yml`. Il est uniquement joignable par le backend via le réseau Docker interne `taskflow` (résolution DNS automatique sur le nom `cache`).
- **Persistance** : Un volume Docker nommé `redis_data` permet de conserver les tâches créées même si les containers sont redémarrés (`docker compose down`).
- **Robustesse** : Le backend attend que Redis soit prêt à répondre aux PING (`depends_on: condition: service_healthy`) avant de démarrer, évitant ainsi un crash de connexion de l'API au lancement.

## Lancement du projet

Construire et démarrer l'ensemble de la stack en arrière-plan :

```bash
docker compose up --build -d
```

Vérifier l'état de santé des services (notamment Redis) :

```bash
docker compose ps
```

Vérifier que l'API est en ligne :

```bash
curl http://localhost:3001/health
```

Accéder à l'interface TaskFlow dans votre navigateur :
**[http://localhost:8080](http://localhost:8080)**

Stopper l'application (en conservant vos tâches) :

```bash
docker compose down
```

Réinitialiser l'application (supprimer les containers **et** toutes les tâches sauvegardées) :

```bash
docker compose down -v
```
