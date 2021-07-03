function config() {
  switch (process.env.NODE_ENV) {
    case 'development':
      return {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'dev123456',
        database: 'app-mgmt-dev',
        entities: ['dist/**/*.entity.{js,ts}'],
        synchronize: true,
      };
    case 'production':
      return {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'xxxxxxxxxxxxx',
        database: 'xxxxxxxxxxxxxx',
        entities: ['dist/**/*.entity.{js,ts}'],
        synchronize: false,
        migrationsTableName: 'xxxxxxxxxxxxx',
        migrations: ['dist/migration/*.js'],
        migrationsRun: true,
        cli: {
          migrationsDir: 'src/migration',
        },
      };
    default:
      throw new Error('not suitable NODE_ENV');
  }
}

module.exports = config();
