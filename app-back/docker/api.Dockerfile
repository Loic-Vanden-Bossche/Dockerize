FROM node:12

RUN mkdir /srv/nest

RUN chown -R node:node /usr/local/lib/node_modules \
  && chown -R node:node /usr/local/bin \
  && chown -R node:node /srv/nest

USER node:node

WORKDIR /srv/nest

EXPOSE 4200
