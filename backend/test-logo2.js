const PDFDocument = require('pdfkit');
const fs = require('fs');

const DEFAULT_LOGO = 'data:image/png;base64,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';

console.log('Testing logo generation...');

// Create a new PDF document
const doc = new PDFDocument();
const outputPath = './test-logo.pdf';

// Pipe the PDF to a file
doc.pipe(fs.createWriteStream(outputPath));

try {
  // Test DEFAULT_LOGO
  console.log('Logo length:', DEFAULT_LOGO.length);
  console.log('Logo starts with:', DEFAULT_LOGO.substring(0, 30));
  
  if (DEFAULT_LOGO.startsWith('data:image/')) {
    const base64Data = DEFAULT_LOGO.split(',')[1];
    console.log('Base64 data length:', base64Data.length);
    console.log('Base64 data starts with:', base64Data.substring(0, 30));
    
    const logoBuffer = Buffer.from(base64Data, 'base64');
    console.log('Buffer created, length:', logoBuffer.length);
    
    // Try to add the image to PDF
    doc.image(logoBuffer, 60, 55, { 
      fit: [80, 70],
      align: 'center',
      valign: 'center'
    });
    
    console.log('Logo added to PDF successfully');
  }
  
  // Add some text to see if PDF generates
  doc.fontSize(24).text('Test PDF with Logo', 60, 150);
  doc.fontSize(12).text('If you can see this, the PDF generation works.', 60, 200);
  doc.text('Check if logo appears above this text.', 60, 220);
  
} catch (error) {
  console.error('Error adding logo:', error);
}

// Finalize the PDF
doc.end();

console.log('PDF test file created:', outputPath);
