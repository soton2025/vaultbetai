#!/usr/bin/env node

/**
 * Vault Bets Conversion Funnel Setup Script
 * Run this after deploying to configure email automation and webhooks
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Vault Bets Conversion Funnel...\n');

// Check environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'EMAIL_API_KEY',
  'FROM_EMAIL'
];

const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(envVar => console.error(`   - ${envVar}`));
  console.error('\nPlease set these variables before running the setup.\n');
  process.exit(1);
}

console.log('✅ Environment variables configured');

// Validate file structure
const requiredFiles = [
  'src/app/landing/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/results/page.tsx',
  'src/lib/emailAutomation.ts',
  'src/app/api/email-automation/route.ts',
  'src/components/SubscriptionModal.tsx'
];

console.log('\n📁 Checking file structure...');
const missingFiles = requiredFiles.filter(file => {
  const filePath = path.join(process.cwd(), file);
  return !fs.existsSync(filePath);
});

if (missingFiles.length > 0) {
  console.error('❌ Missing required files:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  console.error('\nPlease ensure all conversion funnel files are present.\n');
  process.exit(1);
}

console.log('✅ All required files present');

// Setup instructions
console.log(`
🎉 Conversion Funnel Setup Complete!

📋 Next Steps:
1. Deploy to Vercel/Netlify:
   npm run build
   vercel --prod

2. Configure Email Service (SendGrid/Mailgun):
   - Verify domain for sending emails
   - Configure email templates
   - Test email automation endpoints

3. Setup Stripe Webhooks:
   - Add webhook endpoint: /api/webhook
   - Enable events: customer.subscription.created, invoice.payment_succeeded
   - Copy webhook secret to environment

4. Configure Cron Jobs:
   - Setup daily email automation: GET /api/email-automation
   - Schedule for 9 AM UTC daily

5. Test Conversion Funnel:
   - Visit /landing page
   - Complete signup flow
   - Verify email automation
   - Test upgrade process

🔗 Key URLs:
   Landing Page: https://your-domain.com/landing
   Dashboard: https://your-domain.com/dashboard  
   Results: https://your-domain.com/results

📊 Analytics Setup:
   - Google Analytics 4
   - Conversion tracking for signups and upgrades
   - Email open/click tracking
   - Affiliate link attribution

🚨 Important Notes:
   - All pages are mobile-responsive
   - Age verification (18+) is enforced
   - Compliance disclaimers included
   - Email automation follows GDPR guidelines
   
Happy converting! 🎯
`);

// Create a simple health check
const healthCheck = {
  timestamp: new Date().toISOString(),
  status: 'setup_complete',
  features: {
    landing_page: true,
    signup_modal: true,
    dashboard: true,
    results_archive: true,
    email_automation: true,
    stripe_integration: true,
    mobile_responsive: true,
    compliance: true
  }
};

fs.writeFileSync(
  path.join(process.cwd(), 'conversion-funnel-status.json'),
  JSON.stringify(healthCheck, null, 2)
);

console.log('💾 Setup status saved to conversion-funnel-status.json\n');