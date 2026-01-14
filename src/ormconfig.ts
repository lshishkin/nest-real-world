import { DataSource, DataSourceOptions } from 'typeorm';
import {config} from 'dotenv';

config(); // Загружаем переменные окружения из .env файла
console.log('DB_HOST:', process.env.DB_HOST);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT as unknown as number || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  // logging: true, // если нужно для дебага
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;

