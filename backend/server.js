const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// MongoDB connection with fallback
async function connectToDatabase() {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quotebill');
    console.log('✅ Connected to MongoDB Atlas successfully!');
  } catch (error) {
    console.log('⚠️  MongoDB Atlas connection failed:', error.message);
    console.log('Falling back to local MongoDB...');
    
    try {
      await mongoose.connect('mongodb://localhost:27017/quotebill');
      console.log('✅ Connected to local MongoDB successfully!');
    } catch (localError) {
      console.error('❌ Both Atlas and local MongoDB connections failed.');
      console.error('Atlas error:', error.message);
      console.error('Local error:', localError.message);
      console.log('\n📝 To fix this:');
      console.log('1. Check your MongoDB Atlas credentials and IP whitelist');
      console.log('2. Or install MongoDB locally');
      console.log('3. Or update the connection string in .env file');
      // Don't exit the process, let it continue without DB
    }
  }
}

// Initialize database connection
connectToDatabase();

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB connection error:', error.message);
});
db.once('open', () => {
  console.log('📊 Database connection established and ready for operations');
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

// Document Schema
const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['quote', 'bill'],
    required: true
  },
  documentNumber: {
    type: String,
    unique: true
    // Remove required: true since we'll generate it in pre-save hook
  },
  clientInfo: {
    name: { type: String, required: true },
    address: String,
    phone: String,
    email: String
  },
  items: [{
    particular: { type: String, required: true },
    unit: { type: String, default: 'pcs' },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'cancelled'],
    default: 'pending'
  },
  letterhead: {
    firmName: String,
    address: String,
    tagline: String,
    logo: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-increment document number
documentSchema.pre('save', async function(next) {
  if (this.isNew && !this.documentNumber) {
    try {
      const prefix = this.type === 'quote' ? 'Q' : 'B';
      const lastDoc = await this.constructor.findOne(
        { type: this.type },
        {},
        { sort: { 'createdAt': -1 } }
      );
      
      let nextNumber = 1;
      if (lastDoc && lastDoc.documentNumber) {
        const lastNumber = parseInt(lastDoc.documentNumber.slice(1));
        nextNumber = lastNumber + 1;
      }
      
      this.documentNumber = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  
  this.updatedAt = new Date();
  next();
});

const Document = mongoose.model('Document', documentSchema);

// Settings Schema
const settingsSchema = new mongoose.Schema({
  letterhead: {
    firmName: { type: String, default: 'Your Company Name' },
    address: { type: String, default: 'Your Company Address' },
    tagline: { type: String, default: 'Your Company Tagline' },
    logo: String
  },
  particulars: [String],
  units: [String],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Settings = mongoose.model('Settings', settingsSchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Routes

// Get all documents
app.get('/api/documents', async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    const documents = await Document.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Document.countDocuments(filter);
    
    res.json({
      documents,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single document
app.get('/api/documents/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new document
app.post('/api/documents', async (req, res) => {
  try {
    const { type, clientInfo, items, letterhead } = req.body;
    
    // Validate required fields
    if (!type || !clientInfo || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: type, clientInfo, and items are required' });
    }

    if (!clientInfo.name) {
      return res.status(400).json({ error: 'Client name is required' });
    }

    // Validate and process items
    const processedItems = items.map(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const amount = quantity * rate;
      
      if (!item.particular) {
        throw new Error('Item particular is required');
      }
      
      return {
        particular: item.particular,
        unit: item.unit || 'pcs',
        quantity,
        rate,
        amount
      };
    });
    
    // Calculate total amount
    const totalAmount = processedItems.reduce((sum, item) => sum + item.amount, 0);
    
    const document = new Document({
      type,
      clientInfo: {
        name: clientInfo.name,
        address: clientInfo.address || '',
        phone: clientInfo.phone || '',
        email: clientInfo.email || ''
      },
      items: processedItems,
      totalAmount,
      letterhead: letterhead || {}
    });
    
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    if (error.code === 11000) {
      // Duplicate key error - retry with next number
      try {
        const { type, clientInfo, items, letterhead } = req.body;
        const processedItems = items.map(item => ({
          particular: item.particular,
          unit: item.unit || 'pcs',
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
          amount: (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)
        }));
        
        const totalAmount = processedItems.reduce((sum, item) => sum + item.amount, 0);
        
        const document = new Document({
          type,
          clientInfo,
          items: processedItems,
          totalAmount,
          letterhead: letterhead || {}
        });
        
        await document.save();
        res.status(201).json(document);
      } catch (retryError) {
        res.status(400).json({ error: 'Failed to create document: ' + retryError.message });
      }
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Update document
app.put('/api/documents/:id', async (req, res) => {
  try {
    const { clientInfo, items, status, letterhead } = req.body;
    
    const updateData = {};
    if (clientInfo) updateData.clientInfo = clientInfo;
    if (items) {
      updateData.items = items;
      updateData.totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    }
    if (status) updateData.status = status;
    if (letterhead) updateData.letterhead = letterhead;
    
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete document
app.delete('/api/documents/:id', async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate PDF
// Enhanced PDF generation route with beautiful letterhead
app.get('/api/documents/:id/pdf', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Get settings for default letterhead if document doesn't have one
    let settings = await Settings.findOne();
    const letterhead = {
      ...settings?.letterhead,
      ...document.letterhead
    };

    // Create PDF with better styling
    const doc = new PDFDocument({
      margin: 40,
      size: 'A4'
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${document.documentNumber}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Helper function to draw a line
    const drawLine = (x1, y1, x2, y2, color = '#e5e7eb', width = 1) => {
      doc.strokeColor(color)
         .lineWidth(width)
         .moveTo(x1, y1)
         .lineTo(x2, y2)
         .stroke();
    };

    // Helper function to draw a rectangle
    const drawRect = (x, y, width, height, fillColor, strokeColor = null) => {
      if (fillColor) {
        doc.rect(x, y, width, height).fillColor(fillColor).fill();
      }
      if (strokeColor) {
        doc.rect(x, y, width, height).strokeColor(strokeColor).stroke();
      }
    };

    // Page dimensions
    const pageWidth = 515; // A4 width minus margins
    const pageHeight = 750; // A4 height minus margins

    // HEADER SECTION with gradient-like effect
    drawRect(40, 40, pageWidth, 100, '#f8fafc');
    drawRect(40, 40, pageWidth, 4, '#3b82f6'); // Top blue bar

    // Logo (if available)
    let logoWidth = 0;
    if (letterhead.logo) {
      try {
        const logoPath = path.join(__dirname, letterhead.logo);
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 60, 55, { 
            fit: [80, 70],
            align: 'center',
            valign: 'center'
          });
          logoWidth = 100; // Reserve space for logo
        }
      } catch (logoError) {
        console.log('Logo loading error:', logoError);
      }
    }

    // Company Name
    doc.fontSize(24)
       .fillColor('#1e293b')
       .font('Helvetica-Bold')
       .text(letterhead.firmName || 'Your Company Name', 60 + logoWidth, 60, {
         width: pageWidth - logoWidth - 40
       });

    // Company Address
    if (letterhead.address) {
      doc.fontSize(11)
         .fillColor('#64748b')
         .font('Helvetica')
         .text(letterhead.address, 60 + logoWidth, 90, {
           width: pageWidth - logoWidth - 40
         });
    }

    // Company Tagline
    if (letterhead.tagline) {
      doc.fontSize(10)
         .fillColor('#3b82f6')
         .font('Helvetica-Oblique')
         .text(letterhead.tagline, 60 + logoWidth, 110, {
           width: pageWidth - logoWidth - 40
         });
    }

    // DOCUMENT INFO SECTION
    const docInfoY = 170;
    
    // Document type badge
    const docType = document.type.toUpperCase();
    const badgeColor = document.type === 'quote' ? '#059669' : '#dc2626';
    
    drawRect(40, docInfoY, 100, 25, badgeColor);
    doc.fontSize(14)
       .fillColor('white')
       .font('Helvetica-Bold')
       .text(docType, 45, docInfoY + 6);

    // Document number and date in a clean box
    drawRect(400, docInfoY, 155, 50, '#f1f5f9', '#e2e8f0');
    
    doc.fontSize(10)
       .fillColor('#64748b')
       .font('Helvetica')
       .text('Document No:', 410, docInfoY + 8);
    
    doc.fontSize(12)
       .fillColor('#1e293b')
       .font('Helvetica-Bold')
       .text(document.documentNumber, 410, docInfoY + 22);
    
    doc.fontSize(10)
       .fillColor('#64748b')
       .font('Helvetica')
       .text('Date:', 480, docInfoY + 8);
    
    doc.fontSize(11)
       .fillColor('#1e293b')
       .font('Helvetica')
       .text(document.createdAt.toLocaleDateString('en-IN'), 480, docInfoY + 22);

    // Status badge (if not pending)
    if (document.status !== 'pending') {
      const statusColors = {
        'approved': '#059669',
        'paid': '#16a34a',
        'cancelled': '#dc2626'
      };
      const statusColor = statusColors[document.status] || '#6b7280';
      
      drawRect(150, docInfoY, 80, 25, statusColor);
      doc.fontSize(11)
         .fillColor('white')
         .font('Helvetica-Bold')
         .text(document.status.toUpperCase(), 155, docInfoY + 7);
    }

    // CLIENT INFORMATION SECTION
    const clientY = 250;
    
    // "Bill To" header with underline
    doc.fontSize(14)
       .fillColor('#1e293b')
       .font('Helvetica-Bold')
       .text('BILL TO', 40, clientY);
    
    drawLine(40, clientY + 18, 120, clientY + 18, '#3b82f6', 2);

    // Client details in a clean layout
    let currentY = clientY + 35;
    
    doc.fontSize(13)
       .fillColor('#1e293b')
       .font('Helvetica-Bold')
       .text(document.clientInfo.name, 40, currentY);
    
    currentY += 20;
    
    if (document.clientInfo.address) {
      doc.fontSize(11)
         .fillColor('#64748b')
         .font('Helvetica')
         .text(document.clientInfo.address, 40, currentY);
      currentY += 15;
    }
    
    // Phone and Email in same line if both exist
    if (document.clientInfo.phone || document.clientInfo.email) {
      let contactText = '';
      if (document.clientInfo.phone) {
        contactText = `📞 ${document.clientInfo.phone}`;
      }
      if (document.clientInfo.email) {
        if (contactText) contactText += '   ';
        contactText += `✉ ${document.clientInfo.email}`;
      }
      
      doc.fontSize(10)
         .fillColor('#64748b')
         .font('Helvetica')
         .text(contactText, 40, currentY);
      currentY += 15;
    }

    // ITEMS TABLE
    const tableY = currentY + 30;
    const tableHeight = 25;
    
    // Table header with gradient effect
    drawRect(40, tableY, pageWidth, tableHeight, '#3b82f6');
    
    const colWidths = [250, 80, 80, 105];
    const colPositions = [50, 300, 380, 460];
    const headers = ['PARTICULARS', 'QTY', 'RATE', 'AMOUNT'];
    
    doc.fontSize(11)
       .fillColor('white')
       .font('Helvetica-Bold');
    
    headers.forEach((header, i) => {
      doc.text(header, colPositions[i], tableY + 8, {
        width: colWidths[i] - 10,
        align: i === 0 ? 'left' : 'center'
      });
    });

    // Table rows with alternating colors
    let rowY = tableY + tableHeight;
    document.items.forEach((item, index) => {
      if (rowY > 650) { // New page if needed
        doc.addPage();
        rowY = 60;
      }

      // Alternating row colors
      const rowColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
      drawRect(40, rowY, pageWidth, 22, rowColor);

      doc.fontSize(10)
         .fillColor('#1e293b')
         .font('Helvetica');

      // Particular
      doc.text(item.particular, colPositions[0], rowY + 6, {
        width: colWidths[0] - 10
      });

      // Quantity with unit
      doc.text(`${item.quantity} ${item.unit}`, colPositions[1], rowY + 6, {
        width: colWidths[1] - 10,
        align: 'center'
      });

      // Rate
      doc.text(`Rs ${Number(item.rate).toFixed(2)}`, colPositions[2], rowY + 6, {
        width: colWidths[2] - 10,
        align: 'center'
      });

      // Amount
      doc.font('Helvetica-Bold')
         .text(`Rs ${Number(item.amount).toFixed(2)}`, colPositions[3], rowY + 6, {
           width: colWidths[3] - 10,
           align: 'center'
         });

      rowY += 22;
    });

    // Table border
    drawLine(40, tableY, 555, tableY, '#3b82f6', 2);
    drawLine(40, rowY, 555, rowY, '#e5e7eb', 1);

    // TOTAL SECTION
    const totalY = rowY + 20;
    
    // Total box with shadow effect
    drawRect(350, totalY, 205, 60, '#f8fafc', '#e2e8f0');
    drawRect(352, totalY + 2, 205, 60, '#ffffff');
    
    // Subtotal (if you want to add tax later)
    doc.fontSize(11)
       .fillColor('#64748b')
       .font('Helvetica')
       .text('Subtotal:', 365, totalY + 15);
    
    doc.text(`Rs ${Number(document.totalAmount).toFixed(2)}`, 460, totalY + 15, {
      align: 'right',
      width: 80
    });

    // Total amount
    drawLine(365, totalY + 35, 535, totalY + 35, '#3b82f6', 1);
    
    doc.fontSize(14)
       .fillColor('#1e293b')
       .font('Helvetica-Bold')
       .text('TOTAL:', 365, totalY + 42);
    
    doc.fontSize(16)
       .fillColor('#3b82f6')
       .text(`Rs ${Number(document.totalAmount).toFixed(2)}`, 460, totalY + 40, {
         align: 'right',
         width: 80
       });

    // FOOTER SECTION
    const footerY = 720;
    
    // Footer line
    drawLine(40, footerY, 555, footerY, '#e5e7eb', 1);
    
    // Footer content
    if (letterhead.tagline) {
      doc.fontSize(9)
         .fillColor('#64748b')
         .font('Helvetica-Oblique')
         .text(letterhead.tagline, 40, footerY + 10, {
           align: 'center',
           width: pageWidth
         });
    }

    // Generated timestamp
    doc.fontSize(8)
       .fillColor('#9ca3af')
       .font('Helvetica')
       .text(`Generated on ${new Date().toLocaleString('en-IN')}`, 40, footerY + 25, {
         align: 'center',
         width: pageWidth
       });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF: ' + error.message });
  }
});

// Settings routes
// Get settings
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        letterhead: {
          firmName: 'Your Company Name',
          address: 'Your Company Address',
          tagline: 'Your Company Tagline'
        },
        particulars: ['Product A', 'Product B', 'Service X', 'Service Y', 'Consultation', 'Installation'],
        units: ['pcs', 'nos', 'meters', 'sets', 'approx', 'feet', 'points']
      });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update settings
app.put('/api/settings', async (req, res) => {
  try {
    const { letterhead, particulars, units } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    if (letterhead) settings.letterhead = { ...settings.letterhead, ...letterhead };
    if (particulars) settings.particulars = particulars;
    if (units) settings.units = units;
    
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Upload logo
app.post('/api/settings/logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    // Delete old logo if exists
    if (settings.letterhead.logo) {
      const oldLogoPath = path.join(__dirname, settings.letterhead.logo);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }
    
    settings.letterhead.logo = `/uploads/${req.file.filename}`;
    await settings.save();
    
    res.json({ 
      message: 'Logo uploaded successfully',
      logoUrl: settings.letterhead.logo 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalQuotes = await Document.countDocuments({ type: 'quote' });
    const totalBills = await Document.countDocuments({ type: 'bill' });
    const pendingQuotes = await Document.countDocuments({ type: 'quote', status: 'pending' });
    const paidBills = await Document.countDocuments({ type: 'bill', status: 'paid' });
    
    const totalRevenue = await Document.aggregate([
      { $match: { type: 'bill', status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const pendingRevenue = await Document.aggregate([
      { $match: { type: 'bill', status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    res.json({
      totalQuotes,
      totalBills,
      pendingQuotes,
      paidBills,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingRevenue: pendingRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large' });
    }
  }
  res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});