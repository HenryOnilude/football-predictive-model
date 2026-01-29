"""
Data Scraper Module
Scrapes Expected Goals (xG) data from FBRef.com for Premier League teams
"""

import os
import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class PremierLeagueScraper:
    """Scraper for Premier League xG data from FBRef.com"""

    def __init__(self, output_dir: str = "data"):
        """
        Initialize scraper

        Args:
            output_dir: Directory to save scraped data
        """
        self.base_url = "https://fbref.com/en/comps/9/Premier-League-Stats"
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-GB,en;q=0.9',
        }

        # Configure proxy if available (for GitHub Actions)
        self.proxies = None
        proxy_url = os.getenv('RESIDENTIAL_PROXY_URL')
        if proxy_url:
            self.proxies = {
                'http': proxy_url,
                'https': proxy_url,
            }
            logger.info("Using residential proxy for requests")
        else:
            logger.info("No proxy configured, using direct connection")

    def scrape_league_table(self) -> pd.DataFrame:
        """
        Scrape Premier League table with xG data

        Returns:
            DataFrame with team statistics including xG data
        """
        logger.info(f"Fetching data from {self.base_url}")

        try:
            # Add delay to respect rate limiting
            time.sleep(3)

            response = requests.get(
                self.base_url,
                headers=self.headers,
                proxies=self.proxies,
                timeout=30  # Increased for residential proxy latency
            )
            response.raise_for_status()

            logger.info(f"Successfully fetched data (Status: {response.status_code})")

            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')

            # Find the league standings table with xG data
            # Look for table with ID containing 'results' and 'overall'
            table = soup.find('table', {'id': lambda x: x and 'results' in str(x) and 'overall' in str(x)})

            if not table:
                # Fallback: try to find by caption
                for potential_table in soup.find_all('table'):
                    caption = potential_table.find('caption')
                    if caption and 'Premier League Table' in caption.get_text():
                        table = potential_table
                        break

            if not table:
                raise ValueError("Could not find league table on page")

            # First, get column headers to find correct indices
            headers = []
            header_row = table.find('thead').find_all('tr')[-1]  # Get last header row
            for th in header_row.find_all(['th', 'td']):
                # Get data-stat attribute or text
                col_name = th.get('data-stat', th.get_text(strip=True))
                headers.append(col_name)

            logger.info(f"Found {len(headers)} columns in table")

            # Extract table data
            teams_data = []
            rows = table.find('tbody').find_all('tr')

            for row in rows:
                # Skip rows that are just headers (some tables have mid-table headers)
                if row.find('th', {'scope': 'row'}) is None:
                    continue

                cells = row.find_all(['th', 'td'])

                # Skip if not enough cells
                if len(cells) < 10:
                    continue

                # Extract data from cells using data-stat attributes
                try:
                    row_data = {}
                    for i, cell in enumerate(cells):
                        stat_name = cell.get('data-stat')
                        value = cell.get_text(strip=True)
                        if stat_name:
                            row_data[stat_name] = value

                    # Extract required fields
                    # Team name has data-stat='team', fallback to cells[1] if needed
                    team_name = row_data.get('team', '')
                    if not team_name or team_name.isdigit():
                        team_name = cells[1].get_text(strip=True) if len(cells) > 1 else 'Unknown'

                    matches_played = int(row_data.get('games', '0'))
                    goals_for = int(row_data.get('goals_for', '0'))
                    goals_against = int(row_data.get('goals_against', '0'))
                    points = int(row_data.get('points', '0'))
                    xg_for = float(row_data.get('xg_for', '0'))
                    xg_against = float(row_data.get('xg_against', '0'))

                    teams_data.append({
                        'Team': team_name,
                        'Matches': matches_played,
                        'Goals_For': goals_for,
                        'Goals_Against': goals_against,
                        'Actual_Points': points,
                        'xG_For': xg_for,
                        'xG_Against': xg_against
                    })

                    logger.info(f"Extracted data for {team_name}")

                except (IndexError, ValueError, KeyError) as e:
                    logger.warning(f"Could not extract data from row: {e}")
                    continue

            if not teams_data:
                raise ValueError("No team data was extracted from the table")

            # Create DataFrame
            df = pd.DataFrame(teams_data)

            # Add position column
            df['Position'] = range(1, len(df) + 1)

            # Validate data
            self._validate_data(df)

            logger.info(f"Successfully scraped data for {len(df)} teams")

            return df

        except requests.exceptions.RequestException as e:
            logger.error(f"HTTP request failed: {e}")
            raise
        except Exception as e:
            logger.error(f"Error scraping data: {e}")
            raise

    def _validate_data(self, df: pd.DataFrame) -> None:
        """
        Validate scraped data for missing or invalid values

        Args:
            df: DataFrame to validate
        """
        required_columns = [
            'Team', 'Matches', 'Goals_For', 'Goals_Against',
            'Actual_Points', 'xG_For', 'xG_Against'
        ]

        # Check for missing columns
        missing_cols = set(required_columns) - set(df.columns)
        if missing_cols:
            raise ValueError(f"Missing required columns: {missing_cols}")

        # Check for null values
        null_counts = df[required_columns].isnull().sum()
        if null_counts.any():
            logger.warning(f"Found null values:\n{null_counts[null_counts > 0]}")
            raise ValueError("Data contains null values")

        # Check for negative values (shouldn't happen for these stats)
        numeric_cols = ['Matches', 'Goals_For', 'Goals_Against', 'Actual_Points', 'xG_For', 'xG_Against']
        for col in numeric_cols:
            if (df[col] < 0).any():
                raise ValueError(f"Found negative values in {col}")

        # Check for reasonable ranges
        if (df['Matches'] > 38).any():
            logger.warning("Some teams have more than 38 matches (full season)")

        logger.info("Data validation passed")

    def save_data(self, df: pd.DataFrame, filename: str = "raw_data.csv") -> None:
        """
        Save scraped data to CSV

        Args:
            df: DataFrame to save
            filename: Output filename
        """
        output_path = self.output_dir / filename
        df.to_csv(output_path, index=False)
        logger.info(f"Data saved to {output_path}")

    def run(self) -> pd.DataFrame:
        """
        Run the complete scraping process

        Returns:
            DataFrame with scraped data
        """
        logger.info("Starting Premier League data scraping...")

        df = self.scrape_league_table()
        self.save_data(df)

        logger.info("Scraping completed successfully")
        return df


def main():
    """Main function for testing the scraper"""
    scraper = PremierLeagueScraper()
    df = scraper.run()
    print("\n=== Scraped Data Summary ===")
    print(df.head())
    print(f"\nTotal teams: {len(df)}")


if __name__ == "__main__":
    main()
