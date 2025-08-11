#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function initializeSystem() {
  console.log('🚀 Initializing Vault Bets System...');
  
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  try {
    // First check if the system is already initialized
    const statusResponse = await axios.get(`${baseUrl}/api/system/init`);
    console.log('📊 Current system status:', statusResponse.data.data?.status || 'unknown');
    
    // Initialize the system
    console.log('🔧 Starting system initialization...');
    const initResponse = await axios.post(`${baseUrl}/api/system/init`);
    
    if (initResponse.data.success) {
      console.log('✅ System initialized successfully!');
      console.log('📅 Scheduler is now running and will generate tips daily at 9:00 AM UK time');
      
      // Initialize the scheduler specifically
      console.log('🕐 Initializing scheduler...');
      const schedulerResponse = await axios.post(`${baseUrl}/api/admin/automation`, {
        action: 'initialize_scheduler'
      });
      
      if (schedulerResponse.data.success) {
        console.log('✅ Scheduler initialized successfully!');
      } else {
        console.log('⚠️ Scheduler initialization had issues:', schedulerResponse.data.error);
      }
      
      // Check the final status
      const finalStatusResponse = await axios.get(`${baseUrl}/api/admin/automation`);
      const jobStatus = finalStatusResponse.data.data?.jobStatus || {};
      
      console.log('\n📊 Final System Status:');
      console.log('======================');
      Object.entries(jobStatus).forEach(([job, status]) => {
        console.log(`${status ? '✅' : '❌'} ${job}: ${status ? 'Running' : 'Stopped'}`);
      });
      
      console.log('\n🎉 System is ready to generate daily betting tips!');
      console.log('💡 Tips will be generated automatically at 9:00 AM UK time each day');
      
    } else {
      console.error('❌ System initialization failed:', initResponse.data.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Failed to initialize system:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️ Make sure your Next.js application is running first:');
      console.log('   npm run dev');
      console.log('   or');
      console.log('   npm run build && npm start');
    }
    
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeSystem();
}

module.exports = { initializeSystem };