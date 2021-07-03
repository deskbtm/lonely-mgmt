module.exports = {
  apps: [
    {
      name: 'xxxxxxxxxxxxx',
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
      key: '/C/Users/xxxxxxxxxxxxx/.ssh/id_rsa',
      user: 'root',
      host: ['xxxxxxxxxxxxx'],
      ref: 'origin/master',
      repo: 'xxxxxxxxxxxxx',
      ssh_options: 'StrictHostKeyChecking=no',
      path: '/var/www/xxxxxxxxxxxxx',
      'post-setup': 'npm install',
      'post-deploy':
        'npm install && npm run build && npm run migration:generate && pm2 startOrReload ecosystem.config.js --env production',
    },
  },
};
