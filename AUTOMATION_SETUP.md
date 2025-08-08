# Automated Daily Bet Generation Setup

This guide explains how to set up and manage the automated daily bet generation system that runs at 9:00 AM UK time.

## 🕐 Current Schedule

- **Daily Tip Generation**: 9:00 AM UK time (Europe/London timezone)
- **Odds Updates**: Every 30 minutes
- **Health Checks**: Every 15 minutes
- **Data Cleanup**: 2:00 AM UK time daily
- **Performance Tracking**: Midnight UK time daily

## 🚀 Quick Setup

### 1. Update Configuration

Run the configuration update script to set the daily generation time to 9:00 AM UK time:

```bash
node update-daily-time.js
```

This script will:
- Set `DAILY_GENERATION_TIME` to `09:00`
- Enable auto-generation and auto-publishing
- Update both new and legacy configuration keys

### 2. Test Configuration

Verify the scheduler is properly configured:

```bash
node test-scheduler.js
```

This will show:
- Current configuration settings
- Next scheduled run time
- Recent generation activity
- Manual testing instructions

### 3. Restart Application

Restart your application to pick up the new configuration:

```bash
npm run dev
# or
npm start
```

## 🔧 Manual Testing

### Test Daily Generation

You can manually trigger the daily generation process:

```bash
curl -X POST http://localhost:3000/api/admin/automation \
  -H "Content-Type: application/json" \
  -d '{"action": "trigger_daily_generation"}'
```

### Test Scheduler Status

Check if the scheduler is running:

```bash
curl -X GET http://localhost:3000/api/admin/automation
```

### Initialize Scheduler

If the scheduler isn't running, initialize it:

```bash
curl -X POST http://localhost:3000/api/admin/automation \
  -H "Content-Type: application/json" \
  -d '{"action": "initialize_scheduler"}'
```

## 📊 Monitoring

### Check Logs

The system logs all automation activity. Look for these messages:

```
🕐 Initializing scheduler service...
📅 Daily tip generation scheduled for 09:00 UK time (Europe/London)
✅ Scheduler service initialized successfully
```

### Database Logs

Check the `analysis_logs` table for execution history:

```sql
SELECT analysis_type, status, created_at, execution_time_ms, error_message
FROM analysis_logs 
WHERE analysis_type LIKE '%GENERATION%' OR analysis_type LIKE '%SCHEDULED%'
ORDER BY created_at DESC 
LIMIT 10;
```

### System Configuration

View current automation settings:

```sql
SELECT key, value, description 
FROM system_config 
WHERE key LIKE '%TIME%' OR key LIKE '%GENERATION%' OR key LIKE '%PUBLISH%'
ORDER BY key;
```

## ⚙️ Configuration Options

### Key Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `DAILY_GENERATION_TIME` | `09:00` | Time to generate daily tips (HH:MM format) |
| `AUTO_GENERATION_ENABLED` | `true` | Enable automatic tip generation |
| `AUTO_PUBLISH_ENABLED` | `true` | Enable automatic tip publishing |
| `MAX_TIPS_PER_DAY` | `6` | Maximum tips to generate per day |
| `MIN_CONFIDENCE_THRESHOLD` | `65` | Minimum confidence score for tips |
| `FREE_TIPS_PER_DAY` | `1` | Number of free tips per day |

### Update Configuration

To change any setting, use the database service:

```javascript
import { DatabaseService } from './src/lib/database';

// Update daily generation time
await DatabaseService.setConfig('DAILY_GENERATION_TIME', '10:00', 'Generate tips at 10:00 AM UK time');

// Disable auto-generation
await DatabaseService.setConfig('AUTO_GENERATION_ENABLED', 'false', 'Disable automatic generation');
```

## 🛠️ Troubleshooting

### Scheduler Not Starting

1. Check environment variables:
   ```bash
   echo $ENABLE_AUTO_GENERATION
   ```

2. Ensure the scheduler is enabled:
   ```bash
   # Set to 'true' or remove the variable
   export ENABLE_AUTO_GENERATION=true
   ```

3. Check for errors in application logs

### Tips Not Generating

1. Verify API keys are set:
   ```bash
   echo $SPORTS_API_KEY
   echo $CLAUDE_API_KEY
   ```

2. Check database connection:
   ```bash
   echo $DATABASE_URL
   ```

3. Test manual generation:
   ```bash
   node test-pipeline.js
   ```

### Timezone Issues

The system uses `Europe/London` timezone which automatically handles:
- GMT (UTC+0) during winter
- BST (UTC+1) during summer

If you need a different timezone, update the scheduler:

```javascript
// In src/lib/scheduler.ts
timezone: 'Europe/London' // Change to your preferred timezone
```

## 📈 Performance Monitoring

### Daily Statistics

The system tracks daily generation statistics:

```sql
SELECT key, value, description 
FROM system_config 
WHERE key LIKE 'LAST_GENERATION%'
ORDER BY key;
```

### Tip Performance

Monitor tip success rates:

```sql
SELECT 
  COUNT(*) as total_tips,
  COUNT(CASE WHEN actual_result = 'win' THEN 1 END) as wins,
  ROUND(COUNT(CASE WHEN actual_result = 'win' THEN 1 END) * 100.0 / COUNT(*), 2) as win_rate
FROM betting_tips bt
LEFT JOIN tip_performance tp ON bt.id = tp.tip_id
WHERE bt.published_at >= NOW() - INTERVAL '30 days';
```

## 🔄 Maintenance

### Regular Tasks

1. **Monitor logs** for failed generations
2. **Check API usage** to avoid rate limits
3. **Review performance** metrics weekly
4. **Update configuration** as needed

### Backup Configuration

Export current settings:

```sql
SELECT key, value, description 
FROM system_config 
WHERE key LIKE '%GENERATION%' OR key LIKE '%TIME%' OR key LIKE '%PUBLISH%'
ORDER BY key;
```

## 📞 Support

If you encounter issues:

1. Check the logs for error messages
2. Run the test scripts to verify configuration
3. Test manual generation to isolate issues
4. Review the troubleshooting section above

The automation system is designed to be robust and self-healing, but manual intervention may be needed for configuration changes or system issues.
