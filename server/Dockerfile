# StudentHub backend — Node/Express + Prisma
FROM node:20-alpine AS base
WORKDIR /app

# Prisma needs its schema present before `npm install`'s postinstall (prisma generate) runs
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/index.js"]
