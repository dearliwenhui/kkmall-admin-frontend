FROM node:20-alpine AS build-stage

WORKDIR /app
RUN corepack enable
# Keep the package manager version aligned with the lockfile and CI behavior.
RUN corepack prepare pnpm@10.28.2 --activate

RUN npm config set registry https://registry.npmmirror.com

COPY .npmrc package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:stable-alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
