const express = require('express');
const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Simple health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.send('<h1>Split Personality is running!</h1>');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/health`);
});