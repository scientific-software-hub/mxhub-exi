# syntax=docker/dockerfile:1

# ---- Build stage ----------------------------------------------------------
# Runs `vite build` inside the image, so `docker build` is now the only
# build step -- no host `npm run build` before this. package-lock.json is
# gitignored and not committed, so this is a plain `npm install`, not
# `npm ci` (matches the e2e CI workflow). @scientific-software-hub/extjs is
# a private GitHub Packages package (see .npmrc's registry mapping), so the
# install needs a `read:packages` PAT. Pass it as a BuildKit secret (never
# a --build-arg: those land in the image history, a secret doesn't). If the
# token is already in ~/.npmrc, pull it from there directly:
#   docker build --secret id=npm_token,src=<(grep -oP '(?<=_authToken=).*' ~/.npmrc) .
# Otherwise:
#   docker build --secret id=npm_token,env=NPM_TOKEN .
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json .npmrc ./
RUN --mount=type=secret,id=npm_token \
    npm config set //npm.pkg.github.com/:_authToken="$(cat /run/secrets/npm_token)" && \
    npm install --no-audit --no-fund

COPY . .
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
