module.exports = {
  apps: [{
    name: 'myblog-backend',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git'],
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M'
  }]
};