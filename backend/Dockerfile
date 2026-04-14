FROM node:20-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json ./
COPY scripts ./scripts
COPY src ./src
RUN npm install && npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY scripts ./scripts
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
RUN chmod +x ./scripts/start.sh
EXPOSE 5000
CMD ["./scripts/start.sh"]