// Email automation system for Vault Bets conversion funnel
// This would integrate with services like SendGrid, Mailgun, or Resend in production

interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  signupDate: string;
  hasActiveSubscription: boolean;
}

export class EmailAutomationService {
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.EMAIL_API_KEY || '';
    this.fromEmail = process.env.FROM_EMAIL || 'research@vaultbets.ai';
  }

  // Day 0 - Welcome email with free picks
  async sendWelcomeEmail(user: User): Promise<boolean> {
    const template = this.getWelcomeTemplate(user);
    
    try {
      await this.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.htmlContent,
        text: template.textContent
      });
      
      console.log(`Welcome email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  // Day 1 - How to read AI picks
  async sendEducationalEmail(user: User): Promise<boolean> {
    const template = this.getEducationalTemplate(user);
    
    try {
      await this.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.htmlContent,
        text: template.textContent
      });
      
      console.log(`Educational email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('Failed to send educational email:', error);
      return false;
    }
  }

  // Day 3 - Upgrade to Pro
  async sendUpgradeEmail(user: User): Promise<boolean> {
    if (user.hasActiveSubscription) {
      return false; // Don't send upgrade emails to active subscribers
    }

    const template = this.getUpgradeTemplate(user);
    
    try {
      await this.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.htmlContent,
        text: template.textContent
      });
      
      console.log(`Upgrade email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('Failed to send upgrade email:', error);
      return false;
    }
  }

  // Daily picks email for subscribers
  async sendDailyPicksEmail(user: User, picks: any[]): Promise<boolean> {
    if (!user.hasActiveSubscription) {
      return false; // Only send to active subscribers
    }

    const template = this.getDailyPicksTemplate(user, picks);
    
    try {
      await this.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.htmlContent,
        text: template.textContent
      });
      
      console.log(`Daily picks email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('Failed to send daily picks email:', error);
      return false;
    }
  }

  private async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    // In production, integrate with actual email service
    // Example with SendGrid:
    /*
    const msg = {
      to: params.to,
      from: this.fromEmail,
      subject: params.subject,
      text: params.text,
      html: params.html,
    };
    
    await sgMail.send(msg);
    */
    
    // For demo purposes, just log
    console.log('Email sent:', {
      to: params.to,
      subject: params.subject,
      preview: params.html.substring(0, 100) + '...'
    });
  }

  private getWelcomeTemplate(user: User): EmailTemplate {
    return {
      subject: "Welcome to Vault Bets - Your Free Research is Ready! 🚀",
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Vault Bets</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; font-size: 32px; margin-bottom: 10px;">Welcome to Vault Bets!</h1>
            <p style="color: #666; font-size: 18px;">Your AI-powered research platform is ready</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 30px; border-radius: 16px; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Hi ${user.name},</h2>
            <p>Thank you for joining Vault Bets! You now have access to our advanced AI-powered sports analysis platform.</p>
            <p><strong>What you get with your free account:</strong></p>
            <ul style="color: #475569;">
              <li>2 daily AI research models</li>
              <li>Transparent confidence scores</li>
              <li>Historical results tracking</li>
              <li>Educational analysis explanations</li>
            </ul>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://vaultbetai-1.vercel.app/dashboard" 
               style="background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
              View Today's Research →
            </a>
          </div>

          <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
            <h3 style="color: #1e293b; margin-bottom: 15px;">🎯 Today's Free Pick Preview</h3>
            <p style="color: #475569; margin: 0;">Premier League - Over 2.5 Goals</p>
            <p style="color: #10b981; font-weight: bold; margin: 5px 0;">87% AI Confidence • 1.85 odds</p>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Advanced statistical models show high probability for goals...</p>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">Questions? Reply to this email or visit our help center.</p>
            <p style="color: #94a3b8; font-size: 12px;">Educational research only. Not professional investment advice.</p>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Welcome to Vault Bets!
        
        Hi ${user.name},
        
        Thank you for joining Vault Bets! You now have access to our advanced AI-powered sports analysis platform.
        
        What you get with your free account:
        - 2 daily AI research models  
        - Transparent confidence scores
        - Historical results tracking
        - Educational analysis explanations
        
        View today's research: https://vaultbetai-1.vercel.app/dashboard
        
        Today's Free Pick Preview:
        Premier League - Over 2.5 Goals
        87% AI Confidence • 1.85 odds
        Advanced statistical models show high probability for goals...
        
        Educational research only. Not professional investment advice.
      `
    };
  }

  private getEducationalTemplate(user: User): EmailTemplate {
    return {
      subject: "How to Read Our AI Picks - Maximize Your Research 📊",
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #6366f1; text-align: center;">Understanding Our AI Analysis</h1>
          
          <p>Hi ${user.name},</p>
          
          <p>Yesterday you joined Vault Bets. Today, let's help you understand how to read our AI-powered research to maximize your educational insights.</p>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #1e293b;">🎯 Confidence Scores Explained</h3>
            <ul>
              <li><strong>85%+:</strong> Highest conviction picks based on strong statistical patterns</li>
              <li><strong>75-84%:</strong> Good value opportunities with solid model agreement</li>
              <li><strong>65-74%:</strong> Moderate confidence with favorable risk-reward</li>
            </ul>
          </div>

          <div style="background: #f0fdf4; padding: 25px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #166534;">📈 How Our Models Work</h3>
            <p>Our AI analyzes:</p>
            <ul>
              <li>Team form and historical head-to-head data</li>
              <li>Player availability and key injuries</li>
              <li>Market movements and value opportunities</li>
              <li>Weather conditions and venue factors</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://vaultbetai-1.vercel.app/dashboard" style="background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
              Apply This Knowledge →
            </a>
          </div>

          <p style="color: #64748b; font-size: 14px; text-align: center;">Educational research only. Always do your own analysis.</p>
        </body>
        </html>
      `,
      textContent: `
        Understanding Our AI Analysis
        
        Hi ${user.name},
        
        Yesterday you joined Vault Bets. Today, let's help you understand how to read our AI-powered research to maximize your educational insights.
        
        Confidence Scores Explained:
        - 85%+: Highest conviction picks based on strong statistical patterns
        - 75-84%: Good value opportunities with solid model agreement  
        - 65-74%: Moderate confidence with favorable risk-reward
        
        How Our Models Work:
        Our AI analyzes team form, player availability, market movements, weather conditions and venue factors.
        
        Apply this knowledge: https://vaultbetai-1.vercel.app/dashboard
        
        Educational research only. Always do your own analysis.
      `
    };
  }

  private getUpgradeTemplate(user: User): EmailTemplate {
    return {
      subject: "Ready for Advanced Analytics? Upgrade to Pro 🚀",
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1;">Ready to Level Up Your Research?</h1>
            <p style="font-size: 18px; color: #666;">You've been exploring for 3 days. Time to unlock the full power of our AI.</p>
          </div>

          <div style="background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); color: white; padding: 30px; border-radius: 16px; margin-bottom: 30px;">
            <h2 style="margin-bottom: 20px;">What You're Missing with Pro:</h2>
            <ul style="margin: 0; padding-left: 20px;">
              <li>5+ unlimited daily picks (vs 2 free)</li>
              <li>Early access to picks before markets move</li>
              <li>Advanced Sharpe ratio and CLV analysis</li>
              <li>Detailed model breakdowns and reasoning</li>
              <li>Telegram alerts for urgent opportunities</li>
              <li>Priority email support</li>
            </ul>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; display: inline-block;">
              <h3 style="color: #1e293b; margin-bottom: 10px;">Limited Time Offer</h3>
              <p style="font-size: 24px; font-weight: bold; color: #6366f1; margin: 0;">£19/month</p>
              <p style="color: #64748b; font-size: 14px; margin: 5px 0;">7-day free trial • Cancel anytime</p>
            </div>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://vaultbetai-1.vercel.app/dashboard?upgrade=true" 
               style="background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); color: white; text-decoration: none; padding: 18px 36px; border-radius: 12px; font-weight: bold; font-size: 18px; display: inline-block;">
              Start Free Trial →
            </a>
          </div>

          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 30px;">
            <p style="color: #991b1b; margin: 0; font-weight: 500;">⚠️ Free accounts are limited to 2 picks per day. Upgrade now to unlock unlimited research.</p>
          </div>

          <p style="color: #64748b; font-size: 14px; text-align: center;">Questions? Just reply to this email. Educational research only.</p>
        </body>
        </html>
      `,
      textContent: `
        Ready to Level Up Your Research?
        
        Hi ${user.name},
        
        You've been exploring for 3 days. Time to unlock the full power of our AI.
        
        What You're Missing with Pro:
        - 5+ unlimited daily picks (vs 2 free)
        - Early access to picks before markets move
        - Advanced Sharpe ratio and CLV analysis
        - Detailed model breakdowns and reasoning
        - Telegram alerts for urgent opportunities
        - Priority email support
        
        Limited Time Offer: £19/month
        7-day free trial • Cancel anytime
        
        Start free trial: https://vaultbetai-1.vercel.app/dashboard?upgrade=true
        
        ⚠️ Free accounts are limited to 2 picks per day. Upgrade now to unlock unlimited research.
        
        Educational research only.
      `
    };
  }

  private getDailyPicksTemplate(user: User, picks: any[]): EmailTemplate {
    const topPick = picks[0];
    const pickCount = picks.length;
    
    return {
      subject: `🚀 ${pickCount} Premium Research Models Ready - Vault Bets`,
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #6366f1; text-align: center;">Today's Premium Research</h1>
          
          <p>Good morning ${user.name},</p>
          <p>Your ${pickCount} premium AI research models are ready for today.</p>
          
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #22c55e; padding: 25px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #166534; margin-bottom: 15px;">⭐ Today's Top Pick</h3>
            <h4 style="color: #1e293b; margin-bottom: 10px;">${topPick?.match?.homeTeam} vs ${topPick?.match?.awayTeam}</h4>
            <p style="color: #374151; margin-bottom: 10px;"><strong>Market:</strong> ${topPick?.type}</p>
            <p style="color: #374151; margin-bottom: 10px;"><strong>Odds:</strong> ${topPick?.odds} | <strong>Confidence:</strong> ${topPick?.confidence}%</p>
            <p style="color: #4b5563; font-size: 14px;">${topPick?.explanation?.substring(0, 150)}...</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://vaultbetai-1.vercel.app/dashboard" style="background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
              View All ${pickCount} Models →
            </a>
          </div>

          <div style="background: #fffbeb; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-bottom: 10px;">📊 Quick Stats</h4>
            <p style="color: #78350f; margin: 5px 0;">• Average confidence: ${picks.reduce((sum, pick) => sum + pick.confidence, 0) / picks.length}%</p>
            <p style="color: #78350f; margin: 5px 0;">• Markets covered: ${picks.length} different opportunities</p>
            <p style="color: #78350f; margin: 5px 0;">• Research window: Next 24 hours</p>
          </div>

          <p style="color: #64748b; font-size: 14px; text-align: center;">Educational research only. Not professional investment advice.</p>
        </body>
        </html>
      `,
      textContent: `
        Today's Premium Research
        
        Good morning ${user.name},
        
        Your ${pickCount} premium AI research models are ready for today.
        
        Today's Top Pick:
        ${topPick?.match?.homeTeam} vs ${topPick?.match?.awayTeam}
        Market: ${topPick?.type}
        Odds: ${topPick?.odds} | Confidence: ${topPick?.confidence}%
        ${topPick?.explanation?.substring(0, 150)}...
        
        View all models: https://vaultbetai-1.vercel.app/dashboard
        
        Quick Stats:
        • Average confidence: ${picks.reduce((sum, pick) => sum + pick.confidence, 0) / picks.length}%
        • Markets covered: ${picks.length} different opportunities
        • Research window: Next 24 hours
        
        Educational research only. Not professional investment advice.
      `
    };
  }
}

// Email automation scheduler
export async function scheduleEmailAutomation() {
  const emailService = new EmailAutomationService();
  
  // This would be called by a cron job or scheduled function
  // Check for users who need automated emails based on their signup date
  
  try {
    // Get users from database (mock implementation)
    const users = await getUsersForEmailAutomation();
    
    for (const user of users) {
      const daysSinceSignup = Math.floor((Date.now() - new Date(user.signupDate).getTime()) / (1000 * 60 * 60 * 24));
      
      switch (daysSinceSignup) {
        case 0:
          await emailService.sendWelcomeEmail(user);
          break;
        case 1:
          await emailService.sendEducationalEmail(user);
          break;
        case 3:
          await emailService.sendUpgradeEmail(user);
          break;
      }
    }
    
  } catch (error) {
    console.error('Email automation error:', error);
  }
}

async function getUsersForEmailAutomation(): Promise<User[]> {
  // In production, this would query your database
  // Return users who need emails sent based on their signup date
  return [];
}