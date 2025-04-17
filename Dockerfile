# Selecciona la imagen base para construir
FROM node:23-alpine AS constructor

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

COPY package*.json ./

# Instala dependencias en modo producción
RUN npm install --only=production && npm prune --production && npm cache clean --force

# Copia el resto de los archivos necesarios al contenedor
COPY ./dist ./dist
COPY .env ./

# Expone el puerto de la aplicación (ajusta según el puerto que uses)
EXPOSE 3333

# Comando para iniciar la aplicación
CMD ["node", "dist/app.js"]