# 🎰 AI Betting Tips - Premium Sports Betting Platform

A premium, AI-powered sports betting tips platform built with Next.js, featuring sophisticated design, real-time predictions, and Stripe-powered subscriptions.

## ✨ Features

- **AI-Powered Predictions**: Advanced machine learning algorithms analyze sports data
- **Premium Design**: High-tech UI with neon colors, glass morphism, and smooth animations
- **Subscription Model**: Stripe-powered monthly subscriptions ($19.99/month)
- **Free Daily Tips**: One free betting tip per day for all users
- **Premium Features**: 5 expert picks daily, advanced filters, detailed analytics
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Location-Based Affiliate Links**: Dynamic bookmaker recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-betting-tips
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Stripe keys:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
   STRIPE_SECRET_KEY=sk_live_your_key_here
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Visit http://localhost:3000**

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Set up Stripe Webhooks**
   - Add webhook endpoint: `https://your-domain.vercel.app/api/webhook`
   - Select events: `customer.subscription.*`, `invoice.payment_*`
   - Copy webhook secret to environment variables

### Environment Variables for Production

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_... (your $19.99/month price ID)
```

## 💳 Stripe Setup

1. **Create Products**
   - Create a subscription product for $19.99/month
   - Copy the price ID to your environment variables

2. **Configure Webhooks**
   - Add webhook endpoint: `/api/webhook`
   - Events to select:
     - `customer.subscription.created`
     - `customer.subscription.updated` 
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

## 🎨 Design System

- **Colors**: Sophisticated purple, pink, green, cyan accents
- **Typography**: Inter font with premium hierarchy
- **Effects**: Glass morphism, neon glows, smooth animations
- **Components**: Premium cards, modals, buttons with micro-interactions

## 📱 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Payments**: Stripe Checkout & Subscriptions
- **Icons**: Lucide React
- **Animations**: CSS animations with Tailwind
- **Deployment**: Vercel (recommended)

## 🏗 Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   ├── privacy/          # Privacy policy page
│   ├── success/          # Payment success page
│   ├── terms/            # Terms of service
│   └── page.tsx          # Main homepage
├── components/           # Reusable components
├── context/              # React context providers
├── data/                 # Mock data & types
├── lib/                  # Utilities & configurations
├── types/                # TypeScript type definitions
└── utils/                # Helper functions
```

## 🛡 Legal & Compliance

- Terms of Service included
- Privacy Policy included  
- Age verification (18+)
- Gambling responsibility disclaimers
- GDPR considerations

## 🎯 Customization

### Adding Real Betting Data
Replace mock data in `src/data/mockBets.ts` with real API integration:
- The Odds API
- SportRadar
- Similar sports data providers

### Styling Customization
Modify `tailwind.config.ts` for:
- Color schemes
- Animations
- Typography
- Spacing

## 📈 Analytics & Monitoring

Add these services for production:
- **Analytics**: Google Analytics, Mixpanel
- **Error Monitoring**: Sentry
- **Performance**: Vercel Analytics
- **User Feedback**: Hotjar, LogRocket

## 🔒 Security

- Environment variables for sensitive data
- Stripe webhook signature verification
- HTTPS enforcement
- Security headers configured
- Input validation

## 📞 Support

- **Documentation**: This README
- **Issues**: GitHub Issues
- **Email**: support@aibettingtips.com

## 📄 License

This project is proprietary. All rights reserved.

---

Built with ❤️ using Next.js, Tailwind CSS, and Stripe

# Deployment Fix
