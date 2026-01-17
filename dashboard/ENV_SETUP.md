# Environment Variables Setup

To use the FPL Luck Finder with live data, you'll need to configure the following environment variables:

## Required for API-Football Integration

```bash
# API-Football API Key (get from https://www.api-football.com/)
API_FOOTBALL_KEY=your_api_key_here
```

## Required for Supabase Caching

```bash
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anonymous Key (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Supabase Service Role Key (server-side only, for write operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Supabase Table Schema

Create a table called `player_luck_data` with the following schema:

```sql
CREATE TABLE player_luck_data (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL,
  gameweek INTEGER NOT NULL,
  season VARCHAR(20) NOT NULL,
  player_name VARCHAR(255) NOT NULL,
  team VARCHAR(255) NOT NULL,
  team_short VARCHAR(10) NOT NULL,
  position VARCHAR(50),
  photo TEXT,
  price DECIMAL(5,2),
  actual_goals INTEGER,
  xg DECIMAL(5,2),
  luck_score DECIMAL(5,2),
  verdict VARCHAR(10),
  verdict_label VARCHAR(100),
  differential_value DECIMAL(5,2),
  haul_potential DECIMAL(5,2),
  trap_indicator DECIMAL(5,2),
  fixtures JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(player_id, gameweek, season)
);
```

## Demo Mode

If you don't provide an `API_FOOTBALL_KEY`, the app will automatically use demo data to showcase the functionality.
