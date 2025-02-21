#TODO use multi stage build

# Use the official Nginx base image
FROM nginx:1.25.3-alpine

# Set the working directory to /usr/share/nginx/html
WORKDIR /usr/share/nginx/html

# Copy the local static content into the container at /usr/share/nginx/html
COPY --chown=nginx:nginx . /usr/share/nginx/html

# Ensure permissions are correct for static files
RUN chmod -R 400 /usr/share/nginx/html

# Drop root privileges for better security
USER nginx

# Environment variable to set the timezone for the containers
ENV TZ=Europe/Berlin

# Expose port 80 to the outside world
EXPOSE 80

# Command to run the Nginx server
CMD ["nginx", "-g", "daemon off;"]