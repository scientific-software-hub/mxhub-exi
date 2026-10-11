# syntax=docker/dockerfile:1

# ---- Build stage ----------------------------------------------------------
# Runs `vite build` inside the image, so `docker build` is now the only
# build step -- no host `npm run build` before this. package-lock.json is
# gitignored and not committed, so this is a plain `npm install`, not
# `npm ci` (matches the e2e CI workflow). All dependencies (including
# extjs-gpl) come from public npm, so no registry auth is needed.
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .
# Production is served behind a reverse proxy under an "/exi/" prefix, so
# Vite's absolute asset URLs (JS bundle, favicon) need that prefix baked in
# at build time -- see vite.config.js's VITE_BASE_PATH comment. Defaults to
# "/" (unprefixed), matching hitting this container directly.
#   docker build --build-arg BASE_PATH=/exi/ ...
ARG BASE_PATH=/
ENV VITE_BASE_PATH=$BASE_PATH
RUN npm run build

# ---- Runtime stage ----------------------------------------------------------
# Use the official Nginx base image
FROM nginx:1.25.3-alpine

# Set the working directory to /usr/share/nginx/html
WORKDIR /usr/share/nginx/html

# Production MX module. dist/ is the `vite build` output for mx/ (entry
# HTML, ExtJS + vendor libs, app bundle, CSS bundle, plus images/, fonts/,
# csv/ -- vite.config.js's viteStaticCopy targets copy those in at build
# time, so dist/ is self-contained here).
COPY --chown=nginx:nginx --from=build /app/dist/  ./
ADD --chown=nginx:nginx index.html      ./index.html


# Environment variable to set the timezone for the containers
ENV TZ=Europe/Berlin

# Expose port 80 to the outside world
EXPOSE 80

# Command to run the Nginx server
CMD ["nginx", "-g", "daemon off;"]
