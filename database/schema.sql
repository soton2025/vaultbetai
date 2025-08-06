-- Vault Bets Automated Betting System Database Schema
-- Comprehensive schema for fully automated betting tips platform

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leagues/Competitions table
CREATE TABLE leagues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    api_id VARCHAR(100) UNIQUE, -- External API identifier
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50),
    logo_url TEXT,
    league_id UUID REFERENCES leagues(id),
    api_id VARCHAR(100) UNIQUE, -- External API identifier
    venue_name VARCHAR(255),
    venue_capacity INTEGER,
    founded_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    team_id UUID REFERENCES teams(id),
    position VARCHAR(50),
    jersey_number INTEGER,
    api_id VARCHAR(100) UNIQUE,
    birth_date DATE,
    nationality VARCHAR(100),
    market_value DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player status tracking (injuries, suspensions, etc.)
CREATE TABLE player_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id),
    status VARCHAR(50) NOT NULL, -- available, injured, suspended, doubtful
    importance VARCHAR(20) DEFAULT 'squad', -- key, important, squad
    reason TEXT,
    start_date TIMESTAMP,
    expected_return_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches/Fixtures table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_id VARCHAR(100) UNIQUE,
    league_id UUID REFERENCES leagues(id),
    home_team_id UUID REFERENCES teams(id),
    away_team_id UUID REFERENCES teams(id),
    match_date TIMESTAMP NOT NULL,
    venue VARCHAR(255),
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, live, completed, postponed, cancelled
    home_score INTEGER,
    away_score INTEGER,
    weather_conditions TEXT,
    temperature INTEGER,
    attendance INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team statistics (updated regularly)
CREATE TABLE team_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id),
    season VARCHAR(20),
    matches_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    home_wins INTEGER DEFAULT 0,
    home_draws INTEGER DEFAULT 0,
    home_losses INTEGER DEFAULT 0,
    away_wins INTEGER DEFAULT 0,
    away_draws INTEGER DEFAULT 0,
    away_losses INTEGER DEFAULT 0,
    current_form VARCHAR(10), -- Recent 5 matches: 'WWDLW'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, season)
);

-- Head-to-head records
CREATE TABLE head_to_head (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    home_team_id UUID REFERENCES teams(id),
    away_team_id UUID REFERENCES teams(id),
    total_meetings INTEGER DEFAULT 0,
    home_wins INTEGER DEFAULT 0,
    away_wins INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    last_meeting_date TIMESTAMP,
    last_meeting_score VARCHAR(20),
    last_meeting_result VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(home_team_id, away_team_id)
);

-- Betting odds tracking
CREATE TABLE betting_odds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id),
    bookmaker VARCHAR(100) NOT NULL,
    bet_type VARCHAR(50) NOT NULL, -- home_win, away_win, draw, over_2_5, under_2_5, btts
    odds DECIMAL(5,2) NOT NULL,
    is_opening_odds BOOLEAN DEFAULT false,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Betting tips/predictions
CREATE TABLE betting_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id),
    bet_type VARCHAR(50) NOT NULL,
    recommended_odds DECIMAL(5,2),
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    explanation TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    result VARCHAR(20), -- win, loss, push (for tracking performance)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detailed analysis data for premium tips
CREATE TABLE tip_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tip_id UUID REFERENCES betting_tips(id),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 10),
    implied_probability DECIMAL(5,2),
    model_probability DECIMAL(5,2),
    risk_factors TEXT[], -- Array of risk factor strings
    weather_impact VARCHAR(20), -- positive, neutral, negative
    venue_advantage_percentage INTEGER,
    market_movement VARCHAR(20), -- backing, drifting, stable
    betting_volume VARCHAR(20), -- high, medium, low
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analysis generation logs (for monitoring automation)
CREATE TABLE analysis_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id),
    analysis_type VARCHAR(100),
    status VARCHAR(50), -- success, failed, in_progress
    execution_time_ms INTEGER,
    error_message TEXT,
    data_sources_used TEXT[], -- Array of API sources used
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System configuration for automation
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API usage tracking
CREATE TABLE api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_provider VARCHAR(100) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    requests_made INTEGER DEFAULT 1,
    date DATE DEFAULT CURRENT_DATE,
    cost_estimate DECIMAL(10,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(api_provider, endpoint, date)
);

-- User subscription tracking (existing users)
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL, -- Stripe customer ID or internal user ID
    email VARCHAR(255),
    subscription_status VARCHAR(50), -- active, inactive, cancelled, past_due
    subscription_tier VARCHAR(50) DEFAULT 'premium', -- free, premium, pro
    tips_accessed_today INTEGER DEFAULT 0,
    free_tip_used_today BOOLEAN DEFAULT false,
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance tracking for tips
CREATE TABLE tip_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tip_id UUID REFERENCES betting_tips(id),
    actual_result VARCHAR(20), -- win, loss, push
    profit_loss DECIMAL(10,2), -- Based on unit stakes
    closing_odds DECIMAL(5,2),
    result_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_betting_tips_published ON betting_tips(is_published, published_at);
CREATE INDEX idx_betting_odds_match_type ON betting_odds(match_id, bet_type);
CREATE INDEX idx_team_stats_season ON team_stats(season, team_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(subscription_status);
CREATE INDEX idx_api_usage_date ON api_usage(date, api_provider);

-- Insert default system configuration
INSERT INTO system_config (key, value, description) VALUES 
('daily_tip_generation_time', '08:00', 'Time to generate daily tips (HH:MM format)'),
('max_tips_per_day', '6', 'Maximum number of tips to generate per day'),
('min_confidence_threshold', '65', 'Minimum confidence score for publishing tips'),
('free_tips_per_day', '1', 'Number of free tips available per day'),
('odds_update_interval_minutes', '30', 'How often to update betting odds'),
('analysis_lookback_days', '90', 'Days of historical data to analyze'),
('weather_api_enabled', 'true', 'Enable weather data in analysis'),
('auto_publish_enabled', 'true', 'Enable automatic tip publishing');

-- Add triggers to update the updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_stats_updated_at BEFORE UPDATE ON team_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_betting_tips_updated_at BEFORE UPDATE ON betting_tips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();