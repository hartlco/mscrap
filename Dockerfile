FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache python3 make g++ && \
    npm ci --only=production && \
    apk del python3 make g++

COPY . .

RUN mkdir -p /app/cache && chown -R node:node /app/cache

EXPOSE 3000

USER node

CMD ["node", "index.js"]