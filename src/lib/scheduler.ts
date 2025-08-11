import cron from 'node-cron';
import { AutomationPipeline } from './automationPipeline';
import { SportsApiService } from './sportsApi';
import { DatabaseService, testConnection } from './database';

// Scheduling Service for Automated Tasks
export class SchedulerService {
  private static jobs: Map<string, cron.ScheduledTask> = new Map();
  private static jobStatus: Map<string, boolean> = new Map();
  private static isInitialized = false;

  // Initialize all scheduled jobs
  static async initialize() {
    if (this.isInitialized) {
      console.log('⚠️ Scheduler already initialized');
      return;
    }

    console.log('🕐 Initializing scheduler service...');
    console.log('📅 Current server time:', new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }));

    try {
      // Get configuration
      const config = await this.getSchedulerConfig();
      console.log('📋 Scheduler configuration:', config);

      // Initialize database connection
      await testConnection();

      // Schedule daily tip generation
      await this.scheduleDailyTipGeneration(config.dailyGenerationTime);

      // Schedule odds updates
      await this.scheduleOddsUpdates(config.oddsUpdateInterval);

      // Schedule data cleanup
      await this.scheduleDataCleanup();

      // Schedule health checks
      await this.scheduleHealthChecks();

      // Schedule performance tracking
      await this.schedulePerformanceTracking();

      this.isInitialized = true;
      console.log('✅ Scheduler service initialized successfully');

    } catch (error) {
      console.error('💥 Failed to initialize scheduler:', error);
      throw error;
    }
  }

  // Get scheduler configuration from database
  private static async getSchedulerConfig() {
    const [
      dailyTime,
      oddsInterval,
      autoGenEnabled,
      cleanupTime
    ] = await Promise.all([
      DatabaseService.getConfig('DAILY_GENERATION_TIME'),
      DatabaseService.getConfig('ODDS_UPDATE_INTERVAL_MINUTES'),
      DatabaseService.getConfig('AUTO_GENERATION_ENABLED'),
      DatabaseService.getConfig('DATA_CLEANUP_TIME')
    ]);

    return {
      dailyGenerationTime: dailyTime || '08:00',
      oddsUpdateInterval: parseInt(oddsInterval || '30'),
      autoGenerationEnabled: autoGenEnabled !== 'false',
      dataCleanupTime: cleanupTime || '02:00'
    };
  }

  // Schedule daily tip generation
  private static async scheduleDailyTipGeneration(time: string) {
    const [hour, minute] = time.split(':');
    const cronExpression = `${minute} ${hour} * * *`; // Daily at specified time

    const task = cron.schedule(cronExpression, async () => {
      console.log('🚀 Starting scheduled daily tip generation...');
      
      try {
        const startTime = Date.now();
        await AutomationPipeline.generateDailyTips();
        const duration = Date.now() - startTime;
        
        console.log(`✅ Daily tip generation completed in ${duration}ms`);
        
        // Log successful execution
        await this.logScheduledExecution('DAILY_TIP_GENERATION', 'success', duration);
        
      } catch (error) {
        console.error('❌ Daily tip generation failed:', error);
        await this.logScheduledExecution('DAILY_TIP_GENERATION', 'failed', 0, error);
        
        // Send alert for failed generation
        await this.sendAlert('Daily Tip Generation Failed', error);
      }
    }, {
      scheduled: false,
      timezone: 'Europe/London' // Use UK timezone instead of UTC
    });

    this.jobs.set('dailyTipGeneration', task);
    this.jobStatus.set('dailyTipGeneration', true);
    task.start();
    
    console.log(`📅 Daily tip generation scheduled for ${time} UK time (Europe/London)`);
  }

  // Schedule regular odds updates
  private static async scheduleOddsUpdates(intervalMinutes: number) {
    const cronExpression = `*/${intervalMinutes} * * * *`; // Every X minutes

    const task = cron.schedule(cronExpression, async () => {
      console.log('📊 Updating betting odds...');
      
      try {
        await this.updateBettingOdds();
        console.log('✅ Betting odds updated successfully');
        
      } catch (error) {
        console.error('❌ Failed to update betting odds:', error);
        // Don't send alerts for odds updates as they may fail frequently
      }
    }, {
      scheduled: false,
      timezone: 'Europe/London' // Use UK timezone for consistency
    });

    this.jobs.set('oddsUpdates', task);
    this.jobStatus.set('oddsUpdates', true);
    task.start();
    
    console.log(`📊 Odds updates scheduled every ${intervalMinutes} minutes (UK time)`);
  }

  // Update betting odds for upcoming matches
  private static async updateBettingOdds() {
    try {
      // Get matches happening in the next 72 hours
      const upcomingMatches = await DatabaseService.query(`
        SELECT m.*, bt.id as tip_id
        FROM matches m
        LEFT JOIN betting_tips bt ON m.id = bt.match_id
        WHERE m.match_date > NOW() 
        AND m.match_date < NOW() + INTERVAL '72 hours'
        AND m.status = 'scheduled'
        ORDER BY m.match_date ASC
        LIMIT 20
      `);

      let updatedCount = 0;

      for (const match of upcomingMatches.rows) {
        try {
          // Get current odds for the match
          const odds = await SportsApiService.getBettingOdds('soccer_epl');
          
          // Find odds for this specific match
          const matchOdds = odds.find((o: any) => 
            o.homeTeam === match.home_team && o.awayTeam === match.away_team
          );

          if (matchOdds?.bookmakers) {
            // Store odds in database
            for (const bookmaker of matchOdds.bookmakers) {
              for (const market of bookmaker.markets) {
                for (const outcome of market.outcomes) {
                  await DatabaseService.query(`
                    INSERT INTO betting_odds (match_id, bookmaker, bet_type, odds)
                    VALUES ($1, $2, $3, $4)
                  `, [match.id, bookmaker.name, `${market.key}_${outcome.name.toLowerCase()}`, outcome.price]);
                }
              }
            }
            updatedCount++;
          }

          // Respect rate limits
          await this.delay(500);

        } catch (error) {
          console.warn(`Failed to update odds for match ${match.id}:`, error);
        }
      }

      console.log(`📊 Updated odds for ${updatedCount} matches`);
      
    } catch (error) {
      console.error('Failed to update betting odds:', error);
      throw error;
    }
  }

  // Schedule data cleanup (remove old data)
  private static async scheduleDataCleanup() {
    const task = cron.schedule('0 2 * * *', async () => { // Daily at 2 AM
      console.log('🧹 Starting data cleanup...');
      
      try {
        // Clean old betting odds (older than 30 days)
        await DatabaseService.query(`
          DELETE FROM betting_odds 
          WHERE created_at < NOW() - INTERVAL '30 days'
        `);

        // Clean old analysis logs (older than 90 days)
        await DatabaseService.query(`
          DELETE FROM analysis_logs 
          WHERE created_at < NOW() - INTERVAL '90 days'
        `);

        // Clean old API usage logs (older than 1 year)
        await DatabaseService.query(`
          DELETE FROM api_usage 
          WHERE date < CURRENT_DATE - INTERVAL '1 year'
        `);

        // Archive completed matches (older than 1 year)
        await DatabaseService.query(`
          UPDATE matches SET status = 'archived'
          WHERE match_date < NOW() - INTERVAL '1 year'
          AND status = 'completed'
        `);

        console.log('✅ Data cleanup completed');
        
      } catch (error) {
        console.error('❌ Data cleanup failed:', error);
        await this.sendAlert('Data Cleanup Failed', error);
      }
    }, {
      scheduled: false,
      timezone: 'Europe/London' // Use UK timezone for consistency
    });

    this.jobs.set('dataCleanup', task);
    this.jobStatus.set('dataCleanup', true);
    task.start();
    
    console.log('🧹 Data cleanup scheduled for 2:00 AM UK time daily');
  }

  // Schedule health checks
  private static async scheduleHealthChecks() {
    const task = cron.schedule('*/15 * * * *', async () => { // Every 15 minutes
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Europe/London' // Use UK timezone for consistency
    });

    this.jobs.set('healthCheck', task);
    this.jobStatus.set('healthCheck', true);
    task.start();
    
    console.log('❤️ Health checks scheduled every 15 minutes (UK time)');
  }

  // Perform system health check
  private static async performHealthCheck() {
    const checks = {
      database: false,
      sportsApi: false,
      oddsApi: false,
      diskSpace: false,
      memory: false
    };

    try {
      // Database connection check
      checks.database = await testConnection();

      // Sports API check (with rate limiting consideration)
      try {
        await SportsApiService.getUpcomingMatches(SportsApiService.LEAGUES.PREMIER_LEAGUE, 1);
        checks.sportsApi = true;
      } catch (error) {
        checks.sportsApi = false;
      }

      // System resource checks
      const memUsage = process.memoryUsage();
      checks.memory = memUsage.heapUsed < (512 * 1024 * 1024); // Less than 512MB

      // Log health status
      const healthScore = Object.values(checks).filter(Boolean).length;
      const totalChecks = Object.keys(checks).length;
      
      if (healthScore < totalChecks) {
        console.warn(`⚠️ Health check issues: ${JSON.stringify(checks)}`);
        
        if (healthScore < totalChecks * 0.7) {
          await this.sendAlert('System Health Degraded', `Health score: ${healthScore}/${totalChecks}`);
        }
      }

      // Store health metrics
      await DatabaseService.query(`
        INSERT INTO system_config (key, value, description)
        VALUES ('LAST_HEALTH_CHECK', $1, 'Last health check timestamp')
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = CURRENT_TIMESTAMP
      `, [new Date().toISOString()]);

    } catch (error) {
      console.error('Health check error:', error);
    }
  }

  // Schedule performance tracking
  private static async schedulePerformanceTracking() {
    const task = cron.schedule('0 0 * * *', async () => { // Daily at midnight
      console.log('📈 Calculating performance metrics...');
      
      try {
        await this.calculatePerformanceMetrics();
        console.log('✅ Performance metrics calculated');
        
      } catch (error) {
        console.error('❌ Performance tracking failed:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Europe/London' // Use UK timezone for consistency
    });

    this.jobs.set('performanceTracking', task);
    this.jobStatus.set('performanceTracking', true);
    task.start();
    
    console.log('📈 Performance tracking scheduled daily at midnight UK time');
  }

  // Calculate performance metrics for published tips
  private static async calculatePerformanceMetrics() {
    // Get tips from last 30 days with results
    const tipsWithResults = await DatabaseService.query(`
      SELECT bt.*, tp.actual_result, tp.profit_loss
      FROM betting_tips bt
      LEFT JOIN tip_performance tp ON bt.id = tp.tip_id
      WHERE bt.published_at >= NOW() - INTERVAL '30 days'
      AND bt.is_published = true
    `);

    if (tipsWithResults.rows.length === 0) {
      console.log('No tips with results found for performance calculation');
      return;
    }

    // Calculate metrics
    const tips = tipsWithResults.rows;
    const completedTips = tips.filter(t => t.actual_result);
    
    if (completedTips.length === 0) {
      console.log('No completed tips found for performance calculation');
      return;
    }

    const winCount = completedTips.filter(t => t.actual_result === 'win').length;
    const winRate = (winCount / completedTips.length) * 100;
    const totalProfit = completedTips.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
    const roi = completedTips.length > 0 ? (totalProfit / completedTips.length) * 100 : 0;

    // Store performance metrics
    await DatabaseService.query(`
      INSERT INTO system_config (key, value, description)
      VALUES 
        ('PERFORMANCE_WIN_RATE_30D', $1, '30-day win rate percentage'),
        ('PERFORMANCE_ROI_30D', $2, '30-day ROI percentage'),
        ('PERFORMANCE_TOTAL_TIPS_30D', $3, 'Total tips in last 30 days'),
        ('PERFORMANCE_COMPLETED_TIPS_30D', $4, 'Completed tips in last 30 days')
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
    `, [
      winRate.toFixed(2),
      roi.toFixed(2),
      tips.length.toString(),
      completedTips.length.toString()
    ]);

    console.log(`📊 Performance: ${winRate.toFixed(1)}% win rate, ${roi.toFixed(2)}% ROI (${completedTips.length} completed tips)`);
  }

  // Manual control functions
  static async startJob(jobName: string) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.start();
      this.jobStatus.set(jobName, true);
      console.log(`▶️ Started job: ${jobName}`);
    } else {
      throw new Error(`Job not found: ${jobName}`);
    }
  }

  static async stopJob(jobName: string) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      this.jobStatus.set(jobName, false);
      console.log(`⏹️ Stopped job: ${jobName}`);
    } else {
      throw new Error(`Job not found: ${jobName}`);
    }
  }

  static async stopAllJobs() {
    for (const [name, job] of this.jobs) {
      job.stop();
      this.jobStatus.set(name, false);
      console.log(`🛑 Stopped job: ${name}`);
    }
    this.jobs.clear();
    this.jobStatus.clear();
    this.isInitialized = false;
    console.log('🛑 All scheduled jobs stopped');
  }

  static getJobStatus() {
    const status: { [key: string]: boolean } = {};
    for (const [name] of this.jobs) {
      status[name] = this.jobStatus.get(name) || false;
    }
    return {
      ...status,
      isInitialized: this.isInitialized,
      totalJobs: this.jobs.size,
      serverTime: new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })
    };
  }

  // Manual triggers
  static async triggerDailyGeneration() {
    console.log('🔄 Manually triggering daily tip generation...');
    try {
      await AutomationPipeline.generateDailyTips();
      console.log('✅ Manual tip generation completed');
    } catch (error) {
      console.error('❌ Manual tip generation failed:', error);
      throw error;
    }
  }

  static async triggerOddsUpdate() {
    console.log('🔄 Manually triggering odds update...');
    try {
      await this.updateBettingOdds();
      console.log('✅ Manual odds update completed');
    } catch (error) {
      console.error('❌ Manual odds update failed:', error);
      throw error;
    }
  }

  // Utility functions
  private static async logScheduledExecution(
    jobType: string, 
    status: 'success' | 'failed', 
    duration: number, 
    error?: any
  ) {
    try {
      await DatabaseService.query(`
        INSERT INTO analysis_logs (analysis_type, status, execution_time_ms, error_message)
        VALUES ($1, $2, $3, $4)
      `, [
        `SCHEDULED_${jobType}`,
        status,
        duration,
        error ? (error instanceof Error ? error.message : String(error)) : null
      ]);
    } catch (logError) {
      console.error('Failed to log scheduled execution:', logError);
    }
  }

  private static async sendAlert(subject: string, error: any) {
    // In a production environment, this would send emails/notifications
    // For now, just log the alert
    console.error(`🚨 ALERT: ${subject}`, error);
    
    // Store alert in database
    try {
      await DatabaseService.query(`
        INSERT INTO system_config (key, value, description)
        VALUES ('LAST_ALERT', $1, 'Last system alert')
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = CURRENT_TIMESTAMP
      `, [`${subject}: ${error instanceof Error ? error.message : String(error)}`]);
    } catch (dbError) {
      console.error('Failed to store alert:', dbError);
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in server initialization
export default SchedulerService;