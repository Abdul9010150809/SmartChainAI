FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json tsconfig.node.json vite.config.ts tailwind.config.js postcss.config.js index.html ./
COPY scripts ./scripts
COPY src ./src
RUN npm install
RUN chmod +x ./scripts/start.sh
EXPOSE 5173
CMD ["./scripts/start.sh"]