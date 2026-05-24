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
ENV APPNAME=${APPNAME}
COPY --from=builder /personal-web/.next ./.next
COPY --from=builder /personal-web/public ./public
COPY --from=builder /personal-web/package*.json ./
COPY --from=builder /personal-web/node_modules ./node_modules
EXPOSE 3000
ENTRYPOINT ["npm", "start"]
