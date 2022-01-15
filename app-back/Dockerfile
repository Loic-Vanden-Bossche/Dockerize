FROM node:12-alpine

RUN apk add make gcc g++ python

WORKDIR /usr/app/

EXPOSE 3000

VOLUME /usr/app

CMD sh -c 'npm i && npm run start'