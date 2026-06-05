module.exports = {
  apps: [{
    name: 'sre-platform',
    script: '.next/standalone/server.js',
    cwd: '/home/z/my-project/workspace-extract',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0',
      DATABASE_URL: 'file:/home/z/my-project/workspace-extract/db/custom.db',
      NEXTAUTH_SECRET: 'sre-platform-prod-secret-change-in-production',
      NEXTAUTH_URL: 'http://localhost:3000',
    },
    instances: 1,
    autorestart: true,
    max_memory_restart: '512M',
    error_file: '/home/z/my-project/workspace-extract/logs/error.log',
    out_file: '/home/z/my-project/workspace-extract/logs/out.log',
    time: true,
  }]
};
