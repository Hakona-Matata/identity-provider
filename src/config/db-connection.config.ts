import { EnvironmentType } from '../shared/constants';

export const dbConnectionSettings = {
  entities: ['**/*.entity.js'],
  synchronize: true,
};

switch (process.env.NODE_ENV) {
  case EnvironmentType.DEVELOPMENT:
    Object.assign(dbConnectionSettings, {
      type: 'sqlite',
      database: 'dev.sqlite',
    });
    break;

  case EnvironmentType.TEST:
    Object.assign(dbConnectionSettings, {
      type: 'sqlite',
      database: 'test.sqlite',
      entities: ['**/*.entity.ts'],
    });
    break;

  case EnvironmentType.PRODUCTION:
    Object.assign(dbConnectionSettings, {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: false,
    });
    break;

  default:
    throw new Error('Unknown Environment!');
}
