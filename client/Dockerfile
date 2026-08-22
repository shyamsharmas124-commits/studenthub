# StudentHub frontend — Vite/React, built and served as static files.
# In production you'd typically use Vercel instead (see DEPLOYMENT.md), but
# this lets you run the full stack with docker-compose for local dev/demo.

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS serve
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
