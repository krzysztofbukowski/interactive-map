FROM node:9.4.0

WORKDIR /var/app
ADD build /var/app

RUN groupadd -r docker && useradd -m --no-log-init -r -g docker docker \
    && chown -R docker:docker /var/app

USER docker

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV:-production}

RUN npm i
RUN npm run build
CMD ["npm", "start"]
