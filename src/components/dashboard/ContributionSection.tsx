// components/dashboard/ContributionSection.tsx
import { useCallback, useMemo, useState, Fragment } from "react";
import { Card } from "../layouts/Card";
import { FiltersBar } from "./FiltersBar";
import { PaginationControls } from "./PaginationControls";
import type { ChannelRecord } from "../../types";
import type { SortState } from "../../store/analyticsSlice";
import { Button } from "../ui/Button";

type ContributionSectionProps = {
  rows: ChannelRecord[];                  // paginated rows for THIS PAGE
  totalRows: number;                      // total across filtered+sorted
  page: number;
  pageSize: number;
  sort: SortState | null;
  loading: boolean;
  channels: string[];
  filterChannel: string | "all";
  onFilterChange: (value: string | "all") => void;
  onSortChange: (sort: SortState) => void;
  onPageChange: (page: number) => void;
};

type MetricKey = "spend" | "impressions" | "conversions" | "clicks";

type CategoryColumn = {
  key: "category";
  label: string;
  numeric?: false;
};

type MetricColumn = {
  key: MetricKey;
  label: string;
  numeric?: boolean;
};

type Column = CategoryColumn | MetricColumn;

type ChannelGroup = {
  channel: string;
  totals: {
    spend: number;
    impressions: number;
    conversions: number;
    clicks: number;
  };
};

type RegionGroup = {
  region: string;
  totals: {
    spend: number;
    impressions: number;
    conversions: number;
    clicks: number;
  };
  channels: ChannelGroup[];
};

