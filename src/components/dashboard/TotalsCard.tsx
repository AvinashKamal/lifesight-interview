// import React from "react";

type Totals = {
  spend: number;
  impressions: number;
  conversions: number;
  ctr: number;
};

type TotalsCardProps = {
  totals: Totals;
  loading: boolean;
};

export function TotalsCard({ totals, loading }: TotalsCardProps) {
  if (loading) {
    return <div className="totals-skeleton">Loading totals...</div>;
  }

  return (
    <div className="totals">
      <div className="totals-item">
        <div className="totals-label">Total Spend</div>
        <div className="totals-value">
          {totals.spend.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
      <div className="totals-item">
        <div className="totals-label">Conversions</div>
        <div className="totals-value">
          {totals.conversions.toLocaleString()}
        </div>
      </div>
      <div className="totals-item">
        <div className="totals-label">CTR</div>
        <div className="totals-value">{totals.ctr.toFixed(2)}%</div>
      </div>
    </div>
  );
}
