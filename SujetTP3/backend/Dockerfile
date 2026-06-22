FROM node:20-alpine

WORKDIR /app

# Optimisation du cache : dépendances en premier
# Si package-lock.json est présent, préférer : RUN npm ci
COPY package*.json ./
RUN npm install --omit=dev

# Code source après les dépendances
COPY server.js ./

# Utilisateur non-root fourni par l'image node
USER node

EXPOSE 3001

CMD ["node", "server.js"]
