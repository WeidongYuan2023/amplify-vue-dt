FROM nginx:1.27.2
RUN mkdir /usr/share/nginx/html/museum/
COPY dist/ /usr/share/nginx/html/museum/
COPY dist/index.html /usr/share/nginx/html/index.html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf