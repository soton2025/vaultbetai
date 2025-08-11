import { NextRequest, NextResponse } from 'next/server';
import { SchedulerService } from '@/lib/scheduler';
import { StartupService } from '@/lib/startup';

// POST /api/system/init - Initialize system components
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Manual system initialization triggered...');
    
    // Initialize the system
    await StartupService.initializeSystem();
    
    return NextResponse.json({
      success: true,
      message: 'System initialized successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('System initialization failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'System initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/system/init - Check system initialization status
export async function GET(request: NextRequest) {
  try {
    const systemStatus = await StartupService.getSystemStatus();
    
    return NextResponse.json({
      success: true,
      data: systemStatus
    });

  } catch (error) {
    console.error('Failed to get system status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get system status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}