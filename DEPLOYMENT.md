# 🚀 **Deploy Your Vault Bets App (Non-Technical Guide)**

This guide will help you deploy your automated betting tips platform in about 15 minutes - no technical experience required!

## **Prerequisites (Must Complete First!)**
✅ **Supabase Setup**: Follow `SUPABASE_SETUP.md` first  
✅ **Test Locally**: Run `npm run dev` and confirm it works  
✅ **GitHub Account**: You'll need this for deployment

---

## **Step 1: Supabase Production Setup (2 minutes)**

1. **In your Supabase dashboard:**
   - Go to Settings → API
   - Copy your **Project URL** and **anon/public key**
   - Go to Settings → Database  
   - Copy your **Connection string** (the NodeJS one)

2. **Note these values** - you'll need them for deployment

## **Step 2: Stripe Setup (5 minutes)**
Set up payments for your premium subscribers:

1. **Go to [stripe.com](https://stripe.com)** and create an account
2. **Create a subscription product:**
   - Go to Products → Add Product
   - Name: "Vault Bets Premium"
   - Price: $19.99/month (recurring)
   - Copy the **Price ID** (starts with `price_`)
3. **Get your API keys from the dashboard:**
   - **Publishable key** (starts with `pk_test_` for testing)
   - **Secret key** (starts with `sk_test_` for testing)

## **Step 3: Push to GitHub (2 minutes)**

If you haven't already, push your code to GitHub:

```bash
# Initialize git repository (if not done)
git init
git add .
git commit -m "Initial Vault Bets setup"

# Create repository on GitHub (via website) then:
git remote add origin https://github.com/yourusername/vault-bets.git
git push -u origin main
```

## **Step 4: Deploy to Vercel (5 minutes)**

1. **Go to [vercel.com](https://vercel.com)** and sign up with GitHub
2. **Click "Add New Project"**
3. **Import your GitHub repository** (vault-bets)
4. **Configure environment variables** in the deployment settings:
   
   **Required Variables:**
   ```env
   # Database (from Supabase)
   DATABASE_URL=postgresql://postgres:PASSWORD@db.your-project.supabase.co:5432/postgres
   
   # Stripe (from Step 2)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   STRIPE_SECRET_KEY=sk_test_your_key_here
   STRIPE_WEBHOOK_SECRET=whsec_will_add_later
   
   # API Keys (optional for testing)
   THESPORTSDB_API_KEY=test
   ODDS_API_KEY=your_odds_api_key_here
   
   # System Settings
   NODE_ENV=production
   ENABLE_AUTO_GENERATION=true
   ```

5. **Click Deploy!** 🎉

## **Step 5: Configure Stripe Webhooks (1 minute)**

After deployment, get your live URL from Vercel then:

1. **Go to your Stripe Dashboard → Webhooks**
2. **Add endpoint:** `https://your-vercel-url.vercel.app/api/webhook`
3. **Select these events:**
   - `customer.subscription.created`
   - `customer.subscription.updated` 
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Copy the webhook secret** and update in Vercel environment variables:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
   ```

## **Step 6: Initialize Your System**

1. **Visit your live site:** `https://your-app.vercel.app`
2. **Go to admin dashboard:** `https://your-app.vercel.app/admin`
3. **Click "Initialize Scheduler"** to start the automation
4. **Test manual tip generation** to verify everything works

---

## **🎉 Your Automated Betting System is Live!**

### **What Your System Now Does:**
✅ **Generates 6 daily betting tips** automatically at 8 AM UTC  
✅ **Updates betting odds** every 30 minutes  
✅ **Monitors system health** every 15 minutes  
✅ **Calculates performance** metrics daily  
✅ **Accepts premium subscriptions** via Stripe  
✅ **Tracks all usage and costs** in admin dashboard

### **Monitoring Your Business:**
- **Admin Dashboard:** `/admin` - Real-time system monitoring
- **Performance:** Tracks win rates and ROI automatically
- **Costs:** Monitor API usage and database costs
- **Revenue:** Stripe dashboard shows subscription revenue

### **Cost Breakdown (Monthly):**
| Service | Cost |
|---------|------|
| Vercel Hosting | **FREE** (hobby tier) |
| Supabase Database | **FREE** (up to 500MB) |
| TheSportsDB API | **FREE** (100 req/hour) |
| The Odds API | **$10+** (for live odds) |
| **Total** | **$10-20/month** |

### **Revenue Potential:**
- **Premium subscriptions:** $19.99/month per user
- **Break-even:** Just 1 subscriber covers all costs!
- **100 subscribers:** $2,000/month revenue
- **Unlimited scalability** with professional infrastructure

### **Next Steps:**
1. **Get API keys** for live sports data (when ready)
2. **Add custom domain** in Vercel dashboard
3. **Set up Google Analytics** for user tracking
4. **Create marketing content** and launch!
5. **Monitor the admin dashboard** for system health

---

**🚀 Congratulations!** 

You now have a **fully automated, professional-grade betting tips platform** that:
- Generates tips automatically every day
- Handles payments and subscriptions
- Monitors itself for issues  
- Scales to handle thousands of users
- Tracks performance and profitability

**Time to deploy:** ~15 minutes  
**Technical knowledge required:** Zero  
**Monthly operating cost:** $10-20  
**Revenue potential:** Unlimited! 💰