# Selecciona la imagen base para construir
FROM node:20-alpine AS constructor

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos package.json y package-lock.json al directorio de trabajo
COPY package*.json ./

# Instala TODAS las dependencias 
RUN npm install

# Copia el resto del código fuente
COPY . .

# Compila el código TypeScript a JavaScript
RUN npm run build

# Etapa de producción
FROM node:20-alpine

# Define el directorio de trabajo
WORKDIR /app

# Copia los archivos package.json y package-lock.json al directorio de trabajo
COPY --from=constructor /app/package*.json ./
COPY --from=constructor /app/.env ./.env
#COPY --from=constructor .public ./public
COPY --from=constructor /app/dist ./dist

# Instala solo las dependencias de producción y limpia la caché
RUN npm install --production && npm prune --production && npm cache clean --force

# Expone el puerto en el que el servidor está escuchando
EXPOSE 3001

# Ejecuta el comando para iniciar la aplicación
CMD ["npm","start"]
