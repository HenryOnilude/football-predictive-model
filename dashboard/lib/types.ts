export interface TeamData {
  Team: string;
  Matches: number;
  Actual_Points: number;
  Goals_For: number;
  Goals_Against: number;
  xG_For: number;
  xG_Against: number;
  xPTS: number;
  Variance: number;
  Position_Actual: number;
  Position_Expected: number;
  Z_Score: number;
  P_Value: number;
  Significant: boolean;
  Risk_Score: number;
  Risk_Category: 'Critical' | 'High' | 'Moderate' | 'Low';
  Regression_Probability: number;
  Performance_Status: 'Overperforming' | 'Underperforming' | 'As Expected';
  // Post-Shot xG metrics (optional - for advanced analysis)
  PSxG?: number;        // Post-Shot Expected Goals (shot quality)
  xGOT?: number;        // Expected Goals On Target
}

export interface DashboardData {
  teams: TeamData[];
  lastUpdated: string;
}
