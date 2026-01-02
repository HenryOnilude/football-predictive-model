"""
Visualization Generator Module
Creates matplotlib charts for performance analysis
"""

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class PerformanceVisualizer:
    """Generator for performance analysis visualizations"""

    def __init__(self, data_dir: str = "data", output_dir: str = "output/charts"):
        """
        Initialize visualizer

        Args:
            data_dir: Directory containing analysis data
            output_dir: Directory to save charts
        """
        self.data_dir = Path(data_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Color scheme for risk levels
        self.colors = {
            'Critical': '#dc2626',  # Red
            'High': '#ea580c',      # Orange
            'Moderate': '#eab308',  # Yellow
            'Low': '#16a34a'        # Green
        }

        # Set style
        plt.style.use('seaborn-v0_8-darkgrid')

    def get_risk_color(self, risk_category: str) -> str:
        """
        Get color for risk category

        Args:
            risk_category: Risk category label

        Returns:
            Color hex code
        """
        return self.colors.get(risk_category, '#6b7280')  # Gray as default

    def create_actual_vs_expected_chart(self, df: pd.DataFrame) -> str:
        """
        Create scatter plot: Actual Points vs Expected Points

        Args:
            df: DataFrame with analysis data

        Returns:
            Path to saved chart
        """
        logger.info("Creating Actual vs Expected Points chart...")

        fig, ax = plt.subplots(figsize=(12, 8))

        # Create scatter plot with colors based on risk category
        for risk_cat in ['Critical', 'High', 'Moderate', 'Low']:
            mask = df['Risk_Category'] == risk_cat
            if mask.any():
                ax.scatter(
                    df[mask]['xPTS'],
                    df[mask]['Actual_Points'],
                    c=self.get_risk_color(risk_cat),
                    s=100,
                    alpha=0.6,
                    label=risk_cat,
                    edgecolors='black',
                    linewidth=0.5
                )

        # Add perfect correlation line (y=x)
        min_pts = min(df['xPTS'].min(), df['Actual_Points'].min())
        max_pts = max(df['xPTS'].max(), df['Actual_Points'].max())
        ax.plot([min_pts, max_pts], [min_pts, max_pts], 'k--', alpha=0.3, label='Perfect correlation')

        # Add labels for teams with high variance
        for _, row in df.iterrows():
            if abs(row['Variance']) > 3:
                ax.annotate(
                    row['Team'],
                    (row['xPTS'], row['Actual_Points']),
                    xytext=(5, 5),
                    textcoords='offset points',
                    fontsize=8,
                    alpha=0.7
                )

        ax.set_xlabel('Expected Points (xPTS)', fontsize=12, fontweight='bold')
        ax.set_ylabel('Actual Points', fontsize=12, fontweight='bold')
        ax.set_title('Premier League: Actual Points vs Expected Points (xPTS)', fontsize=14, fontweight='bold')
        ax.legend(title='Risk Category', loc='upper left')
        ax.grid(True, alpha=0.3)

        plt.tight_layout()
        output_path = self.output_dir / 'actual_vs_expected.png'
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()

        logger.info(f"Chart saved to {output_path}")
        return str(output_path)

    def create_variance_bar_chart(self, df: pd.DataFrame) -> str:
        """
        Create bar chart: Variance by team (color-coded by risk level)

        Args:
            df: DataFrame with analysis data

        Returns:
            Path to saved chart
        """
        logger.info("Creating Variance by Team chart...")

        # Sort by variance for better visualization
        df_sorted = df.sort_values('Variance', ascending=True)

        fig, ax = plt.subplots(figsize=(12, max(8, len(df) * 0.3)))

        # Create horizontal bar chart
        colors = [self.get_risk_color(cat) for cat in df_sorted['Risk_Category']]
        bars = ax.barh(df_sorted['Team'], df_sorted['Variance'], color=colors, alpha=0.7, edgecolor='black', linewidth=0.5)

        # Add vertical line at x=0
        ax.axvline(x=0, color='black', linestyle='-', linewidth=1, alpha=0.3)

        # Add variance threshold lines
        ax.axvline(x=3, color='orange', linestyle='--', linewidth=1, alpha=0.5, label='±3 points threshold')
        ax.axvline(x=-3, color='orange', linestyle='--', linewidth=1, alpha=0.5)

        # Add value labels on bars
        for i, (bar, variance) in enumerate(zip(bars, df_sorted['Variance'])):
            if variance >= 0:
                ax.text(variance + 0.2, i, f'+{variance:.1f}', va='center', fontsize=8)
            else:
                ax.text(variance - 0.2, i, f'{variance:.1f}', va='center', ha='right', fontsize=8)

        ax.set_xlabel('Variance (Actual Points - Expected Points)', fontsize=12, fontweight='bold')
        ax.set_ylabel('Team', fontsize=12, fontweight='bold')
        ax.set_title('Premier League: Performance Variance by Team', fontsize=14, fontweight='bold')

        # Create custom legend
        legend_elements = [
            mpatches.Patch(color=self.colors['Critical'], label='Critical Risk (90+)'),
            mpatches.Patch(color=self.colors['High'], label='High Risk (70-89)'),
            mpatches.Patch(color=self.colors['Moderate'], label='Moderate Risk (40-69)'),
            mpatches.Patch(color=self.colors['Low'], label='Low Risk (0-39)')
        ]
        ax.legend(handles=legend_elements, loc='lower right', fontsize=9)

        ax.grid(True, alpha=0.3, axis='x')

        plt.tight_layout()
        output_path = self.output_dir / 'variance_by_team.png'
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()

        logger.info(f"Chart saved to {output_path}")
        return str(output_path)

    def create_league_table_chart(self, df: pd.DataFrame) -> str:
        """
        Create league table with xPTS column

        Args:
            df: DataFrame with analysis data

        Returns:
            Path to saved chart
        """
        logger.info("Creating League Table chart...")

        # Sort by actual position
        df_sorted = df.sort_values('Position_Actual').head(20)  # Top 20 teams

        fig, ax = plt.subplots(figsize=(14, max(10, len(df_sorted) * 0.4)))
        ax.axis('tight')
        ax.axis('off')

        # Prepare table data
        table_data = []
        for _, row in df_sorted.iterrows():
            table_data.append([
                int(row['Position_Actual']),
                row['Team'],
                int(row['Matches']),
                int(row['Actual_Points']),
                f"{row['xPTS']:.1f}",
                f"{row['Variance']:+.1f}",
                int(row['Risk_Score']),
                row['Risk_Category']
            ])

        # Column headers
        columns = ['Pos', 'Team', 'MP', 'Pts', 'xPTS', 'Var', 'Risk', 'Category']

        # Create table
        table = ax.table(
            cellText=table_data,
            colLabels=columns,
            cellLoc='left',
            loc='center',
            bbox=[0, 0, 1, 1]
        )

        table.auto_set_font_size(False)
        table.set_fontsize(9)
        table.scale(1, 2)

        # Style header row
        for i in range(len(columns)):
            cell = table[(0, i)]
            cell.set_facecolor('#1f2937')
            cell.set_text_props(weight='bold', color='white')

        # Color-code rows based on risk
        for i, row_data in enumerate(df_sorted.iterrows(), start=1):
            _, row = row_data
            risk_color = self.get_risk_color(row['Risk_Category'])

            # Color the risk score and category cells
            table[(i, 6)].set_facecolor(risk_color)
            table[(i, 6)].set_alpha(0.3)
            table[(i, 7)].set_facecolor(risk_color)
            table[(i, 7)].set_alpha(0.3)

            # Highlight teams with significant variance
            if abs(row['Variance']) > 3:
                for j in range(len(columns)):
                    table[(i, j)].set_edgecolor(risk_color)
                    table[(i, j)].set_linewidth(2)

        ax.set_title('Premier League Table with Expected Points (xPTS) Analysis',
                    fontsize=14, fontweight='bold', pad=20)

        plt.tight_layout()
        output_path = self.output_dir / 'league_table.png'
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()

        logger.info(f"Chart saved to {output_path}")
        return str(output_path)

    def create_risk_distribution_chart(self, df: pd.DataFrame) -> str:
        """
        Create pie chart showing distribution of risk categories

        Args:
            df: DataFrame with analysis data

        Returns:
            Path to saved chart
        """
        logger.info("Creating Risk Distribution chart...")

        fig, ax = plt.subplots(figsize=(10, 8))

        # Count teams in each risk category
        risk_counts = df['Risk_Category'].value_counts()

        # Create pie chart
        colors = [self.get_risk_color(cat) for cat in risk_counts.index]
        wedges, texts, autotexts = ax.pie(
            risk_counts.values,
            labels=risk_counts.index,
            colors=colors,
            autopct='%1.1f%%',
            startangle=90,
            explode=[0.05] * len(risk_counts)
        )

        # Style the text
        for text in texts:
            text.set_fontsize(12)
            text.set_fontweight('bold')

        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontsize(10)
            autotext.set_fontweight('bold')

        ax.set_title('Distribution of Teams by Risk Category', fontsize=14, fontweight='bold')

        plt.tight_layout()
        output_path = self.output_dir / 'risk_distribution.png'
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()

        logger.info(f"Chart saved to {output_path}")
        return str(output_path)

    def load_analysis_data(self, filename: str = "risk_analysis.csv") -> pd.DataFrame:
        """
        Load risk analysis data

        Args:
            filename: Input filename

        Returns:
            DataFrame with analysis data
        """
        input_path = self.data_dir / filename

        if not input_path.exists():
            raise FileNotFoundError(f"Analysis data file not found: {input_path}")

        df = pd.read_csv(input_path)
        logger.info(f"Loaded analysis data from {input_path}")

        return df

    def run(self, input_file: str = "risk_analysis.csv") -> dict:
        """
        Generate all visualizations

        Args:
            input_file: Input CSV file with analysis data

        Returns:
            Dictionary with paths to generated charts
        """
        logger.info("Starting visualization generation...")

        # Load data
        df = self.load_analysis_data(input_file)

        # Generate all charts
        charts = {
            'actual_vs_expected': self.create_actual_vs_expected_chart(df),
            'variance_by_team': self.create_variance_bar_chart(df),
            'league_table': self.create_league_table_chart(df),
            'risk_distribution': self.create_risk_distribution_chart(df)
        }

        logger.info(f"Successfully generated {len(charts)} charts")

        return charts


def main():
    """Main function for testing the visualizer"""
    visualizer = PerformanceVisualizer()

    try:
        charts = visualizer.run()

        print("\n=== Generated Visualizations ===")
        for chart_name, chart_path in charts.items():
            print(f"{chart_name}: {chart_path}")

    except FileNotFoundError as e:
        logger.error(f"Error: {e}")
        logger.info("Please run the scraper, calculator, and analyzer first.")


if __name__ == "__main__":
    main()
