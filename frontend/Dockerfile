# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ael-khel <ael-khel@student.1337.ma>        +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/01/16 05:26:34 by ael-khel          #+#    #+#              #
#    Updated: 2025/03/25 06:26:26 by ael-khel         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Base image
FROM alpine:3.21.2

# Install Nginx and dependencies 
RUN apk update && apk upgrade && apk add --no-cache \
	nginx \
	openssl

# Create the necessary directories for SSL certificates
RUN mkdir -p /etc/nginx/ssl

# Generate self-signed certificate
RUN openssl req -x509 -nodes -days 365 -newkey rsa:4096 -sha256 \
	-keyout /etc/nginx/ssl/nginx.key \
	-out /etc/nginx/ssl/nginx.crt \
	-subj "/C=MA/ST=Tanger-Tetouan-Hoceima/L=Tetouan/O=1337 Coding School/OU=Transcendence/CN=localhost"

# Copy the Nginx configuration file
COPY conf/nginx.conf /etc/nginx/nginx.conf

COPY app /app

# Expose the Nginx port
EXPOSE 443/tcp

# Entrypoint to start Nginx in foreground mode
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]