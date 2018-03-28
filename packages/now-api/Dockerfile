FROM node:8.9.4-alpine
USER node

EXPOSE 3000

COPY dist .

ENV NODE_ENV=production

CMD ["node","server.js"]
