require('dotenv').config();
const mongoose = require('mongoose');

async function testNewConnection() {
  try {
    console.log('🧪 Testing New MongoDB Atlas Connection...');
    console.log('Connection String:', process.env.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    // Test database operations
    const testCollection = mongoose.connection.db.collection('test');
    const result = await testCollection.insertOne({ 
      test: 'connection', 
      timestamp: new Date(),
      message: 'Migration to new cluster successful!'
    });
    
    console.log('✅ Database write test successful:', result.insertedId);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Database cleanup successful');
    
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

testNewConnection();