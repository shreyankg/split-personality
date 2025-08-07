#!/usr/bin/env node

// Simple startup script for Railway deployment
const path = require('path');
const fs = require('fs');

// Check if the compiled backend exists
const backendPath = path.join(__dirname, 'backend', 'dist', 'index.js');

console.log('Checking for backend at:', backendPath);
console.log('Backend exists:', fs.existsSync(backendPath));

if (!fs.existsSync(backendPath)) {
  console.error('Backend dist/index.js not found!');
  console.log('Current directory contents:');
  console.log(fs.readdirSync(__dirname));
  
  if (fs.existsSync(path.join(__dirname, 'backend'))) {
    console.log('Backend directory contents:');
    console.log(fs.readdirSync(path.join(__dirname, 'backend')));
  }
  
  process.exit(1);
}

// Start the backend server
require(backendPath);