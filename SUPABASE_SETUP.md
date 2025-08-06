# 🚀 Easy Supabase Setup Guide for Vault Bets

This guide will help you set up Vault Bets with Supabase in about 10 minutes - no technical experience needed!

## Why Supabase?
- ✅ **100% Free** to start (up to 500MB database)
- ✅ **No server management** required
- ✅ **Web-based dashboard** - everything in your browser
- ✅ **Automatic backups** included
- ✅ **Scales automatically** as you grow

## Step 1: Create Supabase Account (2 minutes)

1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Start your project"**
3. Sign up with GitHub, Google, or email
4. Verify your email if prompted

## Step 2: Create New Project (3 minutes)

1. Click **"New project"** 
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `vault-bets` (or whatever you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

## Step 3: Set Up Database Schema (2 minutes)

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy the entire contents of `database/schema.sql` from your project
4. Paste it into the SQL editor
5. Click **"Run"** (green play button)
6. You should see "Success. No rows returned" - this is normal!

## Step 4: Get Connection String (1 minute)

1. In Supabase dashboard, click **"Settings"** (gear icon) in left sidebar
2. Click **"Database"**
3. Scroll down to **"Connection string"**
4. Select **"Nodejs"** tab
5. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
6. Replace `[YOUR-PASSWORD]` with the database password you created in Step 2

## Step 5: Configure Your Project (2 minutes)

1. In your Vault Bets project, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and update:
   ```env
   DATABASE_URL="your_connection_string_from_step_4"
   THESPORTSDB_API_KEY="test"  # This works for testing
   ```

3. Save the file

## Step 6: Test Everything Works

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to **http://localhost:3000/admin** 
3. You should see the admin dashboard
4. If the database connection shows "✅ Connected" - you're done!

## API Keys (Optional for Testing)

### Free Testing Setup
- **TheSportsDB**: Use `"test"` as the API key (already set)
- **Odds API**: Skip for now (you can add later)

### Production Setup (When Ready)
1. **TheSportsDB**: Sign up at [thesportsdb.com/api.php](https://thesportsdb.com/api.php) (free tier: 100 requests/hour)
2. **Odds API**: Sign up at [the-odds-api.com](https://the-odds-api.com) (starts at $10/month)

## Troubleshooting

### Connection Issues
- ✅ **Password incorrect**: Make sure you replaced `[YOUR-PASSWORD]` in connection string
- ✅ **ENOTFOUND error**: Check your internet connection
- ✅ **SSL errors**: Make sure your connection string includes `?sslmode=require`

### Database Issues  
- ✅ **Tables not found**: Re-run the schema.sql in Supabase SQL Editor
- ✅ **Permission errors**: Make sure you're using the postgres connection string, not the pooler

### Need Help?
- Check the Supabase logs in Dashboard → Settings → Logs
- Join the Supabase Discord for community help
- Check if your firewall is blocking the connection

## Cost Breakdown

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Supabase** | 500MB database | $25/month for 8GB |
| **TheSportsDB** | 100 requests/hour | $2/month for 1000/hour |
| **The Odds API** | None | $10/month for 1000/month |
| **Total** | **FREE** | **$37/month** |

## Next Steps

Once everything is working:

1. **Deploy to Vercel** (see DEPLOYMENT.md)
2. **Set up your payment system** with Stripe
3. **Configure your domain** name
4. **Add production API keys** for live data
5. **Monitor your usage** in the admin dashboard

## Security Notes

- ✅ Your database password is secure with Supabase
- ✅ Never commit your `.env.local` file to Git
- ✅ Use environment variables in production
- ✅ Enable Row Level Security in Supabase for production

---

🎉 **Congratulations!** You now have a fully automated betting tips system running with professional-grade infrastructure!

Need help? The admin dashboard at `/admin` shows you exactly what's happening with your system in real-time.