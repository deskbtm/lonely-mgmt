module.exports = {
  apps: [
    {
      name: 'app-mgmt',
      script: './dist/main.js',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 1031,
      },
    },
  ],
  deploy: {
    production: {
      key: '',
      user: 'root',
      host: [''],
      ref: '',
      repo: '',
      ssh_options: 'StrictHostKeyChecking=no',
      path: '',
      'post-setup': 'npm install',
      'post-deploy':
        'npm install && npm run build && pm2 npm run migration:generate && startOrReload ecosystem.config.js --env production',
    },
  },
};
