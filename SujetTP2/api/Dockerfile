FROM node:18-alpine

WORKDIR /app

# Optimisation du cache : dépendances d'abord
COPY package*.json ./
RUN npm install --omit=dev

# Code source copié APRÈS les dépendances
COPY index.js ./

# Utilisateur non-root fourni par l'image node
USER node

EXPOSE 3000
CMD ["node", "index.js"]
