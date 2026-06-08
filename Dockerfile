# Use the official Nginx base image
FROM nginx:1.25.3-alpine

# Set the working directory to /usr/share/nginx/html
WORKDIR /usr/share/nginx/html

# Production MX module — compiled bundles, entry point, ExtJS, and static assets.
# ExtJS is copied into min/extjs/ by the Grunt build step (copy-extjs task).
# js/, css/, and build tooling are intentionally excluded (build artifacts only).
COPY --chown=nginx:nginx mx/         ./mx/
COPY --chown=nginx:nginx min/        ./min/
COPY --chown=nginx:nginx images/     ./images/
COPY --chown=nginx:nginx fonts/      ./fonts/
COPY --chown=nginx:nginx csv/        ./csv/
ADD --chown=nginx:nginx index.html      ./index.html


# Environment variable to set the timezone for the containers
ENV TZ=Europe/Berlin

# Expose port 80 to the outside world
EXPOSE 80

# Command to run the Nginx server
CMD ["nginx", "-g", "daemon off;"]
