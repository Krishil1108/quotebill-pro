const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quotebill');

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

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Check if settings already exist
    const existingSettings = await Settings.findOne();
    
    if (!existingSettings) {
      console.log('Creating default settings...');
      
      const defaultSettings = new Settings({
        letterhead: {
          firmName: 'Your Company Name',
          address: 'Your Company Address\nCity, State - PIN Code\nCountry',
          tagline: 'Your Company Tagline'
        },
        particulars: [
          'Product A',
          'Product B', 
          'Service X',
          'Service Y',
          'Consultation',
          'Installation',
          'Maintenance',
          'Training',
          'Support',
          'Development'
        ],
        units: [
          'pcs',
          'nos', 
          'meters',
          'kg',
          'liters',
          'boxes',
          'sets',
          'hours',
          'days',
          'months'
        ]
      });
      
      await defaultSettings.save();
      console.log('✅ Default settings created successfully');
    } else {
      console.log('✅ Settings already exist');
    }
    
    // Test document creation (optional)
    const Document = mongoose.model('Document', new mongoose.Schema({
      type: { type: String, enum: ['quote', 'bill'], required: true },
      documentNumber: { type: String, unique: true },
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
      totalAmount: { type: Number, required: true },
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
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }));
    
    console.log('✅ Database initialization completed successfully');
    console.log('📊 Database is ready for QuoteBill Pro');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run initialization
initializeDatabase();