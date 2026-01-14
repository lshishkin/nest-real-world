# ------------------- Stage 1: builder -------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Копируем только файлы зависимостей → отличный кэш
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci

# Копируем весь код
COPY . .

# Собираем приложение
RUN npm run build

# ------------------- Stage 2: production -------------------
FROM node:22-alpine AS production

WORKDIR /app

# Копируем только то, что нужно для запуска
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Можно добавить prisma, если используете
# COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main"]