export function ContributionSection({
  rows,
  totalRows,
  page,
  pageSize,
  sort,
  loading,
  channels,
  filterChannel,
  onFilterChange,
  onSortChange,
  onPageChange,
}: ContributionSectionProps) {
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>(
    {}
  );

  const columns: Column[] = [
    { key: "category", label: "Category" },
    { key: "spend", label: "Spend", numeric: true },
    { key: "impressions", label: "Impressions", numeric: true },
    { key: "conversions", label: "Conversions", numeric: true },
    { key: "clicks", label: "Clicks", numeric: true },
  ];

  const handleSortChange = useCallback(
    (key: MetricKey) => {
      const mappedKey = key as SortState["key"];

      if (!sort || sort.key !== mappedKey) {
        onSortChange({ key: mappedKey, direction: "asc" });
      } else {
        onSortChange({
          key: mappedKey,
          direction: sort.direction === "asc" ? "desc" : "asc",
        });
      }
    },
    [onSortChange, sort]
  );

  const toggleRegion = useCallback((region: string) => {
    setExpandedRegions((prev) => ({
      ...prev,
      [region]: prev[region] === false,
    }));
  }, []);

  const isRegionExpanded = useCallback(
    (region: string) => expandedRegions[region] !== false,
    [expandedRegions]
  );

  // Group by region and then channel; aggregate metrics for THIS PAGE ONLY
  const groups: RegionGroup[] = useMemo(() => {
    const regionMap = new Map<string, ChannelRecord[]>();

    rows.forEach((row) => {
      const regionKey = row.region || "Unknown";
      const existing = regionMap.get(regionKey);
      if (existing) {
        existing.push(row);
      } else {
        regionMap.set(regionKey, [row]);
      }
    });

    return Array.from(regionMap.entries()).map(([region, regionRows]) => {
      const regionTotals = regionRows.reduce(
        (acc, r) => {
          acc.spend += r.spend;
          acc.impressions += r.impressions;
          acc.conversions += r.conversions;
          acc.clicks += r.clicks;
          return acc;
        },
        { spend: 0, impressions: 0, conversions: 0, clicks: 0 }
      );

      const channelMap = new Map<string, ChannelRecord[]>();
      regionRows.forEach((r) => {
        const chKey = r.channel;
        const existing = channelMap.get(chKey);
        if (existing) {
          existing.push(r);
        } else {
          channelMap.set(chKey, [r]);
        }
      });

      const channelGroups: ChannelGroup[] = Array.from(
        channelMap.entries()
      ).map(([channel, channelRows]) => {
        const totals = channelRows.reduce(
          (acc, r) => {
            acc.spend += r.spend;
            acc.impressions += r.impressions;
            acc.conversions += r.conversions;
            acc.clicks += r.clicks;
            return acc;
          },
          { spend: 0, impressions: 0, conversions: 0, clicks: 0 }
        );

        return { channel, totals };
      });

      return { region, totals: regionTotals, channels: channelGroups };
    });
  }, [rows]);

  // Totals across THIS PAGE ONLY
  const pageTotals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => {
          acc.spend += r.spend;
          acc.impressions += r.impressions;
          acc.conversions += r.conversions;
          acc.clicks += r.clicks;
          return acc;
        },
        { spend: 0, impressions: 0, conversions: 0, clicks: 0 }
      ),
    [rows]
  );

  const hasData = groups.length > 0;

  return (
    <Card>
      <FiltersBar
        channel={filterChannel}
        channels={channels}
        search=""
        onChannelChange={onFilterChange}
        onSearchChange={() => {}}
      />

      <div className="table-card">
        <div className="table-header">
          <h2 className="table-title">Contribution</h2>
          <Button variant="secondary">Configure Profit Settings</Button>
        </div>

        <div className="table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                {columns.map((col) => {
                  if (col.key === "category") {
                    return (
                      <th key="category" className="th-category">
                        {col.label}
                      </th>
                    );
                  }

                  const isSorted = sort?.key === col.key;
                  const dir = sort?.direction;
                  const metricKey: MetricKey = col.key;

                  return (
                    <th
                      key={metricKey}
                      className={col.numeric ? "th-numeric" : ""}
                    >
                      <button
                        type="button"
                        className="th-button"
                        onClick={() => handleSortChange(metricKey)}
                      >
                        <span>{col.label}</span>
                        {isSorted && (
                          <span className="th-sort-indicator">
                            {dir === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="td-center">
                    Loading rows...
                  </td>
                </tr>
              ) : !hasData ? (
                <tr>
                  <td colSpan={columns.length} className="td-center">
                    No data available
                  </td>
                </tr>
              ) : (
                <>
                  {groups.map((group) => {
                    const expanded = isRegionExpanded(group.region);

                    return (
                      <Fragment key={group.region}>
                        {/* Region aggregated row (page-level) */}
                        <tr className="region-row">
                          <td className="category-cell region-cell">
                            <button
                              type="button"
                              className="region-toggle"
                              onClick={() => toggleRegion(group.region)}
                              aria-expanded={expanded}
                            >
                              {expanded ? "▾" : "▸"}
                            </button>
                            <span>{group.region}</span>
                          </td>
                          <td className="td-numeric">
                            {group.totals.spend.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="td-numeric">
                            {group.totals.impressions.toLocaleString()}
                          </td>
                          <td className="td-numeric">
                            {group.totals.conversions.toLocaleString()}
                          </td>
                          <td className="td-numeric">
                            {group.totals.clicks.toLocaleString()}
                          </td>
                        </tr>

                        {/* Channel rows within region (page-level) */}
                        {expanded &&
                          group.channels.map((ch) => (
                            <tr
                              key={`${group.region}-${ch.channel}`}
                              className="channel-row"
                            >
                              <td className="category-cell channel-cell">
                                <span className="tree-line-vert" />
                                <span className="tree-line-horiz" />
                                <span>{ch.channel}</span>
                              </td>
                              <td className="td-numeric">
                                {ch.totals.spend.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="td-numeric">
                                {ch.totals.impressions.toLocaleString()}
                              </td>
                              <td className="td-numeric">
                                {ch.totals.conversions.toLocaleString()}
                              </td>
                              <td className="td-numeric">
                                {ch.totals.clicks.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                      </Fragment>
                    );
                  })}

                  {/* Total row across all rows on this page */}
                  <tr className="total-row">
                    <td className="category-cell total-cell">Total</td>
                    <td className="td-numeric">
                      {pageTotals.spend.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="td-numeric">
                      {pageTotals.impressions.toLocaleString()}
                    </td>
                    <td className="td-numeric">
                      {pageTotals.conversions.toLocaleString()}
                    </td>
                    <td className="td-numeric">
                      {pageTotals.clicks.toLocaleString()}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationControls
        page={page}
        pageSize={pageSize}
        totalRows={totalRows}
        onPageChange={onPageChange}
      />
    </Card>
  );
}
