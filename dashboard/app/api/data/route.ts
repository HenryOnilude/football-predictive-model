import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the risk_analysis.csv file from the Python output
    const dataPath = path.join(process.cwd(), '..', 'data', 'risk_analysis.csv');

    if (!fs.existsSync(dataPath)) {
      return NextResponse.json(
        { error: 'Data file not found. Please run the Python analysis first.' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const lines = fileContent.trim().split('\n');
    const headers = lines[0].split(',');

    const teams = lines.slice(1).map(line => {
      const values = line.split(',');
      const team: any = {};

      headers.forEach((header, index) => {
        const value = values[index];

        // Convert to appropriate types
        if (header === 'Team' || header === 'Risk_Category' || header === 'Performance_Status') {
          team[header] = value;
        } else if (header === 'Significant') {
          team[header] = value.toLowerCase() === 'true';
        } else if (header === 'Matches' || header === 'Actual_Points' || header === 'Goals_For' ||
                   header === 'Goals_Against' || header === 'Position_Actual' || header === 'Position_Expected' ||
                   header === 'Risk_Score') {
          team[header] = parseInt(value, 10);
        } else {
          team[header] = parseFloat(value);
        }
      });

      return team;
    });

    // Get file modification time for lastUpdated
    const stats = fs.statSync(dataPath);
    const lastUpdated = stats.mtime.toISOString();

    return NextResponse.json({
      teams,
      lastUpdated
    });
  } catch (error) {
    console.error('Error reading data:', error);
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    );
  }
}
