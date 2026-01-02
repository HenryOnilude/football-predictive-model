"""
Statistical Analyzer Module
Analyzes variance between actual and expected performance
Calculates risk scores and identifies regression candidates
"""

import pandas as pd
import numpy as np
from scipy import stats
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class PerformanceAnalyzer:
    """Analyzer for team performance regression risk"""

    def __init__(self, data_dir: str = "data"):
        """
        Initialize analyzer

        Args:
            data_dir: Directory containing xPTS data
        """
        self.data_dir = Path(data_dir)

    def calculate_z_scores(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate z-scores for variance to measure statistical significance

        Args:
            df: DataFrame with xPTS and variance data

        Returns:
            DataFrame with z-scores added
        """
        logger.info("Calculating z-scores for variance...")

        # Calculate z-score for variance
        mean_variance = df['Variance'].mean()
        std_variance = df['Variance'].std()

        df['Z_Score'] = (df['Variance'] - mean_variance) / std_variance

        # Calculate p-values (two-tailed test)
        df['P_Value'] = 2 * (1 - stats.norm.cdf(np.abs(df['Z_Score'])))

        # Flag statistically significant results (p < 0.05)
        df['Significant'] = df['P_Value'] < 0.05

        logger.info(f"Calculated z-scores (mean={mean_variance:.2f}, std={std_variance:.2f})")

        return df

    def calculate_risk_score(self, variance: float) -> int:
        """
        Calculate regression risk score (0-100 scale)

        Score ranges:
        - 90-100: Critical risk (variance > +5 points)
        - 70-89: High risk (variance +3 to +5)
        - 40-69: Moderate risk (variance +1 to +3)
        - 0-39: Low risk (variance < +1)

        Args:
            variance: Points variance (actual - expected)

        Returns:
            Risk score (0-100)
        """
        if variance > 5:
            # Critical risk: 90-100 scale
            score = min(100, 90 + (variance - 5) * 2)
        elif variance > 3:
            # High risk: 70-89 scale
            score = 70 + ((variance - 3) / 2) * 19
        elif variance > 1:
            # Moderate risk: 40-69 scale
            score = 40 + ((variance - 1) / 2) * 29
        elif variance > 0:
            # Low-moderate risk: 20-39 scale
            score = 20 + (variance / 1) * 19
        elif variance > -3:
            # Low risk (underperforming): 10-19 scale
            score = 10 + ((variance + 3) / 3) * 9
        else:
            # Very low risk (significant underperformance): 0-9 scale
            score = max(0, 10 + variance)

        return int(round(score))

    def get_risk_category(self, risk_score: int) -> str:
        """
        Get risk category label

        Args:
            risk_score: Risk score (0-100)

        Returns:
            Risk category label
        """
        if risk_score >= 90:
            return "Critical"
        elif risk_score >= 70:
            return "High"
        elif risk_score >= 40:
            return "Moderate"
        else:
            return "Low"

    def identify_regression_candidates(self, df: pd.DataFrame) -> dict:
        """
        Identify teams at risk of performance regression

        Args:
            df: DataFrame with risk analysis

        Returns:
            Dictionary with categorized teams
        """
        results = {
            'overperforming': df[df['Variance'] > 3].sort_values('Variance', ascending=False),
            'underperforming': df[df['Variance'] < -3].sort_values('Variance'),
            'critical_risk': df[df['Risk_Score'] >= 90].sort_values('Risk_Score', ascending=False),
            'high_risk': df[(df['Risk_Score'] >= 70) & (df['Risk_Score'] < 90)].sort_values('Risk_Score', ascending=False),
            'significant_variance': df[df['Significant'] == True].sort_values('Variance', ascending=False)
        }

        logger.info(f"Identified {len(results['overperforming'])} overperforming teams")
        logger.info(f"Identified {len(results['underperforming'])} underperforming teams")
        logger.info(f"Identified {len(results['critical_risk'])} critical risk teams")
        logger.info(f"Identified {len(results['significant_variance'])} teams with statistically significant variance")

        return results

    def calculate_regression_probability(self, variance: float, z_score: float) -> float:
        """
        Calculate probability of regression to mean

        This is a simplified model based on:
        - Magnitude of variance
        - Statistical significance (z-score)

        Args:
            variance: Points variance
            z_score: Statistical z-score

        Returns:
            Probability (0-1) of regression
        """
        # Base probability from variance magnitude
        if variance <= 0:
            base_prob = 0.1  # Underperforming teams unlikely to regress further
        else:
            # Overperforming teams: higher variance = higher regression probability
            base_prob = min(0.9, 0.3 + (variance / 10))

        # Adjust based on statistical significance
        significance_factor = min(1.0, abs(z_score) / 2)

        # Combined probability
        regression_prob = base_prob * (0.7 + 0.3 * significance_factor)

        return round(regression_prob, 3)

    def analyze_performance(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Perform complete performance analysis

        Args:
            df: DataFrame with xPTS data

        Returns:
            DataFrame with complete analysis
        """
        logger.info("Starting performance analysis...")

        # Calculate z-scores
        df = self.calculate_z_scores(df)

        # Calculate risk scores
        df['Risk_Score'] = df['Variance'].apply(self.calculate_risk_score)
        df['Risk_Category'] = df['Risk_Score'].apply(self.get_risk_category)

        # Calculate regression probability
        df['Regression_Probability'] = df.apply(
            lambda row: self.calculate_regression_probability(row['Variance'], row['Z_Score']),
            axis=1
        )

        # Add performance label
        df['Performance_Status'] = df['Variance'].apply(
            lambda x: 'Overperforming' if x > 3 else ('Underperforming' if x < -3 else 'As Expected')
        )

        logger.info("Performance analysis completed")

        return df

    def load_xpts_data(self, filename: str = "xpts_data.csv") -> pd.DataFrame:
        """
        Load xPTS data

        Args:
            filename: Input filename

        Returns:
            DataFrame with xPTS data
        """
        input_path = self.data_dir / filename

        if not input_path.exists():
            raise FileNotFoundError(f"xPTS data file not found: {input_path}")

        df = pd.read_csv(input_path)
        logger.info(f"Loaded xPTS data from {input_path}")

        return df

    def save_data(self, df: pd.DataFrame, filename: str = "risk_analysis.csv") -> None:
        """
        Save risk analysis data to CSV

        Args:
            df: DataFrame to save
            filename: Output filename
        """
        output_path = self.data_dir / filename
        df.to_csv(output_path, index=False)
        logger.info(f"Risk analysis saved to {output_path}")

    def run(self, input_file: str = "xpts_data.csv", output_file: str = "risk_analysis.csv") -> tuple:
        """
        Run the complete analysis process

        Args:
            input_file: Input CSV file with xPTS data
            output_file: Output CSV file for risk analysis

        Returns:
            Tuple of (analyzed DataFrame, regression candidates dict)
        """
        logger.info("Starting risk analysis...")

        # Load xPTS data
        df = self.load_xpts_data(input_file)

        # Perform analysis
        analyzed_df = self.analyze_performance(df)

        # Identify regression candidates
        candidates = self.identify_regression_candidates(analyzed_df)

        # Save results
        self.save_data(analyzed_df, output_file)

        logger.info("Risk analysis completed successfully")

        return analyzed_df, candidates


def main():
    """Main function for testing the analyzer"""
    analyzer = PerformanceAnalyzer()

    try:
        df, candidates = analyzer.run()

        print("\n=== Risk Analysis Summary ===")
        print("\nTop 5 Teams by Risk Score:")
        print(df.nlargest(5, 'Risk_Score')[
            ['Team', 'Actual_Points', 'xPTS', 'Variance', 'Risk_Score', 'Risk_Category', 'Regression_Probability']
        ])

        print("\n\nOverperforming Teams (Variance > +3):")
        if len(candidates['overperforming']) > 0:
            print(candidates['overperforming'][['Team', 'Variance', 'Risk_Score', 'Regression_Probability']])
        else:
            print("None")

        print("\n\nUnderperforming Teams (Variance < -3):")
        if len(candidates['underperforming']) > 0:
            print(candidates['underperforming'][['Team', 'Variance', 'Risk_Score']])
        else:
            print("None")

    except FileNotFoundError as e:
        logger.error(f"Error: {e}")
        logger.info("Please run the scraper and calculator first.")


if __name__ == "__main__":
    main()
