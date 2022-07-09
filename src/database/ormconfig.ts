import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const connectionSource = new DataSource({
  type: 'postgres',
  host: 'readme-db.cnhsfzeymdfu.ap-northeast-2.rds.amazonaws.com',
  port: 5432,
  username: 'readme',
  password: 'flemaltjqj4$',
  database: 'postgres',
  entities: [__dirname + '/**/*.entity.{js,ts}'],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
  migrationsTableName: 'migrations',
  migrations: ['dist/migrations/*{.ts,.js}'],
});
