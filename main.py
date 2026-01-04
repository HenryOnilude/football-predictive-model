#!/usr/bin/env python3
"""
Football Predictive Performance Regression Model - Main Runner
Orchestrates the complete analysis pipeline
"""

import sys
import logging
from pathlib import Path
from datetime import datetime

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from scraper import PremierLeagueScraper
from calculator import ExpectedPointsCalculator
from analyzer import PerformanceAnalyzer
from visualizer import PerformanceVisualizer
from reporter import PerformanceReportGenerator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('analysis.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class FootballAnalysisPipeline:
    """Main pipeline orchestrator for football performance analysis"""

    def __init__(self):
        """Initialize pipeline components"""
        self.scraper = PremierLeagueScraper()
        self.calculator = ExpectedPointsCalculator()
        self.analyzer = PerformanceAnalyzer()
        self.visualizer = PerformanceVisualizer()
        self.reporter = PerformanceReportGenerator()

    def run(self, skip_scraping: bool = False):
        """
        Run the complete analysis pipeline

        Args:
            skip_scraping: If True, skip scraping and use existing data
        """
        start_time = datetime.now()
        logger.info("=" * 70)
        logger.info("STARTING FOOTBALL PERFORMANCE ANALYSIS PIPELINE")
        logger.info("=" * 70)

        try:
            # Step 1: Scrape data
            if not skip_scraping:
                logger.info("\n[1/6] SCRAPING PREMIER LEAGUE DATA")
                logger.info("-" * 70)
                df_raw = self.scraper.run()
                logger.info(f"✓ Successfully scraped data for {len(df_raw)} teams")
            else:
                logger.info("\n[1/6] SKIPPING SCRAPING (using existing data)")
                logger.info("-" * 70)

            # Step 2: Calculate xPTS
            logger.info("\n[2/6] CALCULATING EXPECTED POINTS (xPTS)")
            logger.info("-" * 70)
            df_xpts = self.calculator.run()
            logger.info(f"✓ Calculated xPTS for {len(df_xpts)} teams")

            # Step 3: Analyze performance
            logger.info("\n[3/6] PERFORMING STATISTICAL ANALYSIS")
            logger.info("-" * 70)
            df_analysis, candidates = self.analyzer.run()
            logger.info(f"✓ Analyzed {len(df_analysis)} teams")
            logger.info(f"  - High risk teams: {len(candidates['high_risk']) + len(candidates['critical_risk'])}")
            logger.info(f"  - Overperforming: {len(candidates['overperforming'])}")
            logger.info(f"  - Underperforming: {len(candidates['underperforming'])}")

            # Step 4: Generate visualizations
            logger.info("\n[4/6] GENERATING VISUALIZATIONS")
            logger.info("-" * 70)
            charts = self.visualizer.run()
            logger.info(f"✓ Generated {len(charts)} charts")
            for chart_name in charts.keys():
                logger.info(f"  - {chart_name}")

            # Step 5: Generate PDF report
            logger.info("\n[5/6] GENERATING PDF REPORT")
            logger.info("-" * 70)
            report_path = self.reporter.run(charts=charts)
            logger.info(f"✓ Report saved to: {report_path}")

            # Step 6: Print summary
            logger.info("\n[6/6] ANALYSIS SUMMARY")
            logger.info("-" * 70)
            self._print_summary(df_analysis, candidates)

            # Completion
            elapsed_time = (datetime.now() - start_time).total_seconds()
            logger.info("\n" + "=" * 70)
            logger.info(f"PIPELINE COMPLETED SUCCESSFULLY in {elapsed_time:.2f} seconds")
            logger.info("=" * 70)

        except Exception as e:
            logger.error(f"\n{'=' * 70}")
            logger.error(f"PIPELINE FAILED: {str(e)}")
            logger.error(f"{'=' * 70}")
            raise

    def _print_summary(self, df_analysis, candidates):
        """
        Print analysis summary to console

        Args:
            df_analysis: DataFrame with complete analysis
            candidates: Dictionary with regression candidates
        """
        print("\n" + "=" * 70)
        print("PREMIER LEAGUE PERFORMANCE ANALYSIS - SUMMARY")
        print("=" * 70)

        # Overall statistics
        print(f"\nTotal Teams Analyzed: {len(df_analysis)}")
        print(f"Average Variance: {df_analysis['Variance'].mean():.2f} points")
        print(f"Variance Std Dev: {df_analysis['Variance'].std():.2f} points")

        # Top overperformers
        print("\n" + "-" * 70)
        print("TOP 5 OVERPERFORMING TEAMS (Highest Regression Risk)")
        print("-" * 70)
        top_over = df_analysis.nlargest(5, 'Variance')
        for i, (_, row) in enumerate(top_over.iterrows(), 1):
            print(f"{i}. {row['Team']:20} | Actual: {int(row['Actual_Points']):2} pts | "
                  f"xPTS: {row['xPTS']:5.1f} | Variance: +{row['Variance']:.1f} | "
                  f"Risk: {int(row['Risk_Score'])} ({row['Risk_Category']})")

        # Top underperformers
        print("\n" + "-" * 70)
        print("TOP 5 UNDERPERFORMING TEAMS (Potential to Improve)")
        print("-" * 70)
        top_under = df_analysis.nsmallest(5, 'Variance')
        for i, (_, row) in enumerate(top_under.iterrows(), 1):
            print(f"{i}. {row['Team']:20} | Actual: {int(row['Actual_Points']):2} pts | "
                  f"xPTS: {row['xPTS']:5.1f} | Variance: {row['Variance']:.1f}")

        # Critical risk teams
        if len(candidates['critical_risk']) > 0:
            print("\n" + "-" * 70)
            print("⚠️  CRITICAL RISK TEAMS (Immediate Attention Required)")
            print("-" * 70)
            for _, row in candidates['critical_risk'].iterrows():
                print(f"• {row['Team']:20} | Regression Probability: {row['Regression_Probability']:.1%} | "
                      f"Risk Score: {int(row['Risk_Score'])}")

        # Statistically significant variances
        significant = df_analysis[df_analysis['Significant'] == True]
        if len(significant) > 0:
            print(f"\n{len(significant)} teams show statistically significant variance (p < 0.05)")

        print("\n" + "=" * 70)
        print("KEY RECOMMENDATIONS:")
        print("=" * 70)

        # Generate recommendations
        high_risk_count = len(candidates['high_risk']) + len(candidates['critical_risk'])
        if high_risk_count > 0:
            print(f"\n1. MONITOR HIGH-RISK TEAMS: {high_risk_count} teams are overperforming their xG metrics")
            print("   → Avoid panic transfers/managerial changes if performance normalizes")
            print("   → Focus on underlying metrics (xG) rather than just results")

        if len(candidates['underperforming']) > 0:
            print(f"\n2. UNDERPERFORMING TEAMS: {len(candidates['underperforming'])} teams are underperforming xG")
            print("   → These teams may improve without major changes")
            print("   → Review finishing efficiency and luck factors")

        print("\n3. STRATEGIC PLANNING:")
        print("   → Use xPTS for more accurate season projections")
        print("   → Potential ROI: £40-60M by avoiding reactive decisions")

        print("\n" + "=" * 70)


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(
        description='Football Predictive Performance Regression Model'
    )
    parser.add_argument(
        '--skip-scraping',
        action='store_true',
        help='Skip data scraping and use existing raw_data.csv'
    )
    args = parser.parse_args()

    # Run pipeline
    pipeline = FootballAnalysisPipeline()
    pipeline.run(skip_scraping=args.skip_scraping)


if __name__ == "__main__":
    main()
