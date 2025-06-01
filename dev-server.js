const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 5000;

// Disable host checking completely
app.use((req, res, next) => {
  // Override all host-related headers
  req.headers.host = 'localhost:5000';
  delete req.headers['x-forwarded-host'];
  delete req.headers['x-forwarded-proto'];
  
  // Add CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist/public')));

// API routes
app.use('/api', (req, res) => {
  res.json({ message: 'API working' });
});

// Catch-all handler for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Development server running on port ${PORT}`);
});