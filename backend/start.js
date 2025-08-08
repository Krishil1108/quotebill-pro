const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting QuoteBill Pro Backend Server...\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('⚠️  .env file not found. Creating from .env.example...');
  if (fs.existsSync('.env.example')) {
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ .env file created. Please update it with your configuration.\n');
  } else {
    console.log('❌ .env.example not found. Please create .env file manually.\n');
    process.exit(1);
  }
}

// Check if uploads directory exists
if (!fs.existsSync('uploads')) {
  console.log('📁 Creating uploads directory...');
  fs.mkdirSync('uploads');
  console.log('✅ Uploads directory created.\n');
}

// Initialize database
console.log('🗄️  Initializing database...');
const initDb = spawn('node', ['initDb.js'], { stdio: 'inherit' });

initDb.on('close', (code) => {
  if (code === 0) {
    console.log('\n🗄️  Database initialization completed.\n');
    
    // Start the server
    console.log('🌟 Starting Express server...\n');
    const server = spawn('node', ['server.js'], { stdio: 'inherit' });
    
    server.on('close', (serverCode) => {
      console.log(`\n🛑 Server stopped with code ${serverCode}`);
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      server.kill('SIGINT');
      process.exit(0);
    });
    
  } else {
    console.log(`\n❌ Database initialization failed with code ${code}`);
    process.exit(1);
  }
});

initDb.on('error', (error) => {
  console.error('❌ Failed to start database initialization:', error);
  process.exit(1);
});