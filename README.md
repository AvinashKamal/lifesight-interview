# Marketing Dashboard – Performance & State Management Challenge

This project is a React + TypeScript implementation of the **“Marketing Dashboard Performance Optimization”** assignment.

It focuses on:

- Efficient rendering of a **large dataset (~5,000 records)**  
- Clean **state management** with Redux Toolkit  
- **Frontend performance tuning** (memoisation, selectors, small DOM)  
- A custom-built UI (no CSS libraries)  

---

## Link to the Live URL - https://lifesight-interview.vercel.app/

## 1. Features vs Assignment Requirements

### ✅ Data loading

- Loads a JSON dataset (`data/dataset.json`) with the following fields:

  ```ts
  {
    id: number;
    channel: string;
    region: string;
    spend: number;
    impressions: number;
    conversions: number;
    clicks: number;
  }
  ```

- Data is normalised into a `ChannelRecord` TypeScript type and stored in Redux.

---

### ✅ Paginated, sortable, filterable table

- **Pagination**
  - Table shows a **paged slice** of the filtered + sorted dataset.
  - Page + pageSize stored in Redux.
  - `PaginationControls` component updates the `page` in Redux.

- **Sorting**
  - Sortable by metric columns: `spend`, `impressions`, `conversions`, `clicks`.
  - Clicking a header toggles `asc`/`desc`.
  - Sort state (`SortState`) stored in Redux and applied via a memoised selector.

- **Filtering**
  - Filter by `channel` via a dropdown in `FiltersBar`.
  - `filterChannel` stored in Redux.
  - Options are derived from the dataset via `selectChannelOptions`.

- **Region grouping**
  - Inside the `ContributionSection`, the **current page’s rows** are:
    - Grouped by `region`
    - Then grouped by `channel` within each region
  - For each region:
    - A **region summary row** shows aggregated metrics for that region (on this page).
    - Expanding the region shows rows for individual channels in that region.
  - A final **“Total”** row at the bottom shows page-level totals across all rows on that page.

---

### ✅ Totals and CTR

- `selectTotals` selector computes, for the **currently filtered** dataset:

  - Total **spend**
  - Total **impressions**
  - Total **conversions**
  - **CTR** = `conversions / impressions * 100` (safe-guarded for zero impressions)

- Rendered in `TotalsCard` at the top of the dashboard.

---

### ✅ Performance Insights chart (Recharts)

- `PerformanceChart` uses **Recharts** to render a bar chart.

- To avoid hanging the app:
  - Rows are **aggregated by channel** (sum of spend + conversions per channel).
  - Data is sorted by spend and limited to **top N channels** (configurable constant).
  - This keeps the chart small and avoids thousands of bars.

- The chart:
  - Uses `ResponsiveContainer` with a fixed height.
  - Displays:
    - Spend per channel
    - Conversions per channel
  - Shows a legend + formatted tooltip.

---

### ✅ State management

- Implemented with **Redux Toolkit**.

  - `analyticsSlice.ts`:
    - `data: ChannelRecord[]`
    - `loading`, `error`
    - `filterChannel`
    - `page`, `pageSize`
    - `sort` (`SortState` – key + direction)

  - Actions:
    - `loadStart`, `loadSuccess`, `loadError`
    - `setFilterChannel`
    - `setPage`
    - `setSort`

- Typed hooks:

  ```ts
  useAppDispatch();
  useAppSelector();
  ```

- Derived state and memoised selectors in `src/store/selector.ts`:
  - `selectAllData`
  - `selectFiltered`
  - `selectSorted`
  - `selectPaged`
  - `selectTotals`
  - `selectChannelOptions`
  - `selectAnalyticsMeta`

---

### ✅ Performance tuning

Key techniques used to avoid unnecessary work and keep Lighthouse happy:

- **Selectors + memoisation**
  - Filtering, sorting, and totals are implemented with `createSelector` so they recompute only when inputs change (data, filter, sort, page).

- **Per-page aggregation**
  - Region/channel grouping and “Total” row are computed **only for the current page** (paginated slice), not the entire dataset.

- **React hooks**
  - `useMemo` used for:
    - Grouping rows by region + channel
    - Computing per-page totals
    - Aggregating chart data by channel

  - `useCallback` used for:
    - Sort change handler
    - Filter change handler
    - Page change handler

  This keeps prop identities stable and reduces avoidable re-renders.

- **DOM size**
  - Table shows only one page of data at a time.
  - Chart is fed compact, aggregated data.
  - No huge DOM tree with thousands of rows/bars.

---

### ✅ Custom UI (no CSS frameworks)

Per the constraints:

- **No Tailwind / Bootstrap / MUI / Ant Design**.
- Styling done with **vanilla CSS** in `styles/*.css`.

Custom components include:

- `Button` – variants like primary/secondary.
- `Card` – basic layout container.
- `PageLayout` – top-level layout wrapper.
- `FiltersBar` – channel filter UI.
- `PaginationControls` – pagination buttons + info.
- `ContributionSection` – grouped table + header + actions.
- `TotalsCard` – top summary metrics.

The table styles are built to loosely match an analytics-style UI:

- Sticky header row.
- Right-aligned numeric columns with tabular numbers.
- Region rows visually distinct from channel rows.
- Tree-like lines for channels under a region.
- Hover feedback and subtle borders/shadows.

---

## 2. Tech Stack

- **React** (with hooks)
- **TypeScript**
- **Redux Toolkit**
- **Recharts** (for charting)
- **Vite** (dev/build tooling – assumed)
- **Vanilla CSS** (no UI/CSS frameworks)

---

## 3. Project Structure (high level)

```txt
src/
  main.tsx                # App entry
  App.tsx                 # Root app shell

  store/
    index.ts              # Store setup (configureStore, RootState, AppDispatch)
    analyticsSlice.ts     # Redux slice for analytics data + UI state
    selector.ts           # Memoised selectors (filter, sort, pagination, totals)
    hooks.ts              # Typed useAppDispatch/useAppSelector

  types.ts                # Shared TS types (ChannelRecord, etc.)

  data/
    dataset.json          # ~5,000-row marketing dataset

  components/
    layouts/
      PageLayout.tsx      # Page shell layout
      Card.tsx            # Card container

    ui/
      Button.tsx          # Custom button component

    dashboard/
      DashboardPage.tsx   # Main dashboard screen
      TotalsCard.tsx      # Summary metrics (spend, conv, CTR)
      ContributionSection.tsx
                          # Region-grouped table + filter + pagination
      FiltersBar.tsx      # Channel filter controls
      PaginationControls.tsx

    chart/
      PerformanceChart.tsx
                          # Aggregated channel-level bar chart

styles/
  base.css                # Global/base styles
  table.css               # Table + card + chart container styles
```

---

## 4. Running the Project

### Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Start dev server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Vite will serve the app on a local port (commonly `http://localhost:5173`).

### Build for production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

### Preview production build

```bash
npm run preview
# or
yarn preview
# or
pnpm preview
```

---

## 5. Notes for Reviewers

- All UI elements (buttons, inputs, table, layout) are **hand-coded** with vanilla CSS – no CSS/UI libraries.
- Heavy computations (filtering, sorting, aggregation) are done:
  - In **selectors** or
  - In **`useMemo`** based on the **current page** of data.
- The chart is explicitly optimised to avoid rendering thousands of bars at once:
  - Aggregated by channel
  - Limited to top N channels
- The table is **grouped by region** and then by **channel**, which matches the provided sample UI while still honouring pagination and performance concerns.
