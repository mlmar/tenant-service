FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
RUN npm ci

FROM dependencies AS development
COPY . .

FROM development AS build
ARG EXPO_PUBLIC_API_URL=/api
ARG EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=$EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=8080 STATIC_DIRECTORY=/app/frontend/dist
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
RUN npm ci --omit=dev --workspace backend
COPY brand.json ./brand.json
COPY frontend/src/branding/tokens.json ./frontend/src/branding/tokens.json
COPY --from=build /app/backend/dist ./backend/dist
COPY backend/certs ./backend/certs
COPY --from=build /app/frontend/dist ./frontend/dist
USER node
EXPOSE 8080
CMD ["node", "backend/dist/server.js"]
