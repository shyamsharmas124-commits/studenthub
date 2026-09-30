# StudentHub backend — Node/Express + Prisma
FROM node:20-alpine AS base
WORKDIR /app

# Prisma needs its schema present before `npm install`'s postinstall (prisma generate) runs
COPY package*.json ./
COPY prisma ./prisma

# Install OpenSSL so Prisma can detect the correct version (OpenSSL 3 on Alpine)
RUN apk add --no-cache openssl
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/index.js"]
