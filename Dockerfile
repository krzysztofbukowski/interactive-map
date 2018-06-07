FROM node:9.4.0

WORKDIR /var/app
ADD ["package.json", "package-lock.json", "server.js", "/var/app/"]
ADD build /var/app/build

RUN groupadd -r docker && useradd -m --no-log-init -r -g docker docker \
    && chown -R docker:docker /var/app

USER docker

ARG NODE_ENV
ARG NODE_PORT
ENV NODE_ENV ${NODE_ENV:-production}
ENV NODE_PORT ${NODE_PORT:-3000}

RUN npm i
CMD ["npm", "start"]
