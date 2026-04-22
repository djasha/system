# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package manifests and install deps
COPY package*.json ./
RUN npm ci

# Copy sources and build
COPY . .
RUN npm run build

# Serve stage
FROM caddy:2-alpine
COPY --from=build /app/dist /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
