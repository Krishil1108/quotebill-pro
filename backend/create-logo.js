const { createCanvas } = require('canvas');
const fs = require('fs');

console.log('Attempting to create canvas-based logo...');

// First check if canvas is available
try {
  // Create a 100x80 canvas
  const canvas = createCanvas(100, 80);
  const ctx = canvas.getContext('2d');

  // Set background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 100, 80);

  // Draw a simple logo shape (circle)
  ctx.fillStyle = '#2563eb'; // Blue color
  ctx.beginPath();
  ctx.arc(50, 40, 25, 0, 2 * Math.PI);
  ctx.fill();

  // Add text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SBS', 50, 45);

  // Convert to PNG buffer
  const buffer = canvas.toBuffer('image/png');
  
  // Convert to base64
  const base64 = 'data:image/png;base64,' + buffer.toString('base64');
  
  console.log('Canvas logo created successfully');
  console.log('Base64 length:', base64.length);
  console.log('Base64 starts with:', base64.substring(0, 50));
  
  // Save the base64 to a file for use
  fs.writeFileSync('./new-logo-base64.txt', base64);
  console.log('Base64 data saved to new-logo-base64.txt');
  
} catch (error) {
  console.error('Canvas not available:', error.message);
  console.log('Falling back to simpler approach...');
  
  // Use a simple geometric pattern in base64 (a small blue square)
  const simpleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  
  console.log('Using simple fallback logo');
  fs.writeFileSync('./new-logo-base64.txt', simpleBase64);
  console.log('Simple base64 data saved to new-logo-base64.txt');
}
