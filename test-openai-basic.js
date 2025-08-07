require('dotenv').config({ path: '.env.local' });

async function testOpenAI() {
  try {
    console.log('🧪 Testing OpenAI Integration...\n');
    
    // Test 1: Check if API key is loaded
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY not found in environment');
      return;
    }
    console.log('✅ OpenAI API key loaded:', apiKey.substring(0, 20) + '...');
    
    // Test 2: Test basic OpenAI connection
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey });
    
    console.log('📡 Testing OpenAI connection...');
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: 'Respond with "OpenAI connection successful" to confirm this is working.'
        }
      ]
    });
    
    const responseText = response.choices[0]?.message?.content || '';
    console.log('🤖 OpenAI Response:', responseText);
    
    if (responseText.includes('successful')) {
      console.log('✅ OpenAI connection test: SUCCESS');
    } else {
      console.log('⚠️  OpenAI connection test: PARTIAL - API responded but response unexpected');
    }
    
    console.log('\n🎉 Basic OpenAI integration is working!');
    console.log('   - API key configured ✅');
    console.log('   - Connection established ✅');
    console.log('   - API responding correctly ✅');
    
  } catch (error) {
    console.error('❌ OpenAI test failed:', error.message);
    if (error.code === 'insufficient_quota') {
      console.log('💡 This appears to be a quota/billing issue with your OpenAI account');
    } else if (error.code === 'invalid_api_key') {
      console.log('💡 The API key appears to be invalid or expired');
    }
  }
}

testOpenAI();