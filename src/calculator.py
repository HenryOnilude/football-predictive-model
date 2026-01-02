"""
Expected Points (xPTS) Calculator Module
Calculates expected points using Poisson distribution based on xG data
"""

import pandas as pd
import numpy as np
from scipy.stats import poisson
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ExpectedPointsCalculator:
    """Calculator for Expected Points (xPTS) using Poisson distribution"""

    def __init__(self, data_dir: str = "data"):
        """
        Initialize calculator

        Args:
            data_dir: Directory containing raw data
        """
        self.data_dir = Path(data_dir)

    def calculate_match_probabilities(self, xg_home: float, xg_away: float) -> dict:
        """
        Calculate win/draw/loss probabilities using Poisson distribution

        Args:
            xg_home: Expected goals for home team
            xg_away: Expected goals for away team

        Returns:
            dict with p_home_win, p_draw, p_away_win
        """
        max_goals = 10  # Reasonable upper limit for goal calculations

        # Calculate probability for each scoreline
        p_home_win = 0
        p_draw = 0
        p_away_win = 0

        for home_goals in range(max_goals + 1):
            for away_goals in range(max_goals + 1):
                # Probability of this exact scoreline
                p_score = (poisson.pmf(home_goals, xg_home) *
                          poisson.pmf(away_goals, xg_away))

                if home_goals > away_goals:
                    p_home_win += p_score
                elif home_goals == away_goals:
                    p_draw += p_score
                else:
                    p_away_win += p_score

        return {
            'p_home_win': p_home_win,
            'p_draw': p_draw,
            'p_away_win': p_away_win
        }

    def calculate_xpts(self, xg_for: float, xg_against: float, is_home: bool = True) -> float:
        """
        Calculate expected points for a match

        Args:
            xg_for: Expected goals for the team
            xg_against: Expected goals against the team
            is_home: Whether the team is playing at home

        Returns:
            Expected points (0-3)
        """
        if is_home:
            probs = self.calculate_match_probabilities(xg_for, xg_against)
            xpts = (probs['p_home_win'] * 3) + (probs['p_draw'] * 1)
        else:
            probs = self.calculate_match_probabilities(xg_against, xg_for)
            xpts = (probs['p_away_win'] * 3) + (probs['p_draw'] * 1)

        return round(xpts, 2)

    def calculate_season_xpts(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate expected points for the entire season

        For simplicity, we assume teams play half their games at home and half away.
        We calculate xPTS based on their average xG per match.

        Args:
            df: DataFrame with raw team data

        Returns:
            DataFrame with xPTS calculations
        """
        logger.info("Calculating expected points for all teams...")

        results = []

        for _, row in df.iterrows():
            team = row['Team']
            matches = row['Matches']
            xg_for = row['xG_For']
            xg_against = row['xG_Against']

            # Calculate average xG per match
            avg_xg_for = xg_for / matches
            avg_xg_against = xg_against / matches

            # Calculate expected points assuming 50% home, 50% away
            # This is a simplification - ideally we'd have match-by-match data
            home_matches = matches / 2
            away_matches = matches / 2

            # Calculate xPTS for average home and away matches
            xpts_per_home_match = self.calculate_xpts(avg_xg_for, avg_xg_against, is_home=True)
            xpts_per_away_match = self.calculate_xpts(avg_xg_for, avg_xg_against, is_home=False)

            # Total expected points
            total_xpts = (xpts_per_home_match * home_matches) + (xpts_per_away_match * away_matches)

            # Calculate variance
            variance = row['Actual_Points'] - total_xpts

            results.append({
                'Team': team,
                'Matches': matches,
                'Actual_Points': row['Actual_Points'],
                'Goals_For': row['Goals_For'],
                'Goals_Against': row['Goals_Against'],
                'xG_For': xg_for,
                'xG_Against': xg_against,
                'xPTS': round(total_xpts, 2),
                'Variance': round(variance, 2),
                'Position_Actual': row['Position']
            })

            logger.info(f"{team}: Actual={row['Actual_Points']}, xPTS={round(total_xpts, 2)}, Variance={round(variance, 2)}")

        result_df = pd.DataFrame(results)

        # Calculate expected position based on xPTS
        result_df = result_df.sort_values('xPTS', ascending=False).reset_index(drop=True)
        result_df['Position_Expected'] = range(1, len(result_df) + 1)

        # Re-sort by actual position
        result_df = result_df.sort_values('Position_Actual').reset_index(drop=True)

        logger.info(f"Calculated xPTS for {len(result_df)} teams")

        return result_df

    def load_raw_data(self, filename: str = "raw_data.csv") -> pd.DataFrame:
        """
        Load raw scraped data

        Args:
            filename: Input filename

        Returns:
            DataFrame with raw data
        """
        input_path = self.data_dir / filename

        if not input_path.exists():
            raise FileNotFoundError(f"Raw data file not found: {input_path}")

        df = pd.read_csv(input_path)
        logger.info(f"Loaded data from {input_path}")

        return df

    def save_data(self, df: pd.DataFrame, filename: str = "xpts_data.csv") -> None:
        """
        Save calculated xPTS data to CSV

        Args:
            df: DataFrame to save
            filename: Output filename
        """
        output_path = self.data_dir / filename
        df.to_csv(output_path, index=False)
        logger.info(f"xPTS data saved to {output_path}")

    def run(self, input_file: str = "raw_data.csv", output_file: str = "xpts_data.csv") -> pd.DataFrame:
        """
        Run the complete xPTS calculation process

        Args:
            input_file: Input CSV file with raw data
            output_file: Output CSV file for xPTS data

        Returns:
            DataFrame with xPTS calculations
        """
        logger.info("Starting xPTS calculation...")

        # Load raw data
        df = self.load_raw_data(input_file)

        # Calculate xPTS
        result_df = self.calculate_season_xpts(df)

        # Save results
        self.save_data(result_df, output_file)

        logger.info("xPTS calculation completed successfully")

        return result_df


def main():
    """Main function for testing the calculator"""
    calculator = ExpectedPointsCalculator()

    # Test with sample data if raw_data.csv doesn't exist
    try:
        df = calculator.run()
        print("\n=== xPTS Calculation Results ===")
        print(df[['Team', 'Actual_Points', 'xPTS', 'Variance', 'Position_Actual', 'Position_Expected']].head(10))
        print(f"\nProcessed {len(df)} teams")
    except FileNotFoundError:
        logger.warning("No raw data found. Please run the scraper first.")

        # Test the Poisson calculation with sample values
        calc = ExpectedPointsCalculator()
        xpts = calc.calculate_xpts(1.5, 1.2, is_home=True)
        print(f"\nSample calculation: xG_for=1.5, xG_against=1.2 (home) -> xPTS={xpts}")


if __name__ == "__main__":
    main()
