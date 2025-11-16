// MongoDB Connection String Generator
// Run this after getting your cluster details from MongoDB Atlas

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 MongoDB Connection String Generator');
console.log('=====================================\n');

console.log('Please log into your MongoDB Atlas dashboard and find:');
console.log('1. Your exact cluster name (from Database → Connect → Connection String)');
console.log('2. Verify your cluster is running\n');

rl.question('Enter your exact cluster hostname (e.g., cluster0.abc123.mongodb.net): ', (clusterHost) => {
  if (!clusterHost.trim()) {
    console.log('❌ Cluster hostname is required');
    rl.close();
    return;
  }

  const username = 'shahkrishil1108';
  const password = 'Pops%23100'; // URL encoded
  const database = 'quotebill-pro';
  
  const connectionString = `mongodb+srv://${username}:${password}@${clusterHost}/${database}?retryWrites=true&w=majority`;
  
  console.log('\n✅ Generated Connection String:');
  console.log('================================');
  console.log(connectionString);
  
  console.log('\n📝 Next Steps:');
  console.log('1. Update backend/.env file with this connection string');
  console.log('2. Update Render dashboard environment variable');
  console.log('3. Test connection with: node test-connection.js');
  console.log('4. Commit and push changes');
  
  console.log('\n🔗 For Render Dashboard:');
  console.log('Key: MONGO_URI');
  console.log('Value: ' + connectionString);
  
  rl.close();
});