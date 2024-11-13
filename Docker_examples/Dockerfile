FROM ubuntu:latest
RUN apt-get update
RUN apt-get install -y nginx
RUN echo 'Hi, I am in your container' \
    > /usr/share/nginx/html/index.html
EXPOSE 80
VOLUME [ "/data" ]
CMD ["nginx", "-g", "daemon off;"]