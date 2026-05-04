# Etapa 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
# Instalamos solo dependencias de producción para ahorrar espacio
RUN npm install --omit=dev

# Seguridad: No correr como root
USER node

EXPOSE 3000
CMD ["node", "dist/main"]
