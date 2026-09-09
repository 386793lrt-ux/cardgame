FROM node:24-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
RUN npm prune --omit=dev

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app /app
EXPOSE 3000
CMD ["node", "apps/server/dist/index.js"]
