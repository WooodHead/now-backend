FROM node:8.9.4-alpine
# For sharp image library
# http://sharp.pixelplumbing.com/en/stable/install/#alpine-linux
# https://github.com/gliderlabs/docker-alpine/blob/master/docs/usage.md#disabling-cache
RUN apk --no-cache add vips-dev fftw-dev --update-cache --repository https://dl-3.alpinelinux.org/alpine/edge/testing/

USER node

EXPOSE 3000

COPY dist .

ENV NODE_ENV=production

CMD ["node","server.js"]
