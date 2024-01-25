#TODO use multi stage build

# Use the official Nginx base image
FROM nginx:1.25.3-perl

# Set the working directory to /usr/share/nginx/html
WORKDIR /usr/share/nginx/html

# Copy the local static content into the container at /usr/share/nginx/html
COPY . /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Command to run the Nginx server
CMD ["nginx", "-g", "daemon off;"]