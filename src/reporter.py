"""
Report Generator Module
Generates PDF reports with analysis and visualizations
"""

import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph,
    Spacer, PageBreak, Image
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class PerformanceReportGenerator:
    """Generator for PDF performance analysis reports"""

    def __init__(self, data_dir: str = "data", charts_dir: str = "output/charts",
                 output_dir: str = "output/reports"):
        """
        Initialize report generator

        Args:
            data_dir: Directory containing analysis data
            charts_dir: Directory containing chart images
            output_dir: Directory to save reports
        """
        self.data_dir = Path(data_dir)
        self.charts_dir = Path(charts_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Set up styles
        self.styles = getSampleStyleSheet()
        self._create_custom_styles()

    def _create_custom_styles(self):
        """Create custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1f2937'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))

        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#374151'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))

        self.styles.add(ParagraphStyle(
            name='CustomBody',
            parent=self.styles['BodyText'],
            fontSize=11,
            textColor=colors.HexColor('#1f2937'),
            spaceAfter=12,
            alignment=TA_JUSTIFY,
            fontName='Helvetica'
        ))

    def create_title_page(self) -> list:
        """
        Create title page elements

        Returns:
            List of ReportLab flowables
        """
        story = []

        # Title
        title = Paragraph(
            "Premier League Performance Analysis Report",
            self.styles['CustomTitle']
        )
        story.append(title)
        story.append(Spacer(1, 0.5 * inch))

        # Subtitle
        subtitle = Paragraph(
            "Expected Goals (xG) Regression Analysis",
            self.styles['Heading2']
        )
        story.append(subtitle)
        story.append(Spacer(1, 0.3 * inch))

        # Date
        date_text = Paragraph(
            f"Generated: {datetime.now().strftime('%B %d, %Y')}",
            self.styles['Normal']
        )
        story.append(date_text)
        story.append(Spacer(1, 1 * inch))

        # Executive Summary
        summary_title = Paragraph("Executive Summary", self.styles['CustomHeading'])
        story.append(summary_title)

        summary_text = """
        This report analyzes Premier League team performance using Expected Goals (xG) metrics
        to identify teams at risk of performance regression. By comparing actual points earned
        against expected points calculated from xG data using Poisson distribution, we identify
        teams that are significantly overperforming or underperforming their underlying metrics.
        <br/><br/>
        Teams with large positive variance (actual points significantly exceeding expected points)
        are at risk of regression to the mean, which could impact transfer and management decisions.
        This analysis helps clubs avoid costly reactive decisions by identifying unsustainable
        performance patterns early.
        """
        story.append(Paragraph(summary_text, self.styles['CustomBody']))
        story.append(PageBreak())

        return story

    def create_methodology_section(self) -> list:
        """
        Create methodology section

        Returns:
            List of ReportLab flowables
        """
        story = []

        title = Paragraph("Methodology", self.styles['CustomHeading'])
        story.append(title)

        methodology_text = """
        <b>1. Data Collection:</b> Expected Goals (xG) data scraped from FBRef.com for the current
        Premier League season.<br/><br/>

        <b>2. Expected Points Calculation:</b> Using Poisson distribution based on xG for/against,
        we calculate the probability of win/draw/loss for each match and derive expected points (xPTS).<br/><br/>

        <b>3. Variance Analysis:</b> Calculate the difference between actual points and expected points.
        Z-scores are computed to determine statistical significance (p < 0.05).<br/><br/>

        <b>4. Risk Scoring:</b> Teams are assigned risk scores (0-100) based on variance magnitude:<br/>
        - Critical Risk (90-100): Variance > +5 points<br/>
        - High Risk (70-89): Variance +3 to +5 points<br/>
        - Moderate Risk (40-69): Variance +1 to +3 points<br/>
        - Low Risk (0-39): Variance < +1 point<br/><br/>

        <b>5. Regression Probability:</b> Calculated based on variance magnitude and statistical significance.
        """
        story.append(Paragraph(methodology_text, self.styles['CustomBody']))
        story.append(Spacer(1, 0.3 * inch))

        return story

    def create_high_risk_teams_table(self, df: pd.DataFrame) -> list:
        """
        Create table of high-risk teams

        Args:
            df: DataFrame with analysis data

        Returns:
            List of ReportLab flowables
        """
        story = []

        title = Paragraph("High-Risk Teams Analysis", self.styles['CustomHeading'])
        story.append(title)

        # Filter high-risk teams (variance > +3)
        high_risk = df[df['Variance'] > 3].sort_values('Risk_Score', ascending=False)

        if len(high_risk) == 0:
            story.append(Paragraph(
                "No teams currently identified as high risk for regression.",
                self.styles['CustomBody']
            ))
            return story

        # Prepare table data
        table_data = [['Team', 'Actual Pts', 'xPTS', 'Variance', 'Risk Score', 'Regression Prob']]

        for _, row in high_risk.iterrows():
            table_data.append([
                row['Team'],
                f"{int(row['Actual_Points'])}",
                f"{row['xPTS']:.1f}",
                f"+{row['Variance']:.1f}",
                f"{int(row['Risk_Score'])}",
                f"{row['Regression_Probability']:.1%}"
            ])

        # Create table
        table = Table(table_data, colWidths=[2.5 * inch, 1 * inch, 1 * inch, 1 * inch, 1 * inch, 1.2 * inch])

        # Style table
        table.setStyle(TableStyle([
            # Header
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f2937')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),

            # Body
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),  # Team names left-aligned
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))

        story.append(table)
        story.append(Spacer(1, 0.3 * inch))

        return story

    def create_underperforming_teams_table(self, df: pd.DataFrame) -> list:
        """
        Create table of underperforming teams

        Args:
            df: DataFrame with analysis data

        Returns:
            List of ReportLab flowables
        """
        story = []

        title = Paragraph("Underperforming Teams Analysis", self.styles['CustomHeading'])
        story.append(title)

        # Filter underperforming teams (variance < -3)
        underperforming = df[df['Variance'] < -3].sort_values('Variance')

        if len(underperforming) == 0:
            story.append(Paragraph(
                "No teams currently identified as significantly underperforming.",
                self.styles['CustomBody']
            ))
            return story

        # Prepare table data
        table_data = [['Team', 'Actual Pts', 'xPTS', 'Variance', 'Potential Pts Lost']]

        for _, row in underperforming.iterrows():
            potential_lost = abs(row['Variance'])
            table_data.append([
                row['Team'],
                f"{int(row['Actual_Points'])}",
                f"{row['xPTS']:.1f}",
                f"{row['Variance']:.1f}",
                f"{potential_lost:.1f}"
            ])

        # Create table
        table = Table(table_data, colWidths=[2.5 * inch, 1.2 * inch, 1.2 * inch, 1.2 * inch, 1.5 * inch])

        # Style table
        table.setStyle(TableStyle([
            # Header
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f2937')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),

            # Body
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),  # Team names left-aligned
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))

        story.append(table)
        story.append(Spacer(1, 0.3 * inch))

        return story

    def add_chart(self, chart_path: str, width: float = 6 * inch) -> list:
        """
        Add chart image to report

        Args:
            chart_path: Path to chart image
            width: Width of image in report

        Returns:
            List of ReportLab flowables
        """
        story = []

        if Path(chart_path).exists():
            img = Image(chart_path, width=width)
            # Maintain aspect ratio
            aspect = img.imageHeight / img.imageWidth
            img.drawHeight = width * aspect
            story.append(img)
            story.append(Spacer(1, 0.2 * inch))
        else:
            logger.warning(f"Chart not found: {chart_path}")

        return story

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

    def generate_report(self, df: pd.DataFrame, charts: dict, output_file: str = "premier_league_report.pdf") -> str:
        """
        Generate complete PDF report

        Args:
            df: DataFrame with analysis data
            charts: Dictionary with chart paths
            output_file: Output PDF filename

        Returns:
            Path to generated report
        """
        logger.info("Generating PDF report...")

        output_path = self.output_dir / output_file

        # Create PDF document
        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )

        # Build story (content)
        story = []

        # Title page
        story.extend(self.create_title_page())

        # Methodology
        story.extend(self.create_methodology_section())
        story.append(PageBreak())

        # League overview chart
        story.append(Paragraph("League Overview", self.styles['CustomHeading']))
        if 'league_table' in charts:
            story.extend(self.add_chart(charts['league_table'], width=6.5 * inch))
        story.append(PageBreak())

        # Actual vs Expected chart
        story.append(Paragraph("Performance Analysis: Actual vs Expected Points", self.styles['CustomHeading']))
        if 'actual_vs_expected' in charts:
            story.extend(self.add_chart(charts['actual_vs_expected'], width=6 * inch))
        story.append(Spacer(1, 0.2 * inch))

        # Variance chart
        story.append(Paragraph("Variance Analysis by Team", self.styles['CustomHeading']))
        if 'variance_by_team' in charts:
            story.extend(self.add_chart(charts['variance_by_team'], width=6 * inch))
        story.append(PageBreak())

        # Risk distribution
        story.append(Paragraph("Risk Distribution", self.styles['CustomHeading']))
        if 'risk_distribution' in charts:
            story.extend(self.add_chart(charts['risk_distribution'], width=5 * inch))
        story.append(Spacer(1, 0.3 * inch))

        # High-risk teams table
        story.extend(self.create_high_risk_teams_table(df))
        story.append(Spacer(1, 0.3 * inch))

        # Underperforming teams table
        story.extend(self.create_underperforming_teams_table(df))

        # Build PDF
        doc.build(story)

        logger.info(f"Report saved to {output_path}")

        return str(output_path)

    def run(self, analysis_file: str = "risk_analysis.csv",
            charts: dict = None, output_file: str = "premier_league_report.pdf") -> str:
        """
        Run the complete report generation process

        Args:
            analysis_file: Input CSV file with analysis data
            charts: Dictionary with chart paths (if None, will look for default charts)
            output_file: Output PDF filename

        Returns:
            Path to generated report
        """
        logger.info("Starting report generation...")

        # Load analysis data
        df = self.load_analysis_data(analysis_file)

        # If charts not provided, use default chart paths
        if charts is None:
            charts = {
                'actual_vs_expected': str(self.charts_dir / 'actual_vs_expected.png'),
                'variance_by_team': str(self.charts_dir / 'variance_by_team.png'),
                'league_table': str(self.charts_dir / 'league_table.png'),
                'risk_distribution': str(self.charts_dir / 'risk_distribution.png')
            }

        # Generate report
        report_path = self.generate_report(df, charts, output_file)

        logger.info("Report generation completed successfully")

        return report_path


def main():
    """Main function for testing the reporter"""
    reporter = PerformanceReportGenerator()

    try:
        report_path = reporter.run()
        print(f"\n=== PDF Report Generated ===")
        print(f"Report saved to: {report_path}")

    except FileNotFoundError as e:
        logger.error(f"Error: {e}")
        logger.info("Please run the scraper, calculator, analyzer, and visualizer first.")


if __name__ == "__main__":
    main()
