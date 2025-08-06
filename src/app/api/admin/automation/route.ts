import { NextRequest, NextResponse } from 'next/server';
import { SchedulerService } from '@/lib/scheduler';
import { AutomationPipeline } from '@/lib/automationPipeline';
import { DatabaseService } from '@/lib/database';

// GET /api/admin/automation - Get automation status
export async function GET(request: NextRequest) {
  try {
    // Get job status
    const jobStatus = SchedulerService.getJobStatus();
    
    // Get recent execution logs
    const recentLogs = await DatabaseService.query(`
      SELECT analysis_type, status, execution_time_ms, error_message, created_at
      FROM analysis_logs
      WHERE analysis_type LIKE 'SCHEDULED_%'
      ORDER BY created_at DESC
      LIMIT 20
    `);

    // Get performance metrics
    const performanceMetrics = await DatabaseService.query(`
      SELECT key, value, updated_at
      FROM system_config
      WHERE key LIKE 'PERFORMANCE_%' OR key LIKE 'LAST_%'
      ORDER BY key
    `);

    // Get API usage stats
    const apiUsage = await DatabaseService.query(`
      SELECT 
        api_provider,
        SUM(requests_made) as total_requests,
        SUM(cost_estimate) as total_cost
      FROM api_usage
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY api_provider
      ORDER BY total_requests DESC
    `);

    // Get tip statistics
    const tipStats = await DatabaseService.query(`
      SELECT 
        COUNT(*) as total_tips,
        COUNT(*) FILTER (WHERE is_published = true) as published_tips,
        COUNT(*) FILTER (WHERE is_premium = true) as premium_tips,
        AVG(confidence_score) as avg_confidence
      FROM betting_tips
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `);

    return NextResponse.json({
      success: true,
      data: {
        jobStatus,
        recentLogs: recentLogs.rows,
        performanceMetrics: performanceMetrics.rows,
        apiUsage: apiUsage.rows,
        tipStats: tipStats.rows[0],
        systemHealth: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error fetching automation status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch automation status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/automation - Control automation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, jobName } = body;

    let result;

    switch (action) {
      case 'start_job':
        if (!jobName) {
          return NextResponse.json(
            { success: false, error: 'Job name required for start_job action' },
            { status: 400 }
          );
        }
        await SchedulerService.startJob(jobName);
        result = { message: `Job ${jobName} started successfully` };
        break;

      case 'stop_job':
        if (!jobName) {
          return NextResponse.json(
            { success: false, error: 'Job name required for stop_job action' },
            { status: 400 }
          );
        }
        await SchedulerService.stopJob(jobName);
        result = { message: `Job ${jobName} stopped successfully` };
        break;

      case 'trigger_daily_generation':
        await SchedulerService.triggerDailyGeneration();
        result = { message: 'Daily tip generation triggered successfully' };
        break;

      case 'trigger_odds_update':
        await SchedulerService.triggerOddsUpdate();
        result = { message: 'Odds update triggered successfully' };
        break;

      case 'test_pipeline':
        await AutomationPipeline.testPipeline();
        result = { message: 'Test pipeline executed successfully' };
        break;

      case 'initialize_scheduler':
        await SchedulerService.initialize();
        result = { message: 'Scheduler initialized successfully' };
        break;

      case 'stop_all_jobs':
        await SchedulerService.stopAllJobs();
        result = { message: 'All jobs stopped successfully' };
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    // Log the admin action
    await DatabaseService.query(`
      INSERT INTO analysis_logs (analysis_type, status, error_message)
      VALUES ($1, $2, $3)
    `, [`ADMIN_ACTION_${action.toUpperCase()}`, 'success', `Job: ${jobName || 'N/A'}`]);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error controlling automation:', error);
    
    // Log the failed admin action
    try {
      await DatabaseService.query(`
        INSERT INTO analysis_logs (analysis_type, status, error_message)
        VALUES ($1, $2, $3)
      `, [`ADMIN_ACTION_FAILED`, 'failed', error instanceof Error ? error.message : 'Unknown error']);
    } catch (logError) {
      console.error('Failed to log admin action error:', logError);
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to control automation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}