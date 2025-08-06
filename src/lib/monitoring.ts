import { DatabaseService } from './database';

// Error severity levels
const SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

type Severity = typeof SEVERITY[keyof typeof SEVERITY];

// Comprehensive Error Handling and Monitoring System
export class MonitoringService {
  private static errorCounts: Map<string, number> = new Map();
  private static lastAlert: Map<string, number> = new Map();
  private static readonly ALERT_THRESHOLD = 5; // Max errors before alert
  private static readonly ALERT_COOLDOWN = 60 * 60 * 1000; // 1 hour cooldown

  // Error severity levels
  static readonly SEVERITY = SEVERITY;

  // Log error with context and severity
  static async logError(
    error: Error | string,
    context: {
      component: string;
      action: string;
      userId?: string;
      additionalData?: any;
      severity?: Severity;
    }
  ) {
    try {
      const errorMessage = error instanceof Error ? error.message : error;
      const errorStack = error instanceof Error ? error.stack : null;
      const severity = context.severity || this.SEVERITY.MEDIUM;

      // Store in database
      await DatabaseService.query(`
        INSERT INTO analysis_logs (
          analysis_type, 
          status, 
          error_message, 
          data_sources_used
        ) VALUES ($1, $2, $3, $4)
      `, [
        `ERROR_${context.component.toUpperCase()}_${context.action.toUpperCase()}`,
        'failed',
        `[${severity.toUpperCase()}] ${errorMessage}${errorStack ? '\n' + errorStack : ''}`,
        context.additionalData ? [JSON.stringify(context.additionalData)] : []
      ]);

      // Track error counts for alerting
      const errorKey = `${context.component}_${context.action}`;
      const currentCount = this.errorCounts.get(errorKey) || 0;
      this.errorCounts.set(errorKey, currentCount + 1);

      // Console logging with color coding
      const timestamp = new Date().toISOString();
      console.error(`🚨 [${severity.toUpperCase()}] ${timestamp} - ${context.component}::${context.action}`);
      console.error(`   Error: ${errorMessage}`);
      if (context.userId) console.error(`   User: ${context.userId}`);
      if (context.additionalData) console.error(`   Data: ${JSON.stringify(context.additionalData, null, 2)}`);
      if (errorStack) console.error(`   Stack: ${errorStack}`);

      // Check if alert should be sent
      if (severity === this.SEVERITY.CRITICAL || currentCount >= this.ALERT_THRESHOLD) {
        await this.sendAlert(errorKey, {
          severity,
          count: currentCount,
          latestError: errorMessage,
          component: context.component,
          action: context.action,
          timestamp
        });
      }

      // Store performance impact metrics
      await this.trackPerformanceImpact(context.component, severity);

    } catch (monitoringError) {
      // Fallback logging if monitoring itself fails
      console.error('❌ Monitoring system failed:', monitoringError);
      console.error('📋 Original error:', error);
      console.error('📍 Original context:', context);
    }
  }

