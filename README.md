Ce dépôt regroupe les corrections et implémentations de l'ensemble des trois Travaux Pratiques (TP) de la piscine DevOps. Chaque dossier contient son propre code, ses fichiers de configuration Docker, ainsi que le rapport de TP officiel au format PDF.

---

## Sujet Principal

Le sujet général contenant toutes les consignes pour les trois TP est disponible à la racine de ce dossier :
**[Sujet_b2_22_juin.pdf]**

---

## Structure du Workspace

Voici l'organisation globale du projet et l'emplacement de chaque livrable :

```text
docker-devops/
 ├── Sujet_b2_22_juin.pdf             # Le sujet de TP général du cours
 ├── README.md                        # Ce fichier (index global)
 │
 ├── SujetTP1/                        # TP1 : Réparation d'une image Docker cassée
 │    ├── Dockerfile                  # Multi-stage build optimisé (< 200 Mo, USER node)
 │    ├── Dockerfile.casse            # Image cassée d'origine (pour comparaison)
 │    ├── .dockerignore               # Fichiers exclus du build
 │    ├── tp1-Mathis Ducarois.pdf     # Rapport de rendu officiel pour le TP1
 │    └── README.md                   # Guide spécifique au TP1
 │
 ├── SujetTP2/                        # TP2 : Orchestration multi-services
 │    ├── docker-compose.yml          # Stack : PostgreSQL + API + Frontend + Adminer
 │    ├── .env                        # Variables d'environnement locales (ports, secrets)
 │    ├── tp2-Mathis Ducarois.pdf     # Rapport de rendu officiel pour le TP2
 │    ├── README.md                   # Guide spécifique au TP2
 │    ├── api/                        # Code source & Dockerfile de l'API
 │    └── frontend/                   # Code source & Dockerfile du Frontend
 │
 └── SujetTP3/                        # TP3 : Containerisation complète de TaskFlow
      ├── docker-compose.yml          # Stack : Redis (interne) + Backend + Frontend
      ├── .env                        # Variables de configuration de la stack
      ├── .env.example                # Modèle de configuration commitable
      ├── .dockerignore               # Fichiers exclus des builds
      ├── tp3-Ducarois Mathis.pdf     # Rapport de rendu officiel pour le TP3
      ├── README.md                   # Guide spécifique au TP3
      ├── backend/                    # Code source & Dockerfile de l'API Node/Redis
      └── frontend/                   # Fichiers statiques & Dockerfile de l'interface Nginx
```

---

## Présentation des Travaux Pratiques

### 1. [TP1 — Réparation de l'image cassée](SujetTP1)

- **Objectif** : Corriger un `Dockerfile` mal conçu et volumineux pour le rendre sécurisé, léger et conforme aux standards de production.
- **Optimisations** :
  - Utilisation d'une image de base Alpine (`node:18-alpine`).
  - Passage en **multi-stage build** pour exclure les outils de build et de dev de l'image de production.
  - Exécution sous l'utilisateur non privilégié `node` (sécurité contre l'escalade de privilèges).
  - Optimisation des couches de cache Docker.
- **Résultat** : L'image finale ne pèse que **181 Mo** (limite demandée : < 200 Mo).

### 2. [TP2 — Orchestration multi-services](SujetTP2)

- **Objectif** : Déployer une architecture à base de microservices avec Docker Compose reliant un Frontend (Nginx), une API REST (Node.js) et une base de données PostgreSQL persistante, plus un outil d'administration (Adminer).
- **Optimisations** :
  - Persistance des données via un volume nommé `pgdata`.
  - Contrôle de la santé de la base via un `healthcheck` Postgres, bloquant le démarrage de l'API tant que la base n'est pas prête (`depends_on: service_healthy`).
  - Isolation et gestion sécurisée des identifiants et des ports via un fichier local `.env`.

### 3. [TP3 — Containerisation de TaskFlow](SujetTP3)

- **Objectif** : Containeriser TaskFlow, une application de gestion de tâches utilisant une API Node.js, un serveur statique Nginx et une base de données Redis faisant office de cache et de stockage persistant.
- **Optimisations** :
  - **Zéro exposition de port pour Redis** : Redis est confiné au réseau Docker interne `taskflow` et n'expose aucun port sur la machine hôte pour éviter les piratages.
  - **Healthcheck Redis** : Démarrage du backend conditionné par un `redis-cli ping` valide sur le conteneur de cache.
  - **Calcul des statistiques** : Route `/stats` qui extrait les indicateurs clés et les stocke en cache Redis avec un TTL (durée de validité) de 30 secondes.

---

## Instructions de test rapide

Pour lancer et tester les stacks locales, installez Docker Desktop et utilisez les commandes suivantes dans un terminal :

### Lancer le TP2 (Multi-services)

```bash
cd SujetTP2
docker compose up --build -d
# Accès :
# - Frontend : http://localhost:8080
# - API Health : http://localhost:3000/health
# - Adminer : http://localhost:8081
```

### Lancer le TP3 (TaskFlow)

```bash
cd SujetTP3
docker compose up --build -d
# Accès :
# - Frontend TaskFlow : http://localhost:8080
# - API Health : http://localhost:3001/health
```

### Stopper une stack

```bash
docker compose down
```

### Supprimer les volumes persistants (remise à zéro de la BDD / du cache)

```bash
docker compose down -v
```

> [!WARNING]
> Les TP2 et TP3 partagent le port local `8080` pour l'exposition de leur Frontend. Veillez à toujours exécuter un `docker compose down` dans le dossier du TP en cours avant de lancer l'autre.
