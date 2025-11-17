// src/store/selector.ts
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./index";

const selectAnalytics = (state: RootState) => state.analytics;

export const selectAnalyticsMeta = createSelector(
  [selectAnalytics],
  ({ loading, error, page, pageSize, sort, filterChannel }) => ({
    loading,
    error,
    page,
    pageSize,
    sort,
    filterChannel,
  })
);

export const selectAllData = createSelector(
  [selectAnalytics],
  (analytics) => analytics.data
);

export const selectFiltered = createSelector(
  [selectAllData, selectAnalytics],
  (data, { filterChannel }) => {
    if (filterChannel === "all") return data;
    return data.filter((r) => r.channel === filterChannel);
  }
);

export const selectSorted = createSelector(
  [selectFiltered, selectAnalytics],
  (rows, { sort }) => {
    if (!sort) return rows;
    const { key, direction } = sort;
    const sorted = [...rows].sort((a, b) => {
      const av = a[key];
      const bv = b[key];

      if (typeof av === "number" && typeof bv === "number") {
        return direction === "asc" ? av - bv : bv - av;
      }

      return direction === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return sorted;
  }
);

export const selectPaged = createSelector(
  [selectSorted, selectAnalytics],
  (rows, { page, pageSize }) =>
    rows.slice((page - 1) * pageSize, page * pageSize)
);

export const selectTotals = createSelector([selectFiltered], (rows) => {
  const base = rows.reduce(
    (acc, r) => {
      acc.spend += r.spend;
      acc.impressions += r.impressions;
      acc.conversions += r.conversions;
      return acc;
    },
    { spend: 0, impressions: 0, conversions: 0 }
  );

  const ctr =
    base.impressions === 0
      ? 0
      : (base.conversions / base.impressions) * 100;

  return { ...base, ctr };
});

export const selectChannelOptions = createSelector(
  [selectAllData],
  (rows) => Array.from(new Set(rows.map((r) => r.channel))).sort()
);
