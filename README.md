# backend — NestJS RealWorld API
Задиплоино по адресу https://nest-real-world.onrender.com/

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
git clone https://github.com/lshishkin/nest-real-world.git
cd nest-real-world

# зависимости
npm install

# настройка .env
Создайте файл .env и заполните данными из файла .env.example

# миграции
npm run migration:generate
npm run migration:run

# запуск
npm run start
