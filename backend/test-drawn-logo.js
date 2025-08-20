const PDFDocument = require('pdfkit');
const fs = require('fs');

console.log('Creating a logo using PDFKit drawing...');

// Create a new PDF document
const doc = new PDFDocument();
const outputPath = './logo-drawing-test.pdf';

// Pipe the PDF to a file
doc.pipe(fs.createWriteStream(outputPath));

// Create a simple logo using PDFKit's drawing capabilities
function drawLogo(doc, x, y, width, height) {
  // Draw a simple company logo using shapes
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  // Draw outer circle (company border)
  doc.circle(centerX, centerY, Math.min(width, height) / 2 - 2)
     .stroke('#2563eb');
  
  // Draw inner elements - a stylized "E" for Electricals
  doc.fontSize(32)
     .fillColor('#2563eb')
     .text('E', centerX - 12, centerY - 16, {
       width: 24,
       align: 'center'
     });
     
  console.log('Logo drawn successfully');
}

try {
  // Test the logo drawing
  drawLogo(doc, 60, 55, 80, 70);
  
  // Add some text
  doc.fontSize(24)
     .fillColor('black')
     .text('Test PDF with Drawn Logo', 60, 150);
  
  doc.fontSize(12)
     .text('This logo is drawn using PDFKit shapes instead of base64 image.', 60, 200);
  
} catch (error) {
  console.error('Error drawing logo:', error);
}

// Finalize the PDF
doc.end();

console.log('Logo drawing test file created:', outputPath);
