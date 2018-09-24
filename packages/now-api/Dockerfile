FROM node:8.9.4-alpine
# For sharp image library
# http://sharp.pixelplumbing.com/en/stable/install/#alpine-linux
# https://github.com/gliderlabs/docker-alpine/blob/master/docs/usage.md#disabling-cache
WORKDIR /build
COPY package.json .
COPY yarn.lock .
COPY . .
RUN apk --no-cache add vips-dev fftw-dev curl --update-cache --repository https://dl-3.alpinelinux.org/alpine/edge/testing/ \
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
