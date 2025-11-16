require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔗 Testing Alternative MongoDB Connection Methods...');

// Alternative connection strings to try
const connectionStrings = [
  // Original SRV format
  'mongodb+srv://shahkrishil1108:heIRYfBzaeVXS60y@cluster0.wmqufd.mongodb.net/quotebill-pro?retryWrites=true&w=majority',
  
  // Try without SRV (standard format) - we need to find the actual IP/hostname
  // This would need the actual server addresses from Atlas
];

async function testConnections() {
  for (let i = 0; i < connectionStrings.length; i++) {
    const uri = connectionStrings[i];
    console.log(`\n📡 Testing connection method ${i + 1}:`);
    console.log('Format:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });
      
      console.log('✅ Connection successful!');
      
      // Test a simple operation
      const adminDb = mongoose.connection.db.admin();
      const result = await adminDb.ping();
      console.log('✅ Database ping successful:', result);
      
      await mongoose.disconnect();
      console.log('✅ Test completed successfully');
      return;
      
    } catch (error) {
      console.log('❌ Connection failed:', error.message);
      
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    }
  }
  
  console.log('\n🚨 All connection methods failed');
  console.log('\n💡 Possible solutions:');
  console.log('1. Try connecting from a different network (mobile hotspot)');
  console.log('2. Check if your corporate/home firewall blocks MongoDB connections');
  console.log('3. Try using MongoDB Compass with the same connection string');
  console.log('4. Contact your network administrator about DNS resolution');
  console.log('5. Try using Google DNS: Set DNS to 8.8.8.8 and 8.8.4.4');
}

testConnections().catch(console.error);