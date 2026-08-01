# Use the official Nginx base image
FROM nginx:1.25.3-alpine

# Set the working directory to /usr/share/nginx/html
WORKDIR /usr/share/nginx/html

# Production MX module. dist/ is the `vite build` output for mx/ (entry
# HTML, ExtJS + vendor libs, app bundle, CSS bundle) -- built on the host
# before `docker build` runs (`npm run build`), same as the Grunt-built
# mx/+min/ this replaces. images/, fonts/, csv/ are plain static assets
# Vite doesn't touch, copied as siblings exactly as before.
COPY --chown=nginx:nginx dist/       ./
COPY --chown=nginx:nginx images/     ./images/
COPY --chown=nginx:nginx fonts/      ./fonts/
COPY --chown=nginx:nginx csv/        ./csv/
ADD --chown=nginx:nginx index.html      ./index.html
COPY assets/nginx.conf              /etc/nginx/nginx.conf
COPY assets/default.conf.template   /etc/nginx/templates/default.conf.template


# Environment variable to set the timezone for the containers
ENV TZ=Europe/Berlin
# Where ISPyB is reachable from this container -- override at `docker run`
# time to match your actual deployment (see assets/default.conf.template).
ENV ISPYB_UPSTREAM=http://ispyb:8080

# Expose port 80 to the outside world
EXPOSE 80

# Command to run the Nginx server
CMD ["nginx", "-g", "daemon off;"]
