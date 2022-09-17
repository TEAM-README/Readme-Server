import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const connectionSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/**/*.entity.{js,ts}'],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: process.env.NODE_ENV === 'dev', // dev이면 synchronize = true, prod이면 synchronize = false
  migrations: ['dist/migrations/*{.ts,.js}'],
});
