# TP1 - Réparation d'une image Docker cassée

Ce projet contient la correction d'un Dockerfile initialement mal conçu.

## Rapport

> [!NOTE]
> Le fichier **`tp1-Mathis Ducarois.pdf`** est le rapport complet de ce TP.

## Arborescence du projet

```text
SujetTP1/
 ├── Dockerfile                  # Le Dockerfile corrigé et optimisé
 ├── Dockerfile.casse            # Le Dockerfile d'origine (pour comparaison)
 ├── .dockerignore               # Fichier d'exclusion pour le build
 ├── index.js                    # Code source de l'application Node.js
 ├── package.json                # Dépendances du projet
 ├── README.md                   # Ce fichier
 └── tp1-Mathis Ducarois.pdf     # Le rapport du TP
```

## Objectifs atteints

- **Taille de l'image réduite** : Passage de l'image `node:18` à `node:18-alpine`.
- **Sécurité** :
  - Suppression des variables d'environnement contenant des secrets en clair.
  - L'application s'exécute désormais avec l'utilisateur non privilégié `node` (au lieu de `root`).
- **Optimisation du cache** : Le fichier `package.json` est copié en premier et `npm install --omit=dev` est exécuté en amont.
- **Nettoyage** : Suppression des outils système inutiles.

## Commandes utiles

Construire l'image corrigée :

```bash
docker build -t tp1:corrige .
```

Vérifier que le container tourne avec un utilisateur restreint :

```bash
docker run --rm tp1:corrige whoami
```
