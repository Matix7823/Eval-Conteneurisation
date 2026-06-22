# =======================================================
# ── Stage 1 : builder ──────────────────────────────────
# =======================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copie des fichiers package (on utilise npm install car il n'y a pas de package-lock.json ici)
COPY package*.json ./
RUN npm install

# Copie du reste du code source
COPY . .

# Exécution du build (création du dossier dist et copie de index.js)
RUN npm run build

# =======================================================
# ── Stage 2 : production ───────────────────────────────
# =======================================================
FROM node:18-alpine

WORKDIR /app

# Préparation du répertoire de données et attribution des droits à l'utilisateur node
RUN mkdir -p /app/data && chown -R node:node /app

# On ne copie QUE le résultat du build depuis l'étape précédente.
# S'il y avait des dépendances de production, il faudrait aussi copier node_modules ici.
COPY --from=builder /app/dist ./dist

# Passage à un utilisateur non-root pour l'exécution
USER node

# Exposition du port d'écoute de l'application
EXPOSE 3000

# Commande de démarrage
CMD ["node", "dist/index.js"]
