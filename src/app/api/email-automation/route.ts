import { NextRequest, NextResponse } from 'next/server';
import { EmailAutomationService } from '@/lib/emailAutomation';

export async function POST(request: NextRequest) {
  try {
    const { type, user, data } = await request.json();
    
    const emailService = new EmailAutomationService();
    let success = false;

    switch (type) {
      case 'welcome':
        success = await emailService.sendWelcomeEmail(user);
        break;
      case 'educational':
        success = await emailService.sendEducationalEmail(user);
        break;
      case 'upgrade':
        success = await emailService.sendUpgradeEmail(user);
        break;
      case 'daily-picks':
        success = await emailService.sendDailyPicksEmail(user, data.picks || []);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid email type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      success,
      message: success ? 'Email sent successfully' : 'Failed to send email'
    });

  } catch (error) {
    console.error('Email automation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Scheduled email automation endpoint (called by cron job)
export async function GET() {
  try {
    // This would be called by a cron service like Vercel Cron or external scheduler
    const { scheduleEmailAutomation } = await import('@/lib/emailAutomation');
    await scheduleEmailAutomation();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email automation completed' 
    });
    
  } catch (error) {
    console.error('Scheduled email automation error:', error);
    return NextResponse.json(
      { success: false, error: 'Automation failed' },
      { status: 500 }
    );
  }
}