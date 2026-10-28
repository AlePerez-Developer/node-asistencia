# --- Etapa 1: Constructor ---
FROM node:24.22.1-alpine AS constructor

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Elimina dependencias de desarrollo para dejar la carpeta node_modules limpia
RUN npm prune --omit=dev


# --- Etapa 2: Producción ---
FROM node:24.22.1-alpine

# Buenas prácticas de seguridad: no ejecutar como root
USER node

WORKDIR /app

# Copia solo lo estrictamente necesario desde el constructor
COPY --from=constructor /app/package*.json ./
COPY --from=constructor /app/dist ./dist
COPY --from=constructor /app/node_modules ./node_modules

EXPOSE 3333

# Ejecución directa y eficiente (Evita problemas de PID 1)
CMD ["node", "dist/app.js"]