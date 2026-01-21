# Security & Data Integrity Protocol

> Production security checklist for FPL Axiom Dashboard deployment.

---

## 🔐 API Key Leakage Prevention

### Environment Variable Audit

**Rule:** Only variables prefixed with `NEXT_PUBLIC_` are exposed to the client bundle.

| Variable | Prefix | Client Exposed | Status |
|----------|--------|----------------|--------|
| `API_FOOTBALL_KEY` | None | ❌ No | [ ] Verified |
| `DATABASE_URL` | None | ❌ No | [ ] Verified |
| `NEXT_PUBLIC_SITE_URL` | `NEXT_PUBLIC_` | ✅ Yes (OK) | [ ] Verified |

### Bundle Scan Command

```bash
# Build the production bundle
npm run build

# Scan for leaked secrets in client bundles
grep -r "API_FOOTBALL_KEY\|api-football\|rapidapi" .next/static/chunks/ || echo "✅ No API keys found in client bundle"

# Scan for common secret patterns
grep -rE "(sk_live_|pk_live_|AKIA|AIza)" .next/static/chunks/ || echo "✅ No common API key patterns found"
```

### Verification Checklist

- [ ] **No API Keys in Client**: `grep` scan returns empty for sensitive variables
- [ ] **Server Components Only**: API calls are made in `page.tsx` (Server Components) or API routes
- [ ] **No Hardcoded Secrets**: Code review confirms no inline API keys
- [ ] **.env in .gitignore**: `.env.local` and `.env` are not committed to git

```bash
# Verify .gitignore
cat .gitignore | grep -E "\.env" || echo "⚠️ WARNING: .env not in .gitignore!"
```

---

## ⏱️ Rate Limiting Defense

### Caching Strategy

| Route | Cache Type | TTL | Revalidation |
|-------|------------|-----|--------------|
| `/` | ISR | 300s | `revalidate: 300` |
| `/teams` | ISR | 300s | `revalidate: 300` |
| `/team/[slug]` | ISR | 300s | `revalidate: 300` |
| `/luck` | ISR | 300s | `revalidate: 300` |
| `/matrix` | ISR | 300s | `revalidate: 300` |
| `/api/fpl/*` | SWR | 60s | `Cache-Control` header |

### Verification Checklist

- [ ] **ISR Configured**: All data-fetching pages have `export const revalidate = 300`
- [ ] **API Route Caching**: API routes return `Cache-Control: s-maxage=60, stale-while-revalidate`
- [ ] **No Client-Side Fetches to External APIs**: All API calls go through Next.js server
- [ ] **Request Deduplication**: Multiple components requesting same data share a single fetch

### Code Verification

```typescript
// Every page.tsx should have:
export const revalidate = 300; // 5 minutes

// API routes should have:
return new Response(data, {
  headers: {
    'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
  },
});
```

### Rate Limit Monitoring

```bash
# Check API-Football rate limit headers in response
curl -I "https://api-football-v1.p.rapidapi.com/v3/..." \
  -H "x-rapidapi-key: $API_FOOTBALL_KEY" 2>&1 | grep -i "x-ratelimit"
```

Expected headers:
- `x-ratelimit-requests-limit: 100`
- `x-ratelimit-requests-remaining: XX`

---

## 🚨 Red Flag Data Validation

### Anomaly Detection Thresholds

| Metric | Normal Range | Red Flag Threshold | Action |
|--------|--------------|-------------------|--------|
| Points Change (per GW) | -3 to +3 | ±50 overnight | Log + Alert |
| Goals (per match) | 0-6 | >10 | Reject data |
| xG (per match) | 0-5 | >8 | Log warning |
| Team Count | 20 | ≠20 | Block update |
| Player Count (per team) | 20-30 | <10 or >50 | Log warning |

### Validation Implementation

```typescript
// lib/validation.ts
interface DataValidation {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

function validateTeamData(team: TeamData, previousData?: TeamData): DataValidation {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Red Flag: Points jump
  if (previousData && Math.abs(team.Actual_Points - previousData.Actual_Points) > 50) {
    errors.push(`CRITICAL: ${team.Team} points changed by ${team.Actual_Points - previousData.Actual_Points}`);
  }
  
  // Red Flag: Impossible goals
  if (team.Goals_For > team.Matches * 10) {
    errors.push(`CRITICAL: ${team.Team} has impossible goals (${team.Goals_For} in ${team.Matches} games)`);
  }
  
  // Warning: High xG
  const xGPerGame = team.xG_For / team.Matches;
  if (xGPerGame > 5) {
    warnings.push(`WARNING: ${team.Team} has unusual xG/game (${xGPerGame.toFixed(2)})`);
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}
```

### Verification Checklist

- [ ] **Input Validation**: All API responses are validated before storage/display
- [ ] **Type Safety**: TypeScript interfaces enforce data structure
- [ ] **Null Checks**: Missing data returns defaults, not crashes
- [ ] **Range Validation**: Scores are clamped to valid ranges (0-100)
- [ ] **Logging**: Anomalies are logged with timestamps for audit trail

---

## 🔒 Additional Security Measures

### Headers Configuration

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
];
```

### Content Security Policy (CSP)

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https://resources.premierleague.com;
font-src 'self';
connect-src 'self' https://api-football-v1.p.rapidapi.com;
```

---

## 📋 Pre-Deployment Checklist

### Security Sign-Off

- [ ] API keys not exposed in client bundle
- [ ] `.env` files in `.gitignore`
- [ ] ISR caching active on all pages
- [ ] Rate limit headers monitored
- [ ] Data validation implemented
- [ ] Security headers configured
- [ ] Error boundaries catch and log failures
- [ ] No console.log with sensitive data in production

### Monitoring Setup

- [ ] Error tracking (Sentry/LogRocket) configured
- [ ] Performance monitoring active
- [ ] API rate limit alerts configured
- [ ] Uptime monitoring enabled

---

## ✅ Sign-Off

| Reviewer | Role | Date | Approved |
|----------|------|------|----------|
| | Security Lead | | [ ] |
| | Tech Lead | | [ ] |
| | QA Lead | | [ ] |

**Production Deployment Authorized:** [ ] Yes / [ ] No

**Incident Response Contact:**
```
Name: _________________
Phone: ________________
Email: ________________
```
