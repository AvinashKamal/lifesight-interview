// components/dashboard/DashboardPage.tsx

import { useEffect, useCallback } from "react";
import { PageLayout } from "../layouts/PageLayout";
import { Card } from "../layouts/Card";
import { TotalsCard } from "./TotalsCard";
import { ContributionSection } from "./ContributionSection";
import { PerformanceChart } from "../chart/PerformanceChart";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  loadStart,
  loadSuccess,
  loadError,
  setFilterChannel,
  setPage,
  setSort,
  type SortState,
} from "../../store/analyticsSlice";
import {
  selectTotals,
  selectAnalyticsMeta,
  selectSorted,
  selectChannelOptions,
  selectPaged,
} from "../../store/selector";
import dataset from "../../data/dataset.json";
import type { ChannelRecord } from "../../types";

// shape of the JSON file
type RawChannelRecord = {
  id: number;
  channel: string;
  region: string;
  spend: number;
  impressions: number;
  conversions: number;
  clicks: number;
};

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const totals = useAppSelector(selectTotals);
  const meta = useAppSelector(selectAnalyticsMeta);
  const channelOptions = useAppSelector(selectChannelOptions);

  // Paginated rows for the table – this is what we group by region
  const pagedRows = useAppSelector(selectPaged);

  // Total rows across filtered+sorted data, for pagination controls
  const totalRows = useAppSelector(selectSorted).length;

  useEffect(() => {
    dispatch(loadStart());
    try {
      const raw = dataset as RawChannelRecord[];

      const typed: ChannelRecord[] = raw.map((r) => ({
        id: r.id,
        channel: r.channel,
        region: r.region,
        spend: r.spend,
        impressions: r.impressions,
        conversions: r.conversions,
        clicks: r.clicks,
      }));

      dispatch(loadSuccess(typed));
    } catch {
      dispatch(loadError("Failed to load dataset"));
    }
  }, [dispatch]);

  const handleSortChange = useCallback(
    (next: SortState) => dispatch(setSort(next)),
    [dispatch]
  );

  const handleFilterChange = useCallback(
    (value: string | "all") => dispatch(setFilterChannel(value)),
    [dispatch]
  );

  const handlePageChange = useCallback(
    (page: number) => dispatch(setPage(page)),
    [dispatch]
  );

  return (
    <PageLayout title="Marketing Dashboard">
      <div className="top-row">
        <Card>
          <TotalsCard totals={totals} loading={meta.loading} />
        </Card>
        <Card>
          <PerformanceChart />
        </Card>
      </div>

      <ContributionSection
        rows={pagedRows}          // <-- only current page
        totalRows={totalRows}     // <-- for pagination UI
        page={meta.page}
        pageSize={meta.pageSize}
        sort={meta.sort}
        loading={meta.loading}
        channels={channelOptions}
        filterChannel={meta.filterChannel}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
      />
    </PageLayout>
  );
}
