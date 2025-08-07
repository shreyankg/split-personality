const express = require('express');
const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

console.log('Starting simple server...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', PORT);

// Middleware for all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health checks - multiple endpoints
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/healthz', (req, res) => {
  console.log('Healthz check requested');
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  console.log('Root path requested');
  res.send('<h1>Split Personality is running!</h1><p>Health: <a href="/health">/health</a></p>');
});

// Catch all errors
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Server Error');
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Simple server running on port ${PORT}`);
  console.log(`✅ Server bound to: 0.0.0.0:${PORT}`);
  console.log(`✅ Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`✅ Ready to receive requests!`);
});

server.on('error', (err) => {
  console.error('❌ Server failed to start:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});