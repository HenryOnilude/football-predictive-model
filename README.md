# Football Predictive Performance Regression Model

A data-driven system for identifying Premier League teams at risk of performance regression using Expected Goals (xG) analysis and statistical modeling.

## Overview

This project helps football clubs avoid costly reactive decisions (estimated £40-60M savings) by identifying teams whose current performance significantly deviates from underlying metrics. Uses real Premier League data with **automated daily updates**.


### Key Features

- **Real-time Data**: Automatically scrapes latest Premier League stats from FBRef.com daily
- **Statistical Analysis**: Poisson distribution modeling for Expected Points (xPTS) calculation
- **Risk Scoring**: 0-100 scale identifying critical regression risk (90+), high (70-89), moderate (40-69), and low (0-39)
- **Interactive Dashboard**: Next.js web app with sortable tables, team detail pages, and data visualizations
- **Automated Reports**: PDF reports with charts analyzing performance variance

### Dashboard Preview
<img width="1270" height="835" alt="Screenshot 2026-01-12 at 16 07 26" src="https://github.com/user-attachments/assets/34541596-8a69-4d7e-98dd-90e39301f45a" />
Figure 1: Performance Analysis Summary. A high-level overview of the 2025-2026 Season, identifying critical regression outliers and league-wide trends.

### Key Insights & Analytics Table

<img width="1261" height="850" alt="Screenshot 2026-01-12 at 17 22 20" src="https://github.com/user-attachments/assets/fead6ab5-9d6e-4ff7-8926-7769a2e08d82" />
Figure 2: Real-time Risk Table. Shows exactly which teams are over-performing. Aston Villa is the biggest outlier, with results far better than their underlying play.

### User Guide & Legend

<img width="1404" height="860" alt="Screenshot 2026-01-13 at 00 30 23" src="https://github.com/user-attachments/assets/7a95fe83-15fe-4cc9-ac79-f39fa3fede63" />
Figure 3: Results Legend. A clear breakdown of the color-coded risk levels and score ranges so you know exactly how each team is performing.

### Advanced Statistical Deep-Dive
<img width="1147" height="637" alt="Screenshot 2026-01-13 at 00 38 48" src="https://github.com/user-attachments/assets/9951626c-222a-4982-9f26-e9d070c54953" />
Figure 4: Advanced Statistical Deep-Dive as it shows a detail view showing the Poisson-derived probability and statistical significance of performance deviations.

## How It Works

### Methodology

1. **Data Collection**: Scrapes Premier League team statistics including xG (Expected Goals), actual goals, and points from FBRef.com
2. **xPTS Calculation**: Uses Poisson distribution to model goal-scoring probabilities and calculate expected points
3. **Variance Analysis**: Compares actual points vs expected points to identify over/underperforming teams
4. **Statistical Testing**: Z-scores and p-values determine if variance is statistically significant (p < 0.05)
5. **Risk Scoring**: Combines variance magnitude, regression probability, and statistical significance into 0-100 risk score

### Research Basis

- Expected Goals (xG) methodology: Opta Sports & FBRef data standards
- Poisson distribution for football modeling: Dixon & Coles (1997), Maher (1982)
- Regression to the mean: Kahneman & Tversky behavioral economics research

## Automated Data Updates

The system automatically stays current with Premier League results:

- **GitHub Actions**: Runs Python scraper daily at 2 AM UTC
- **Auto-commit**: Updates CSV files when new data is available
- **Auto-deploy**: Vercel automatically redeploys dashboard on data changes
- **Manual Trigger**: Can also run workflow manually from GitHub Actions tab

## Project Structure

```
Football-predictive-model/
├── src/                          # Python analysis engine
│   ├── scraper.py               # FBRef.com web scraper
│   ├── calculator.py            # xPTS calculation (Poisson)
│   ├── analyzer.py              # Statistical analysis & risk scoring
│   ├── visualizer.py            # Chart generation (matplotlib)
│   └── reporter.py              # PDF report generation
├── dashboard/                    # Next.js web application
│   ├── app/                     # Next.js 14 App Router
│   │   ├── page.tsx            # Homepage with league table
│   │   ├── layout.tsx          # Root layout
│   │   └── team/[slug]/        # Dynamic team detail pages
│   ├── components/              # React components
│   │   ├── LeagueTable.tsx     # Sortable/filterable table
│   │   ├── TeamChart.tsx       # Recharts visualizations
│   │   └── RiskBadge.tsx       # Risk category indicator
│   └── lib/types.ts            # TypeScript definitions
├── data/                        # CSV data files (auto-updated)
│   ├── raw_data.csv            # Scraped Premier League stats
│   ├── calculated_data.csv     # With xPTS calculations
│   └── risk_analysis.csv       # Final analysis with risk scores
├── reports/                     # Generated PDF reports
├── .github/workflows/           # GitHub Actions automation
│   └── update-data.yml         # Daily data update workflow
├── main.py                      # Pipeline orchestrator
└── requirements.txt             # Python dependencies
```

