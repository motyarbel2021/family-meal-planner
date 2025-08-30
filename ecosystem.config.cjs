// PM2 Configuration for Meal Planner App
module.exports = {
  apps: [
    {
      name: 'meal-planner',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=meal-planner-db --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false, // Disable PM2 file monitoring (wrangler has its own)
      instances: 1, // Development mode uses only one instance
      exec_mode: 'fork',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      max_restarts: 5,
      min_uptime: '10s'
    }
  ]
}