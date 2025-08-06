'use client';

import { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Database,
  Zap,
  DollarSign,
  BarChart3,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  PlayCircle,
  Settings
} from 'lucide-react';
import VaultLogo from '@/components/VaultLogo';

interface AutomationStatus {
  jobStatus: { [key: string]: boolean };
  recentLogs: any[];
  performanceMetrics: any[];
  apiUsage: any[];
  tipStats: any;
  systemHealth: {
    uptime: number;
    memoryUsage: any;
    timestamp: string;
  };
}

export default function AdminDashboard() {
  const [status, setStatus] = useState<AutomationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch automation status
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/automation');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch status:', data.error);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Execute automation action
  const executeAction = async (action: string, jobName?: string) => {
    setActionLoading(action);
    try {
      const response = await fetch('/api/admin/automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, jobName }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Action executed successfully:', data.data.message);
        // Refresh status after action
        await fetchStatus();
      } else {
        console.error('Action failed:', data.error);
      }
    } catch (error) {
      console.error('Error executing action:', error);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent-purple/20 border-t-accent-purple mx-auto mb-6"></div>
          <div className="text-white text-xl font-medium">Loading Admin Dashboard...</div>
        </div>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-accent-green' : 'text-red-400';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800">
      {/* Header */}
      <header className="border-b border-gray-800/50 glass-effect-strong backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <VaultLogo size={48} className="animate-glow-pulse" />
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
                <p className="text-accent-cyan text-sm font-medium">Automation & Monitoring Control</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <button
                onClick={fetchStatus}
                className="flex items-center gap-2 px-4 py-2 bg-dark-100 text-white rounded-xl hover:bg-dark-50 transition-all duration-300 glass-effect border border-gray-700/50 hover:border-accent-cyan/30"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {status && (
          <div className="space-y-8">
            {/* System Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 glass-effect-strong border border-gray-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-6 h-6 text-accent-green" />
                  <h3 className="text-white font-semibold">System Health</h3>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-accent-green">Online</div>
                  <div className="text-sm text-gray-400">Uptime: {formatUptime(status.systemHealth.uptime)}</div>
                  <div className="text-sm text-gray-400">Memory: {formatMemory(status.systemHealth.memoryUsage.heapUsed)}</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 glass-effect-strong border border-gray-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-accent-cyan" />
                  <h3 className="text-white font-semibold">Tips Generated</h3>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-accent-cyan">{status.tipStats.total_tips || 0}</div>
                  <div className="text-sm text-gray-400">Published: {status.tipStats.published_tips || 0}</div>
                  <div className="text-sm text-gray-400">Avg Confidence: {parseFloat(status.tipStats.avg_confidence || 0).toFixed(1)}%</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 glass-effect-strong border border-gray-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-accent-green" />
                  <h3 className="text-white font-semibold">Performance</h3>
                </div>
                <div className="space-y-2">
                  {status.performanceMetrics.find(m => m.key === 'PERFORMANCE_WIN_RATE_30D') ? (
                    <>
                      <div className="text-2xl font-bold text-accent-green">
                        {parseFloat(status.performanceMetrics.find(m => m.key === 'PERFORMANCE_WIN_RATE_30D')?.value || '0').toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">Win Rate (30d)</div>
                      <div className="text-sm text-gray-400">
                        ROI: {parseFloat(status.performanceMetrics.find(m => m.key === 'PERFORMANCE_ROI_30D')?.value || '0').toFixed(1)}%
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-gray-400">N/A</div>
                      <div className="text-sm text-gray-400">No data available</div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 glass-effect-strong border border-gray-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6 text-accent-pink" />
                  <h3 className="text-white font-semibold">API Costs</h3>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-accent-pink">
                    ${status.apiUsage.reduce((sum, api) => sum + parseFloat(api.total_cost || 0), 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">Last 7 days</div>
                  <div className="text-sm text-gray-400">
                    Requests: {status.apiUsage.reduce((sum, api) => sum + parseInt(api.total_requests || 0), 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Job Status and Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 glass-effect-strong border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Scheduled Jobs
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(status.jobStatus).map(([jobName, isActive]) => (
                    <div key={jobName} className="flex items-center justify-between p-4 bg-dark-300/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={getStatusColor(isActive)}>
                          {getStatusIcon(isActive)}
                        </div>
                        <div>
                          <div className="text-white font-medium">{jobName.replace(/([A-Z])/g, ' $1').trim()}</div>
                          <div className={`text-sm ${getStatusColor(isActive)}`}>
                            {isActive ? 'Running' : 'Stopped'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => executeAction(isActive ? 'stop_job' : 'start_job', jobName)}
                          disabled={actionLoading !== null}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-all ${
                            isActive 
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                              : 'bg-accent-green/20 text-accent-green hover:bg-accent-green/30'
                          }`}
                        >
                          {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          {isActive ? 'Stop' : 'Start'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Controls */}
              <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 glass-effect-strong border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Manual Controls
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => executeAction('trigger_daily_generation')}
                    disabled={actionLoading !== null}
                    className="flex items-center justify-center gap-3 p-4 bg-accent-purple/20 text-accent-purple rounded-xl hover:bg-accent-purple/30 transition-all border border-accent-purple/30"
                  >
                    <Zap className="w-5 h-5" />
                    {actionLoading === 'trigger_daily_generation' ? 'Generating...' : 'Generate Daily Tips'}
                  </button>
                  
                  <button
                    onClick={() => executeAction('trigger_odds_update')}
                    disabled={actionLoading !== null}
                    className="flex items-center justify-center gap-3 p-4 bg-accent-cyan/20 text-accent-cyan rounded-xl hover:bg-accent-cyan/30 transition-all border border-accent-cyan/30"
                  >
                    <TrendingUp className="w-5 h-5" />
                    {actionLoading === 'trigger_odds_update' ? 'Updating...' : 'Update Betting Odds'}
                  </button>
                  
                  <button
                    onClick={() => executeAction('test_pipeline')}
                    disabled={actionLoading !== null}
                    className="flex items-center justify-center gap-3 p-4 bg-accent-green/20 text-accent-green rounded-xl hover:bg-accent-green/30 transition-all border border-accent-green/30"
                  >
                    <Activity className="w-5 h-5" />
                    {actionLoading === 'test_pipeline' ? 'Testing...' : 'Test Pipeline'}
                  </button>
                  
                  <button
                    onClick={() => executeAction('initialize_scheduler')}
                    disabled={actionLoading !== null}
                    className="flex items-center justify-center gap-3 p-4 bg-accent-pink/20 text-accent-pink rounded-xl hover:bg-accent-pink/30 transition-all border border-accent-pink/30"
                  >
                    <Clock className="w-5 h-5" />
                    {actionLoading === 'initialize_scheduler' ? 'Initializing...' : 'Initialize Scheduler'}
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Execution Logs */}
            <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 glass-effect-strong border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Recent Execution Logs
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Duration</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Time</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {status.recentLogs.slice(0, 10).map((log, index) => (
                      <tr key={index} className="border-b border-gray-700/50">
                        <td className="py-3 px-4 text-white font-medium">
                          {log.analysis_type.replace('SCHEDULED_', '').replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            log.status === 'success' 
                              ? 'bg-accent-green/20 text-accent-green' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {log.status === 'success' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {log.execution_time_ms ? `${log.execution_time_ms}ms` : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-red-400 text-sm max-w-xs truncate">
                          {log.error_message || 'None'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* API Usage Breakdown */}
            <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 glass-effect-strong border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                API Usage (Last 7 Days)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {status.apiUsage.map((api, index) => (
                  <div key={index} className="p-4 bg-dark-300/50 rounded-xl">
                    <div className="text-white font-medium mb-2">{api.api_provider}</div>
                    <div className="text-2xl font-bold text-accent-cyan mb-1">{api.total_requests}</div>
                    <div className="text-sm text-gray-400">requests</div>
                    <div className="text-accent-pink font-medium">${parseFloat(api.total_cost || 0).toFixed(4)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}