## Setup & Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Football-predictive-model
   ```

2. **Set up Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Run initial data scrape**
   ```bash
   python main.py
   ```
   This generates:
   - `data/raw_data.csv` - Scraped stats
   - `data/calculated_data.csv` - With xPTS
   - `data/risk_analysis.csv` - Final analysis
   - `data/*.png` - Charts
   - `reports/*.pdf` - Full report

4. **Set up Next.js dashboard**
   ```bash
   cd dashboard
   npm install
   npm run dev
   ```
   Dashboard runs at http://localhost:3000

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `dashboard`
   - Deploy

3. **Enable GitHub Actions**
   - GitHub Actions will automatically run daily
   - Updates data and triggers Vercel redeployment
   - No manual intervention required

### Manual Updates

To manually update data:
```bash
python main.py  # Runs scraper and analysis
git add data/*.csv
git commit -m "Update data"
git push  # Triggers Vercel redeploy
```

Or trigger GitHub Actions workflow manually:
- Go to GitHub repository > Actions tab
- Select "Update Premier League Data" workflow
- Click "Run workflow"

## Usage

### Dashboard Features

1. **Homepage**
   - Overview of all 20 Premier League teams
   - Summary cards: Total teams, High risk count, Over/underperforming counts
   - Sortable table by any metric (points, variance, risk score, etc.)
   - Filter by risk category (Critical, High, Moderate, Low)

2. **Team Detail Pages**
   - Click any team to view detailed analysis
   - Charts comparing actual vs expected performance
   - Variance visualization
   - Statistical metrics (regression probability, z-score, p-value)
   - Strategic recommendations based on risk profile

### Interpreting Results

**Risk Categories:**
- **Critical (90-100)**: Immediate attention needed, very high regression risk
- **High (70-89)**: Monitor closely, likely performance regression
- **Moderate (40-69)**: Some regression possible
- **Low (0-39)**: Performing as expected or underperforming (improvement likely)

**Variance:**
- **Positive (+)**: Overperforming xG metrics (regression risk)
- **Negative (-)**: Underperforming xG metrics (improvement potential)
- **±3 points**: Threshold for significant over/underperformance

**Statistical Significance:**
- Teams marked with `*` have p-value < 0.05 (statistically significant variance)
- Unlikely to be due to random chance

## Example Insights (2025-2026 Season)

Based on current data:
- **Aston Villa**: +17.1 variance, 98% regression probability - Critical risk
- **Tottenham**: +5.5 variance, overperforming finishing - High risk
- **Wolves**: -15.4 variance, significant underperformance - Improvement expected
- **Leeds United**: -5.2 variance, unlucky in close games - Natural improvement likely

## Technical Stack

**Backend (Python):**
- BeautifulSoup4 - Web scraping
- Pandas/NumPy - Data processing
- SciPy - Statistical analysis (Poisson, z-scores)
- Matplotlib - Visualization
- ReportLab - PDF generation

**Frontend (Next.js):**
- Next.js 14 (App Router)
- TypeScript - Type safety
- TailwindCSS - Styling
- Recharts - Interactive charts
- Server Components - Optimized performance

**Automation:**
- GitHub Actions - Scheduled workflows
- Vercel - Continuous deployment

## Data Source

All data sourced from [FBRef.com](https://fbref.com/en/comps/9/Premier-League-Stats), which provides:
- Official Premier League statistics
- Expected Goals (xG) from Opta Sports
- Updated after every matchday

## License

This project is for educational and analytical purposes. Please respect FBRef.com's terms of service when scraping data.

## Contributing

Issues and pull requests welcome! Areas for improvement:
- Additional statistical models (xG sequence analysis, home/away splits)
- Historical season comparisons
- Machine learning predictions
- Mobile app version

---

**Last Updated**: Auto-updates daily at 2 AM UTC via GitHub Actions
**Data Coverage**: 2025-2026 Premier League Season
**Accuracy**: Based on official Opta xG data from FBRef.com
