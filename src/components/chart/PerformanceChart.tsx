import { useMemo } from "react";
import { useAppSelector } from "../../store/hooks";
import { selectFiltered } from "../../store/selector";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type ChartPoint = {
  channel: string;
  spend: number;
  conversions: number;
};

const TOP_N = 10;

export function PerformanceChart() {
  const rows = useAppSelector(selectFiltered);

  const data: ChartPoint[] = useMemo(() => {
    if (!rows.length) return [];

    const byChannel = new Map<string, { spend: number; conversions: number }>();

    for (const r of rows) {
      const existing = byChannel.get(r.channel);
      if (existing) {
        existing.spend += r.spend;
        existing.conversions += r.conversions;
      } else {
        byChannel.set(r.channel, {
          spend: r.spend,
          conversions: r.conversions,
        });
      }
    }

    const aggregated: ChartPoint[] = Array.from(byChannel.entries()).map(
      ([channel, totals]) => ({
        channel,
        spend: totals.spend,
        conversions: totals.conversions,
      })
    );

    // sort by spend desc and keep top N
    aggregated.sort((a, b) => b.spend - a.spend);

    return aggregated.slice(0, TOP_N);
  }, [rows]);

  return (
    <div className="chart-container">
      <h2 className="section-title">Performance Insights</h2>
      <div className="chart-inner">
        {data.length === 0 ? (
          <p className="chart-empty">No data to display</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data}
              margin={{ top: 8, right: 16, bottom: 24, left: 8 }}
            >
              <XAxis
                dataKey="channel"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-30}
                textAnchor="end"
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(v: number) =>
                  v >= 1_000_000
                    ? `${(v / 1_000_000).toFixed(1)}M`
                    : v >= 1_000
                    ? `${(v / 1_000).toFixed(1)}k`
                    : `${v}`
                }
              />
              <Tooltip<number, string>
                formatter={(value: number, name: string) => [
                  value.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  }),
                  name,
                ]}
              />
              <Legend />
              <Bar dataKey="spend" name="Spend" fill="#2563eb" />
              <Bar dataKey="conversions" name="Conversions" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
