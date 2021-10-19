###########################################################################################
# Runner: Nginx
###########################################################################################

FROM nginx as runner

# Copy nginx configuration
COPY docker/nginx.dev.conf /etc/nginx/conf.d/default.conf

# List files
RUN ls -lA /usr/share/nginx/html

# Expose RedwoodJS web port
EXPOSE 80
