# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ael-khel <ael-khel@student.1337.ma>        +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/01/16 05:26:34 by ael-khel          #+#    #+#              #
#    Updated: 2025/03/21 01:03:58 by ael-khel         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Base image
FROM alpine:3.21.2

# Install Nginx and dependencies 
RUN apk update && apk upgrade && apk add --no-cache \
	nginx

# Copy the Nginx configuration file
COPY conf/nginx.conf /etc/nginx/nginx.conf

COPY app /app

# Expose the Nginx port
EXPOSE 3000/tcp

# Entrypoint to start Nginx in foreground mode
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
