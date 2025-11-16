const dns = require('dns').promises;

async function testDNS() {
  console.log('🔍 Testing DNS Resolution for MongoDB Atlas...');
  
  const hostnames = [
    'cluster0.wmqufd.mongodb.net',
    'mongodb.net',
    'google.com', // Control test
    '_mongodb._tcp.cluster0.wmqufd.mongodb.net'
  ];
  
  for (const hostname of hostnames) {
    try {
      console.log(`\nTesting: ${hostname}`);
      const result = await dns.lookup(hostname);
      console.log(`✅ Resolved: ${JSON.stringify(result)}`);
    } catch (error) {
      console.log(`❌ Failed: ${error.code} - ${error.message}`);
    }
  }
  
  // Test SRV record specifically
  try {
    console.log('\n🔍 Testing SRV record...');
    const srvResult = await dns.resolveSrv('_mongodb._tcp.cluster0.wmqufd.mongodb.net');
    console.log('✅ SRV Record found:', JSON.stringify(srvResult, null, 2));
  } catch (error) {
    console.log('❌ SRV lookup failed:', error.code, error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 This suggests either:');
      console.log('1. The cluster hostname is incorrect');
      console.log('2. Your network/DNS server cannot resolve MongoDB Atlas');
      console.log('3. The cluster might be paused or deleted');
      console.log('\n🔧 Try these solutions:');
      console.log('1. Check if you can access MongoDB Atlas from your browser');
      console.log('2. Try using a different DNS server (8.8.8.8)');
      console.log('3. Verify the exact hostname from Atlas Connect dialog');
    }
  }
}

testDNS();