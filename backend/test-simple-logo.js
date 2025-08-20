const PDFDocument = require('pdfkit');
const fs = require('fs');

// Simple 1x1 pixel PNG in base64 (red pixel)
const SIMPLE_LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

console.log('Testing simple logo generation...');

// Create a new PDF document
const doc = new PDFDocument();
const outputPath = './test-simple-logo.pdf';

// Pipe the PDF to a file
doc.pipe(fs.createWriteStream(outputPath));

try {
  if (SIMPLE_LOGO.startsWith('data:image/')) {
    const base64Data = SIMPLE_LOGO.split(',')[1];
    const logoBuffer = Buffer.from(base64Data, 'base64');
    console.log('Simple logo buffer length:', logoBuffer.length);
    
    // Try to add the image to PDF
    doc.image(logoBuffer, 60, 55, { 
      fit: [80, 70],
      align: 'center',
      valign: 'center'
    });
    
    console.log('Simple logo added to PDF successfully');
  }
  
  // Add some text to see if PDF generates
  doc.fontSize(24).text('Test PDF with Simple Logo', 60, 150);
  
} catch (error) {
  console.error('Error adding simple logo:', error);
}

// Finalize the PDF
doc.end();

console.log('Simple PDF test file created:', outputPath);
