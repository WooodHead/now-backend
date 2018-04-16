FROM node:8.9.4-alpine
# For sharp image library
# http://sharp.pixelplumbing.com/en/stable/install/#alpine-linux
# https://github.com/gliderlabs/docker-alpine/blob/master/docs/usage.md#disabling-cache
WORKDIR /build
COPY package.json .
COPY yarn.lock .
COPY . .
RUN apk --no-cache add vips-dev fftw-dev --update-cache --repository https://dl-3.alpinelinux.org/alpine/edge/testing/ \
  && apk --no-cache add  --virtual .build-dependencies g++ git make python2 \ 
  && yarn install \
  && yarn build \
  && yarn install --modules-folder ../node_modules --prod \
  && yarn cache clean \
  && apk del .build-dependencies

RUN cp dist/server.js ..
WORKDIR /
RUN rm -rf build
USER node

EXPOSE 3000


CMD ["node","server.js"]
