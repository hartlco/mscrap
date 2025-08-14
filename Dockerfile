FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache python3 make g++ && \
    npm ci --only=production && \
    apk del python3 make g++

COPY . .

EXPOSE 3000

USER node

CMD ["node", "index.js"]