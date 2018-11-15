# Dockerfile for proxy server

FROM node:11.1.0

WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app

CMD node proxyserver.js

EXPOSE 80