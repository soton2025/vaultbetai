#!/usr/bin/env node
/**
 * Supabase Connection Test Script
 * Run this to verify your Supabase setup is working correctly
 * 
 * Usage: node test-supabase.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in your .env.local file');
    console.log('💡 Copy .env.example to .env.local and add your Supabase connection string');
    process.exit(1);
  }

  // Check if it looks like a Supabase URL
  if (!process.env.DATABASE_URL.includes('supabase.co')) {
    console.log('⚠️  DATABASE_URL doesn\'t look like a Supabase connection string');
    console.log('💡 Make sure you\'re using the connection string from Supabase dashboard');
  }

  // Create connection pool
  const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 10000,
  };

  const db = new Pool(dbConfig);

  try {
    console.log('📡 Connecting to database...');
    
    const client = await db.connect();
    console.log('✅ Successfully connected to database!');

    // Test basic query
    console.log('🔍 Testing basic query...');
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query successful! Current time:', timeResult.rows[0].current_time);

    // Check if it's really PostgreSQL/Supabase
    const versionResult = await client.query('SELECT version()');
    const isPostgres = versionResult.rows[0].version.includes('PostgreSQL');
    console.log('✅ Database type:', isPostgres ? 'PostgreSQL (Supabase)' : 'Other');

    // Test if required tables exist
    console.log('🔍 Checking if database schema is set up...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('leagues', 'teams', 'matches', 'betting_tips')
    `);

    const expectedTables = ['leagues', 'teams', 'matches', 'betting_tips'];
    const existingTables = tablesResult.rows.map(r => r.table_name);
    const missingTables = expectedTables.filter(t => !existingTables.includes(t));

    if (missingTables.length === 0) {
      console.log('✅ All required tables found! Schema is properly set up.');
    } else {
      console.log('⚠️  Missing tables:', missingTables.join(', '));
      console.log('💡 Run the schema.sql file in Supabase SQL Editor to create tables');
    }

    // Test insert/read (if tables exist)
    if (existingTables.includes('system_config')) {
      console.log('🔍 Testing database write/read...');
      
      await client.query(`
        INSERT INTO system_config (key, value, description) 
        VALUES ('TEST_CONNECTION', $1, 'Test connection timestamp')
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `, [new Date().toISOString()]);

      const configResult = await client.query(
        'SELECT * FROM system_config WHERE key = $1', 
        ['TEST_CONNECTION']
      );
      
      if (configResult.rows.length > 0) {
        console.log('✅ Database write/read test successful!');
        console.log('📝 Test record:', configResult.rows[0]);
      }
    }

    client.release();
    
    console.log('\n🎉 All tests passed! Your Supabase setup is working correctly.');
    console.log('💡 You can now run: npm run dev');

  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    
    // Helpful error messages
    if (error.message.includes('password authentication failed')) {
      console.log('💡 Check your database password in the connection string');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.log('💡 Check your internet connection and Supabase project status');
    } else if (error.message.includes('ssl')) {
      console.log('💡 SSL connection issue - make sure your connection string is correct');
    }

    process.exit(1);

  } finally {
    await db.end();
  }
}

// Run the test
testSupabaseConnection().catch(console.error);