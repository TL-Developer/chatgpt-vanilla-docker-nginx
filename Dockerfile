FROM nginx

ENV OPENAI_API_KEY=value

COPY ./nginx.conf /etc/nginx/nginx.conf

COPY /src /usr/share/nginx/html