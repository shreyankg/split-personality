const http = require('http');
const PORT = parseInt(process.env.PORT || '3001', 10);

console.log('🚀 Starting minimal HTTP server...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', PORT);

const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('User-Agent:', req.headers['user-agent']);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.url === '/health' || req.url === '/healthz') {
    console.log('✅ Health check successful');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', timestamp }));
    return;
  }

  if (req.url === '/') {
    console.log('✅ Root request successful');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>🎉 Split Personality is running!</h1><p>Health: <a href="/health">/health</a></p>');
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ HTTP server running on port ${PORT}`);
  console.log(`✅ Server bound to: 0.0.0.0:${PORT}`);
  console.log(`✅ Health endpoint: http://0.0.0.0:${PORT}/health`);
  console.log(`✅ Ready for Railway health checks!`);
});

server.on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});

// Keep the server alive
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});