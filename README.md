# backend — NestJS RealWorld API

Реализация бэкенда для **Medium.com**-клона по спецификации [RealWorld API](https://github.com/gothinkster/realworld)  
на **NestJS 11** + **TypeORM** + PostgreSQL.

Проект демонстрирует типичные реальные практики:
- модульная структура
- кастомные декораторы / пайпы / guards
- обработка ошибок (Exception Filter)
- хэширование паролей (bcrypt)
- Аутентификация
- миграции TypeORM
- slug для статей
- валидация входных данных (class-validator + class-transformer)

**Стек:**
- NestJS ^11
- TypeORM + pg
- jsonwebtoken + bcrypt
- class-validator & class-transformer
- eslint + prettier

**Быстрый старт**

```bash
# клонируем
git clone https://github.com/твой-username/backend.git
cd backend

# зависимости
npm install

# миграции
npm run migration:generate
npm run migration:run

# запуск
npm run start
