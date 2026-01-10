'use client';

export default function Glossary() {
  return (
    <div className="card p-8 bg-white">
      <h2 className="text-2xl font-semibold text-slate-900 mb-6 tracking-tight">Complete Glossary</h2>

      <div className="space-y-6">
        {/* Core Metrics */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-slate-200 pb-2">Core Metrics</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-slate-900">Expected Goals (xG)</p>
              <p className="text-slate-700">
                A statistical measure of shot quality. Each shot is assigned a probability of scoring based on factors like distance, angle,
                and type of assist. A penalty has ~0.76 xG (76% chance), while a long-range effort might be 0.03 xG (3% chance).
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Expected Goals Against (xGA)</p>
              <p className="text-slate-700">
                The quality of chances conceded to opponents. High xGA means your defense is allowing dangerous opportunities.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Expected Points (xPTS)</p>
              <p className="text-slate-700">
                Points a team SHOULD have based on their xG performance. Calculated using Poisson distribution to model goal probabilities,
                then converting to expected points (Win = 3pts, Draw = 1pt, Loss = 0pts).
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Actual Points</p>
              <p className="text-slate-700">
                The real points earned in the league table. Wins = 3pts, Draws = 1pt, Losses = 0pts.
              </p>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-slate-200 pb-2">Performance Indicators</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-slate-900">Variance</p>
              <p className="text-slate-700">
                Actual Points minus Expected Points (Pts - xPTS). Shows if a team is over or underperforming their underlying quality.
                <br/>
                <span className="text-red-700 font-medium">Positive (+3 or more):</span> Overperforming - getting more points than deserved.
                <br/>
                <span className="text-blue-700 font-medium">Negative (-3 or less):</span> Underperforming - getting fewer points than deserved.
                <br/>
                <span className="text-slate-600 font-medium">-2 to +2:</span> Performing as expected - results match quality.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Overperforming</p>
              <p className="text-slate-700">
                A team getting better results than their chance quality suggests. Example: Scoring on low-quality chances or clean sheets
                despite allowing dangerous shots. Usually unsustainable - expect regression (performance drop).
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Underperforming</p>
              <p className="text-slate-700">
                A team getting worse results than their chance quality suggests. Example: Missing great chances or conceding from weak shots.
                Usually temporary - expect natural improvement without major changes.
              </p>
            </div>
          </div>
        </div>

        {/* Statistical Measures */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-slate-200 pb-2">Statistical Measures</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-slate-900">Z-Score</p>
              <p className="text-slate-700">
                Measures how extreme a team's variance is compared to all other teams. Uses standard deviation from the mean.
                <br/>
                <span className="font-medium">Above +2.0:</span> Extremely unusual (top 2.5%) - very lucky
                <br/>
                <span className="font-medium">+1.0 to +2.0:</span> Notable outlier (top 16%)
                <br/>
                <span className="font-medium">-1.0 to +1.0:</span> Normal range (68% of teams)
                <br/>
                <span className="font-medium">Below -2.0:</span> Extremely unusual (bottom 2.5%) - very unlucky
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">P-Value</p>
              <p className="text-slate-700">
                The probability that the observed variance is due to random chance rather than a real pattern.
                <br/>
                <span className="font-medium">Below 0.05 (*):</span> Statistically significant - less than 5% chance it's random luck
                <br/>
                <span className="font-medium">Above 0.05:</span> Not significant - could be normal variation
                <br/>
                Teams marked with * have variance that's unlikely to be coincidence and will likely normalize.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Regression Probability</p>
              <p className="text-slate-700">
                Likelihood that current performance will revert toward expected levels (regression to the mean).
                <br/>
                <span className="font-medium">70-90%:</span> Very likely to change (high confidence)
                <br/>
                <span className="font-medium">40-69%:</span> Moderately likely to change
                <br/>
                <span className="font-medium">Below 40%:</span> Current performance is relatively sustainable
              </p>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-slate-200 pb-2">Risk Assessment</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-slate-900">Risk Score (0-100)</p>
              <p className="text-slate-700">
                Overall assessment of regression risk. Higher scores = higher likelihood of performance drop.
                <br/>
                <span className="text-red-700 font-medium">90-100 (Critical):</span> Extreme overperformance - major regression very likely
                <br/>
                <span className="text-orange-700 font-medium">70-89 (High):</span> Significant overperformance - regression likely
                <br/>
                <span className="text-yellow-700 font-medium">40-69 (Moderate):</span> Some overperformance - moderate risk
                <br/>
                <span className="text-green-700 font-medium">0-39 (Low):</span> Sustainable performance or underperforming (will improve)
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Performance Status</p>
              <p className="text-slate-700">
                Simple classification based on variance:
                <br/>
                <span className="font-medium">Overperforming:</span> Variance &gt; +3 points
                <br/>
                <span className="font-medium">As Expected:</span> Variance between -3 and +3 points
                <br/>
                <span className="font-medium">Underperforming:</span> Variance &lt; -3 points
              </p>
            </div>
          </div>
        </div>

        {/* Positions */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-slate-200 pb-2">Position Metrics</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-slate-900">Actual Position</p>
              <p className="text-slate-700">
                Current league table position based on actual points earned.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Expected Position</p>
              <p className="text-slate-700">
                Where a team SHOULD be in the table based on their xPTS. Large gaps between actual and expected position
                indicate unsustainable performance (either very lucky or very unlucky).
              </p>
            </div>
          </div>
        </div>

        {/* Key Concepts */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-slate-200 pb-2">Key Concepts</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-slate-900">Regression to the Mean</p>
              <p className="text-slate-700">
                A statistical principle: extreme results tend to be followed by more moderate ones. Teams overperforming their xG
                will likely drop points as their finishing/goalkeeping normalizes. Teams underperforming will likely gain points.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Poisson Distribution</p>
              <p className="text-slate-700">
                A mathematical model used to predict goal-scoring probabilities. Based on historical data showing goals follow
                this distribution pattern. Used to convert xG into expected match outcomes and points.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
