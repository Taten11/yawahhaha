// Simple test script to check server connectivity
const fetch = require('node-fetch');

async function testServer() {
    console.log('🧪 Testing EARNLANG server...\n');
    
    const baseUrl = 'http://localhost:5000';
    
    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${baseUrl}/api/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
        
        // Test main page
        console.log('\n2. Testing main page...');
        const mainResponse = await fetch(`${baseUrl}/`);
        console.log('✅ Main page status:', mainResponse.status);
        
        // Test admin page
        console.log('\n3. Testing admin page...');
        const adminResponse = await fetch(`${baseUrl}/admin`);
        console.log('✅ Admin page status:', adminResponse.status);
        
        console.log('\n🎉 All tests passed! Server is working correctly.');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Make sure the server is running: npm start');
        console.log('2. Check if MongoDB is running');
        console.log('3. Verify the server is on port 5000');
        console.log('4. Check browser console for CORS errors');
        console.log('5. Start MongoDB:');
        console.log('   # Windows');
        console.log('   net start MongoDB');
        console.log('   # macOS/Linux');
        console.log('   sudo systemctl start mongod');
        console.log('6. Test the health endpoint:');
        console.log('   curl http://localhost:5000/api/health');
    }
}

// Run test if this file is executed directly
if (require.main === module) {
    testServer();
}

module.exports = { testServer }; 