  // Log successful operations for performance tracking
  static async logSuccess(
    context: {
      component: string;
      action: string;
      duration?: number;
      userId?: string;
      additionalData?: any;
    }
  ) {
    try {
      await DatabaseService.query(`
        INSERT INTO analysis_logs (
          analysis_type, 
          status, 
          execution_time_ms,
          error_message,
          data_sources_used
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        `SUCCESS_${context.component.toUpperCase()}_${context.action.toUpperCase()}`,
        'success',
        context.duration || 0,
        context.userId || null,
        context.additionalData ? [JSON.stringify(context.additionalData)] : []
      ]);

      // Reset error count on successful operation
      const errorKey = `${context.component}_${context.action}`;
      this.errorCounts.delete(errorKey);

    } catch (error) {
      console.error('Failed to log success:', error);
    }
  }

  // Send alert for critical errors or error patterns
  private static async sendAlert(
    errorKey: string, 
    details: {
      severity: Severity;
      count: number;
      latestError: string;
      component: string;
      action: string;
      timestamp: string;
    }
  ) {
    // Check cooldown period
    const lastAlertTime = this.lastAlert.get(errorKey) || 0;
    if (Date.now() - lastAlertTime < this.ALERT_COOLDOWN) {
      return; // Skip alert due to cooldown
    }

    try {
      // Store alert in database
      await DatabaseService.query(`
        INSERT INTO system_config (key, value, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = CURRENT_TIMESTAMP
      `, [
        'LAST_CRITICAL_ALERT',
        JSON.stringify(details),
        `Critical alert for ${errorKey}`
      ]);

      // In production, this would send emails/Slack notifications
      console.error(`🚨 CRITICAL ALERT: ${errorKey}`);
      console.error(`   Severity: ${details.severity.toUpperCase()}`);
      console.error(`   Count: ${details.count} errors`);
      console.error(`   Component: ${details.component}`);
      console.error(`   Action: ${details.action}`);
      console.error(`   Latest Error: ${details.latestError}`);
      console.error(`   Time: ${details.timestamp}`);

      // Update last alert time
      this.lastAlert.set(errorKey, Date.now());

    } catch (alertError) {
      console.error('Failed to send alert:', alertError);
    }
  }

  // Track performance impact of errors
  private static async trackPerformanceImpact(component: string, severity: Severity) {
    const impactScore = {
      [this.SEVERITY.LOW]: 1,
      [this.SEVERITY.MEDIUM]: 3,
      [this.SEVERITY.HIGH]: 7,
      [this.SEVERITY.CRITICAL]: 10
    }[severity];

    try {
      await DatabaseService.query(`
        INSERT INTO system_config (key, value, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (key) DO UPDATE SET
          value = (COALESCE(system_config.value::integer, 0) + $2)::text,
          updated_at = CURRENT_TIMESTAMP
      `, [
        `ERROR_IMPACT_SCORE_${component.toUpperCase()}`,
        impactScore,
        `Cumulative error impact score for ${component}`
      ]);
    } catch (error) {
      console.error('Failed to track performance impact:', error);
    }
  }

  // Performance monitoring
  static async startPerformanceTimer(operation: string): Promise<() => Promise<void>> {
    const startTime = Date.now();
    
    return async () => {
      const duration = Date.now() - startTime;
      
      try {
        // Store performance metrics
        await DatabaseService.query(`
          INSERT INTO analysis_logs (
            analysis_type, 
            status, 
            execution_time_ms
          ) VALUES ($1, $2, $3)
        `, [
          `PERFORMANCE_${operation.toUpperCase()}`,
          'success',
          duration
        ]);

        // Alert on slow operations
        const slowThresholds = {
          'DATABASE_QUERY': 5000,
          'API_REQUEST': 10000,
          'ANALYSIS_GENERATION': 30000,
          'TIP_GENERATION': 60000
        };

        const threshold = slowThresholds[operation as keyof typeof slowThresholds] || 15000;
        
        if (duration > threshold) {
          await this.logError(
            `Slow operation detected: ${operation} took ${duration}ms`,
            {
              component: 'PERFORMANCE_MONITOR',
              action: 'SLOW_OPERATION',
              severity: this.SEVERITY.MEDIUM,
              additionalData: { operation, duration, threshold }
            }
          );
        }

      } catch (error) {
        console.error('Failed to log performance metrics:', error);
      }
    };
  }

  // Rate limiting monitoring
  static async trackRateLimit(
    service: string, 
    endpoint: string, 
    isLimitHit: boolean,
    remainingRequests?: number
  ) {
    try {
      await DatabaseService.query(`
        INSERT INTO api_usage (api_provider, endpoint, requests_made)
        VALUES ($1, $2, $3)
        ON CONFLICT (api_provider, endpoint, date) DO UPDATE SET
          requests_made = api_usage.requests_made + EXCLUDED.requests_made
      `, [service, endpoint, 1]);

      if (isLimitHit) {
        await this.logError(
          `Rate limit hit for ${service}::${endpoint}`,
          {
            component: 'API_CLIENT',
            action: 'RATE_LIMIT_HIT',
            severity: this.SEVERITY.HIGH,
            additionalData: { service, endpoint, remainingRequests }
          }
        );
      }

      // Alert if approaching rate limit (80% usage)
      if (remainingRequests !== undefined && remainingRequests > 0) {
        const totalRequests = await DatabaseService.query(`
          SELECT requests_made 
          FROM api_usage 
          WHERE api_provider = $1 AND endpoint = $2 AND date = CURRENT_DATE
        `, [service, endpoint]);
        
        const used = totalRequests.rows[0]?.requests_made || 0;
        const total = used + remainingRequests;
        const usagePercentage = (used / total) * 100;
        
        if (usagePercentage >= 80) {
          await this.logError(
            `High API usage: ${usagePercentage.toFixed(1)}% of rate limit used`,
            {
              component: 'API_CLIENT',
              action: 'HIGH_USAGE_WARNING',
              severity: this.SEVERITY.MEDIUM,
              additionalData: { service, endpoint, usagePercentage, used, total }
            }
          );
        }
      }

    } catch (error) {
      console.error('Failed to track rate limit:', error);
    }
  }

  // Health check monitoring
  static async performComprehensiveHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: { [key: string]: boolean };
    issues: string[];
  }> {
    const checks: { [key: string]: boolean } = {};
    const issues: string[] = [];

    try {
      // Database connectivity
      checks.database = await DatabaseService.testConnection();
      if (!checks.database) {
        issues.push('Database connection failed');
      }

      // Memory usage
      const memUsage = process.memoryUsage();
      const memoryThreshold = 1024 * 1024 * 1024; // 1GB
      checks.memory = memUsage.heapUsed < memoryThreshold;
      if (!checks.memory) {
        issues.push(`High memory usage: ${(memUsage.heapUsed / 1024 / 1024).toFixed(1)}MB`);
      }

      // Error rate check (last hour)
      const recentErrors = await DatabaseService.query(`
        SELECT COUNT(*) as error_count
        FROM analysis_logs 
        WHERE created_at >= NOW() - INTERVAL '1 hour'
        AND status = 'failed'
        AND analysis_type LIKE 'ERROR_%'
      `);
      
      const errorCount = parseInt(recentErrors.rows[0]?.error_count || '0');
      checks.errorRate = errorCount < 10; // Less than 10 errors per hour
      if (!checks.errorRate) {
        issues.push(`High error rate: ${errorCount} errors in last hour`);
      }

      // API availability check (basic)
      const apiHealthQuery = await DatabaseService.query(`
        SELECT 
          COUNT(*) as total_requests,
          COUNT(*) FILTER (WHERE error_message IS NOT NULL) as failed_requests
        FROM analysis_logs
        WHERE created_at >= NOW() - INTERVAL '1 hour'
        AND analysis_type LIKE '%API%'
      `);
      
      const apiData = apiHealthQuery.rows[0];
      const apiFailureRate = apiData.total_requests > 0 ? 
        (apiData.failed_requests / apiData.total_requests) : 0;
      checks.apiHealth = apiFailureRate < 0.1; // Less than 10% failure rate
      if (!checks.apiHealth) {
        issues.push(`High API failure rate: ${(apiFailureRate * 100).toFixed(1)}%`);
      }

      // Determine overall status
      const healthyChecks = Object.values(checks).filter(Boolean).length;
      const totalChecks = Object.keys(checks).length;
      const healthPercentage = (healthyChecks / totalChecks) * 100;

      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (healthPercentage >= 90) {
        status = 'healthy';
      } else if (healthPercentage >= 70) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      // Log health check results
      await this.logSuccess({
        component: 'HEALTH_MONITOR',
        action: 'COMPREHENSIVE_CHECK',
        additionalData: { status, healthPercentage, checks, issues }
      });

      return { status, checks, issues };

    } catch (error) {
      await this.logError(error instanceof Error ? error : new Error(String(error)), {
        component: 'HEALTH_MONITOR',
        action: 'COMPREHENSIVE_CHECK',
        severity: this.SEVERITY.HIGH
      });

      return {
        status: 'unhealthy',
        checks: { healthCheck: false },
        issues: ['Health check system failure']
      };
    }
  }

  // Get monitoring dashboard data
  static async getMonitoringDashboard() {
    try {
      // Error summary (last 24 hours)
      const errorSummary = await DatabaseService.query(`
        SELECT 
          analysis_type,
          COUNT(*) as count,
          MAX(created_at) as latest_occurrence
        FROM analysis_logs 
        WHERE created_at >= NOW() - INTERVAL '24 hours'
        AND status = 'failed'
        AND analysis_type LIKE 'ERROR_%'
        GROUP BY analysis_type
        ORDER BY count DESC
        LIMIT 10
      `);

      // Performance metrics (last 24 hours)
      const performanceMetrics = await DatabaseService.query(`
        SELECT 
          analysis_type,
          COUNT(*) as count,
          AVG(execution_time_ms) as avg_duration,
          MAX(execution_time_ms) as max_duration
        FROM analysis_logs 
        WHERE created_at >= NOW() - INTERVAL '24 hours'
        AND status = 'success'
        AND analysis_type LIKE 'PERFORMANCE_%'
        GROUP BY analysis_type
        ORDER BY avg_duration DESC
      `);

      // System alerts (last 7 days)
      const systemAlerts = await DatabaseService.query(`
        SELECT key, value, updated_at
        FROM system_config
        WHERE key LIKE '%ALERT%' OR key LIKE '%ERROR_IMPACT%'
        ORDER BY updated_at DESC
        LIMIT 20
      `);

      return {
        errorSummary: errorSummary.rows,
        performanceMetrics: performanceMetrics.rows,
        systemAlerts: systemAlerts.rows,
        currentErrorCounts: Object.fromEntries(this.errorCounts),
        alertCooldowns: Object.fromEntries(this.lastAlert)
      };

    } catch (error) {
      await this.logError(error instanceof Error ? error : new Error(String(error)), {
        component: 'MONITORING_SERVICE',
        action: 'GET_DASHBOARD',
        severity: this.SEVERITY.MEDIUM
      });
      throw error;
    }
  }

  // Cleanup old monitoring data
  static async cleanupMonitoringData(daysToKeep: number = 90) {
    try {
      const deletedRows = await DatabaseService.query(`
        DELETE FROM analysis_logs 
        WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'
        AND (analysis_type LIKE 'ERROR_%' OR analysis_type LIKE 'PERFORMANCE_%')
      `);

      await this.logSuccess({
        component: 'MONITORING_SERVICE',
        action: 'CLEANUP_DATA',
        additionalData: { deletedRows: deletedRows.rowCount, daysToKeep }
      });

    } catch (error) {
      await this.logError(error instanceof Error ? error : new Error(String(error)), {
        component: 'MONITORING_SERVICE',
        action: 'CLEANUP_DATA',
        severity: this.SEVERITY.MEDIUM
      });
    }
  }
}

// Global error handler
export function setupGlobalErrorHandling() {
  // Uncaught exceptions
  process.on('uncaughtException', async (error) => {
    await MonitoringService.logError(error, {
      component: 'GLOBAL_HANDLER',
      action: 'UNCAUGHT_EXCEPTION',
      severity: MonitoringService.SEVERITY.CRITICAL
    });
    
    console.error('🚨 CRITICAL: Uncaught Exception - Process may exit');
    // In production, you might want to gracefully shutdown here
  });

  // Unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    await MonitoringService.logError(
      reason instanceof Error ? reason : new Error(String(reason)), 
      {
        component: 'GLOBAL_HANDLER',
        action: 'UNHANDLED_REJECTION',
        severity: MonitoringService.SEVERITY.HIGH,
        additionalData: { promise: promise.toString() }
      }
    );
  });

  // Process warnings
  process.on('warning', async (warning) => {
    await MonitoringService.logError(warning, {
      component: 'GLOBAL_HANDLER',
      action: 'PROCESS_WARNING',
      severity: MonitoringService.SEVERITY.LOW
    });
  });

  console.log('✅ Global error handling configured');
}

export default MonitoringService;