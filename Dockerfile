# Reproducible build + test environment for the library.
# Usage: docker build -t bangla-i18n . && docker run --rm bangla-i18n
FROM node:18-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM base AS build
COPY . .
RUN npm run lint && npm test && npm run build

FROM node:18-alpine AS pack
WORKDIR /app
COPY --from=build /app/package.json /app/README.md /app/LICENSE /app/CHANGELOG.md ./
COPY --from=build /app/dist ./dist
CMD ["node", "-e", "const b = require('./dist/index.cjs'); console.log(b.formatBDT(123456.78, { locale: 'bn' }), b.formatDate(new Date(), 'D MMMM YYYY', { locale: 'bn' }));"]
