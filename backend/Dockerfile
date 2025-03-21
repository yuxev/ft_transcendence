# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ael-khel <ael-khel@student.1337.ma>        +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/03/17 22:44:52 by ael-khel          #+#    #+#              #
#    Updated: 2025/03/20 11:28:22 by ael-khel         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #


FROM python:3.13.2-alpine3.21

RUN apk update && apk upgrade && apk add --no-cache curl

COPY app /app

WORKDIR /app

RUN pip install -r requirements.txt

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "auth.wsgi:application", "--bind", "0.0.0.0:8000"]
