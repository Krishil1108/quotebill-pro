const dns = require('dns');
const { promisify } = require('util');

const resolveSrv = promisify(dns.resolveSrv);

async function findMongoCluster() {
  console.log('🔍 Searching for MongoDB Atlas clusters...\n');
  
  // Common cluster subdomains to test
  const subdomains = [
    '9qcxh', 'abcde', 'xyz123', 'cluster0', 'mongodb',
    '1a2b3', 'def45', 'ghi67', '12345', 'abc12'
  ];
  
  for (const subdomain of subdomains) {
    const hostname = `_mongodb._tcp.cluster0.${subdomain}.mongodb.net`;
    
    try {
      console.log(`🔍 Checking: cluster0.${subdomain}.mongodb.net`);
      const records = await resolveSrv(hostname);
      
      if (records && records.length > 0) {
        console.log(`✅ FOUND CLUSTER: cluster0.${subdomain}.mongodb.net`);
        console.log('SRV Records:', records);
        
        const connectionString = `mongodb+srv://shahkrishil1108:Pops%23100@cluster0.${subdomain}.mongodb.net/quotebill?retryWrites=true&w=majority`;
        console.log('\n🎯 Use this connection string:');
        console.log(connectionString);
        return connectionString;
      }
    } catch (error) {
      console.log(`❌ Not found: cluster0.${subdomain}.mongodb.net`);
    }
  }
  
  console.log('\n🚨 Could not find any MongoDB Atlas clusters.');
  console.log('📋 This could mean:');
  console.log('1. The cluster is paused or deleted');
  console.log('2. The cluster has a different naming pattern');
  console.log('3. Network connectivity issues');
  console.log('\n💡 Solution:');
  console.log('Go to https://cloud.mongodb.com and:');
  console.log('1. Check if your cluster is running');
  console.log('2. Click "Connect" → "Connect your application"');
  console.log('3. Copy the exact connection string');
}

findMongoCluster();