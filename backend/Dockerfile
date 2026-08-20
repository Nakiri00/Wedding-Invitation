# syntax=docker/dockerfile:1.7

ARG NODE_IMAGE=node:22-bookworm-slim

FROM ${NODE_IMAGE} AS base
WORKDIR /app

ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

FROM base AS dependencies

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

FROM dependencies AS build

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# This target intentionally retains the Prisma CLI so Docker Compose can run
# production migrations before the API container starts.
FROM dependencies AS migrate

ENV NODE_ENV=production
CMD ["npx", "prisma", "migrate", "deploy"]

FROM build AS production-dependencies
RUN npm prune --omit=dev

FROM base AS runtime

ENV NODE_ENV=production \
    PORT=4000

COPY --chown=node:node --from=production-dependencies /app/package.json /app/package-lock.json ./
COPY --chown=node:node --from=production-dependencies /app/node_modules ./node_modules
COPY --chown=node:node --from=production-dependencies /app/prisma ./prisma
COPY --chown=node:node --from=build /app/dist ./dist

USER node

EXPOSE 4000

CMD ["node", "dist/src/server.js"]
