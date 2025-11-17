// src/store/analyticsSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ChannelRecord } from "../types";

export type SortDirection = "asc" | "desc";

export type SortKey = keyof Pick<
  ChannelRecord,
  "channel" | "region" | "spend" | "impressions" | "conversions" | "clicks"
>;

export type SortState = {
  key: SortKey;
  direction: SortDirection;
};

export interface AnalyticsState {
  data: ChannelRecord[];
  loading: boolean;
  error: string | null;
  filterChannel: string | "all";
  page: number;
  pageSize: number;
  sort: SortState | null;
}

const initialState: AnalyticsState = {
  data: [],
  loading: false,
  error: null,
  filterChannel: "all",
  page: 1,
  pageSize: 25,
  sort: { key: "channel", direction: "asc" },
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    loadStart(state) {
      state.loading = true;
      state.error = null;
    },
    loadSuccess(state, action: PayloadAction<ChannelRecord[]>) {
      state.loading = false;
      state.data = action.payload;
    },
    loadError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    setFilterChannel(state, action: PayloadAction<string | "all">) {
      state.filterChannel = action.payload;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setSort(state, action: PayloadAction<SortState>) {
      state.sort = action.payload;
      state.page = 1;
    },
  },
});

export const {
  loadStart,
  loadSuccess,
  loadError,
  setFilterChannel,
  setPage,
  setSort,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
