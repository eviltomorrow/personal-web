FROM --platform=$BUILDPLATFORM node:20-alpine AS builder
WORKDIR /personal-web
ARG APPNAME=unknown
ARG MAINVERSION=unknown
ARG GITSHA=unknown
ARG BUILDTIME=unknown
ENV APPNAME=${APPNAME} \
    MAINVERSION=${MAINVERSION} \
    GITSHA=${GITSHA} \
    BUILDTIME=${BUILDTIME}
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM --platform=$BUILDPLATFORM node:20-alpine AS prod
WORKDIR /app
ARG APPNAME=unknown
ENV APPNAME=${APPNAME} \
    API_HOST=http://personal-api:8080
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /personal-web/public ./public
COPY --from=builder --chown=nextjs:nodejs /personal-web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /personal-web/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
