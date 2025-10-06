FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json ./
RUN corepack enable && corepack prepare pnpm@9.7.0 --activate && pnpm install
COPY src ./src
RUN pnpm build
CMD ["node", "dist/index.js"]


