import { DatabaseService, initializeDatabase } from './database';
import { SchedulerService } from './scheduler';
import { MonitoringService, setupGlobalErrorHandling } from './monitoring';

// System Startup and Initialization
export class StartupService {
  
  static async initializeSystem(): Promise<void> {
    console.log('🚀 Initializing Vault Bets Automation System...');
    
    try {
      // 1. Setup global error handling
      setupGlobalErrorHandling();
      console.log('✅ Global error handling configured');
      
      // 2. Initialize database connection
      await initializeDatabase();
      console.log('✅ Database connection established');
      
      // 3. Check database schema and configuration
      await this.validateDatabaseSetup();
      console.log('✅ Database schema validated');
      
      // 4. Initialize default system configuration
      await this.initializeDefaultConfiguration();
      console.log('✅ Default configuration initialized');
      
      // 5. Initialize monitoring system
      await this.initializeMonitoring();
      console.log('✅ Monitoring system initialized');
      
      // 6. Initialize scheduler (only in production or when explicitly enabled)
      if (process.env.ENABLE_AUTO_GENERATION !== 'false') {
        await SchedulerService.initialize();
        console.log('✅ Scheduler service initialized');
      } else {
        console.log('⏸️ Scheduler disabled by configuration');
      }
      
      // 7. Perform initial health check
      const healthCheck = await MonitoringService.performComprehensiveHealthCheck();
      console.log(`✅ Initial health check: ${healthCheck.status.toUpperCase()}`);
      
      if (healthCheck.issues.length > 0) {
        console.warn('⚠️ Health check issues:', healthCheck.issues);
      }
      
      // 8. Log successful startup
      await MonitoringService.logSuccess({
        component: 'STARTUP_SERVICE',
        action: 'SYSTEM_INITIALIZATION',
        additionalData: { 
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          healthStatus: healthCheck.status
        }
      });
      
      console.log('🎉 Vault Bets Automation System initialized successfully!');
      console.log(`📊 System Status: ${healthCheck.status.toUpperCase()}`);
      
    } catch (error) {
      console.error('💥 System initialization failed:', error);
      
      await MonitoringService.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          component: 'STARTUP_SERVICE',
          action: 'SYSTEM_INITIALIZATION',
          severity: MonitoringService.SEVERITY.CRITICAL
        }
      );
      
