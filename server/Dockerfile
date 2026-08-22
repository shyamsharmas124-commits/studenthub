# StudentHub backend — Node/Express + Prisma
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies first so this layer is cached across code-only changes
COPY package*.json ./
RUN npm install --omit=dev

# Prisma needs its schema present before `npm install`'s postinstall (prisma generate) runs
COPY prisma ./prisma
RUN npx prisma generate

COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/index.js"]
