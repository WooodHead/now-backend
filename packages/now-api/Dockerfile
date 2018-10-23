FROM node:8.12.0-alpine
WORKDIR /build
COPY package.json .
COPY yarn.lock .
COPY . .
RUN apk --no-cache add curl --update-cache \
  && apk --no-cache add  --virtual .build-dependencies g++ git make python2 \
  && yarn install \
  && yarn build:prod \
  && yarn install --modules-folder ../node_modules --prod \
  && yarn cache clean \
  && apk del .build-dependencies

RUN cp dist/server.js ..
WORKDIR /
COPY package.json .
COPY knexfile.js .
COPY migrations migrations
COPY public public
COPY bin/start.sh .
COPY cron.yaml .

RUN rm -rf build
USER node

EXPOSE 3000


CMD ["./start.sh"]