      throw error;
    }
  }
  
  // Validate database schema exists and is up to date
  private static async validateDatabaseSetup(): Promise<void> {
    try {
      // Check if required tables exist
      const requiredTables = [
        'leagues', 'teams', 'players', 'matches', 'betting_tips', 
        'tip_analysis', 'betting_odds', 'system_config', 'analysis_logs'
      ];
      
      for (const table of requiredTables) {
        const result = await DatabaseService.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = $1
          );
        `, [table]);
        
        if (!result.rows[0].exists) {
          throw new Error(`Required table '${table}' not found. Please run database migration.`);
        }
      }
      
      console.log(`✅ All ${requiredTables.length} required tables verified`);
      
    } catch (error) {
      console.error('❌ Database validation failed:', error);
      throw new Error(`Database validation failed: ${error}`);
    }
  }
  
  // Initialize default system configuration
  private static async initializeDefaultConfiguration(): Promise<void> {
    const defaultConfig = [
      { key: 'MAX_TIPS_PER_DAY', value: '6', description: 'Maximum number of tips to generate per day' },
      { key: 'MIN_CONFIDENCE_THRESHOLD', value: '65', description: 'Minimum confidence score for publishing tips' },
      { key: 'DAILY_GENERATION_TIME', value: '08:00', description: 'Time to generate daily tips (HH:MM format)' },
      { key: 'FREE_TIPS_PER_DAY', value: '1', description: 'Number of free tips available per day' },
      { key: 'ODDS_UPDATE_INTERVAL_MINUTES', value: '30', description: 'How often to update betting odds' },
      { key: 'ANALYSIS_LOOKBACK_DAYS', value: '90', description: 'Days of historical data to analyze' },
      { key: 'WEATHER_API_ENABLED', value: 'true', description: 'Enable weather data in analysis' },
      { key: 'AUTO_PUBLISH_ENABLED', value: 'true', description: 'Enable automatic tip publishing' },
      { key: 'DATA_CLEANUP_TIME', value: '02:00', description: 'Time to perform data cleanup (HH:MM format)' },
      { key: 'SYSTEM_VERSION', value: process.env.npm_package_version || '1.0.0', description: 'Current system version' },
      { key: 'SYSTEM_INITIALIZED_AT', value: new Date().toISOString(), description: 'System initialization timestamp' }
    ];
    
    for (const config of defaultConfig) {
      try {
        await DatabaseService.query(`
          INSERT INTO system_config (key, value, description)
          VALUES ($1, $2, $3)
          ON CONFLICT (key) DO NOTHING
        `, [config.key, config.value, config.description]);
      } catch (error) {
        console.warn(`Failed to set default config for ${config.key}:`, error);
      }
    }
    
    console.log(`✅ ${defaultConfig.length} configuration keys initialized`);
  }
  
  // Initialize monitoring system
  private static async initializeMonitoring(): Promise<void> {
    try {
      // Create initial monitoring dashboard entry
      const dashboardData = await MonitoringService.getMonitoringDashboard();
      
      await DatabaseService.query(`
        INSERT INTO system_config (key, value, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = CURRENT_TIMESTAMP
      `, [
        'MONITORING_DASHBOARD_INITIALIZED',
        new Date().toISOString(),
        'Monitoring system initialization timestamp'
      ]);
      
      console.log('✅ Monitoring dashboard initialized');
      
    } catch (error) {
      console.warn('⚠️ Monitoring initialization had issues:', error);
      // Don't fail startup if monitoring has issues
    }
  }
  
  // Graceful shutdown
  static async shutdown(): Promise<void> {
    console.log('🛑 Initiating graceful shutdown...');
    
    try {
      // Stop all scheduled jobs
      await SchedulerService.stopAllJobs();
      console.log('✅ All scheduled jobs stopped');
      
      // Log shutdown
      await MonitoringService.logSuccess({
        component: 'STARTUP_SERVICE',
        action: 'SYSTEM_SHUTDOWN',
        additionalData: { 
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        }
      });
      
      console.log('✅ Graceful shutdown completed');
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      
      await MonitoringService.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          component: 'STARTUP_SERVICE',
          action: 'SYSTEM_SHUTDOWN',
          severity: MonitoringService.SEVERITY.HIGH
        }
      );
    }
  }
  
  // System status check
  static async getSystemStatus() {
    try {
      const [dbConnected, healthCheck] = await Promise.all([
        DatabaseService.testConnection(),
        MonitoringService.performComprehensiveHealthCheck()
      ]);
      
      const schedulerStatus = SchedulerService.getJobStatus();
      
      // Get system configuration
      const systemConfig = await DatabaseService.query(`
        SELECT key, value, updated_at
        FROM system_config
        WHERE key IN (
          'SYSTEM_VERSION', 'SYSTEM_INITIALIZED_AT', 'LAST_GENERATION_DATE',
          'LAST_GENERATION_PUBLISHED', 'PERFORMANCE_WIN_RATE_30D'
        )
      `);
      
      const config: { [key: string]: string } = {};
      systemConfig.rows.forEach(row => {
        config[row.key] = row.value;
      });
      
      return {
        status: healthCheck.status,
        database: { connected: dbConnected },
        scheduler: {
          initialized: Object.keys(schedulerStatus).length > 0,
          jobs: schedulerStatus
        },
        health: {
          checks: healthCheck.checks,
          issues: healthCheck.issues
        },
        system: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          version: config.SYSTEM_VERSION,
          initializedAt: config.SYSTEM_INITIALIZED_AT,
          lastGeneration: config.LAST_GENERATION_DATE,
          lastPublished: config.LAST_GENERATION_PUBLISHED,
          winRate: config.PERFORMANCE_WIN_RATE_30D
        }
      };
      
    } catch (error) {
      console.error('Failed to get system status:', error);
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  // Development mode initialization
  static async initializeDevelopmentMode(): Promise<void> {
    console.log('🔧 Initializing development mode...');
    
    try {
      // Disable auto-publishing in development
      await DatabaseService.setConfig('AUTO_PUBLISH_ENABLED', 'false', 'Disabled for development');
      
      // Reduce tip generation frequency
      await DatabaseService.setConfig('MAX_TIPS_PER_DAY', '2', 'Reduced for development');
      
      // Enable verbose logging
      await DatabaseService.setConfig('LOG_LEVEL', 'debug', 'Verbose logging for development');
      
      console.log('✅ Development mode configured');
      
    } catch (error) {
      console.error('❌ Failed to initialize development mode:', error);
    }
  }
  
  // Production mode initialization
  static async initializeProductionMode(): Promise<void> {
    console.log('🏭 Initializing production mode...');
    
    try {
      // Enable all production features
      await DatabaseService.setConfig('AUTO_PUBLISH_ENABLED', 'true', 'Enabled for production');
      await DatabaseService.setConfig('LOG_LEVEL', 'info', 'Standard logging for production');
      
      // Set production API rate limits
      await DatabaseService.setConfig('API_RATE_LIMIT_ENABLED', 'true', 'Enable rate limiting');
      
      console.log('✅ Production mode configured');
      
    } catch (error) {
      console.error('❌ Failed to initialize production mode:', error);
    }
  }
}

// Setup process event handlers for graceful shutdown
export function setupProcessHandlers(): void {
  // Graceful shutdown on SIGTERM
  process.on('SIGTERM', async () => {
    console.log('📡 Received SIGTERM, starting graceful shutdown...');
    await StartupService.shutdown();
    process.exit(0);
  });
  
  // Graceful shutdown on SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    console.log('📡 Received SIGINT, starting graceful shutdown...');
    await StartupService.shutdown();
    process.exit(0);
  });
  
  console.log('✅ Process handlers configured for graceful shutdown');
}

export default StartupService;