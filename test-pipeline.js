// Test script for automation pipeline
require('dotenv').config({ path: '.env.local' });

const { DatabaseService } = require('./dist/lib/database.js');
const AutomationPipeline = require('./dist/lib/automationPipeline.js');

async function testPipeline() {
  console.log('🧪 Testing automation pipeline...');
  
  try {
    // Test database connection first
    const connected = await require('./dist/lib/database.js').testConnection();
    if (!connected) {
      console.error('❌ Database connection failed');
      return;
    }
    
    // Test the pipeline
    await AutomationPipeline.default.testPipeline();
    
  } catch (error) {
    console.error('❌ Pipeline test failed:', error);
    process.exit(1);
  }
}

testPipeline();