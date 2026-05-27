"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { format, subDays } from "date-fns";
import { DateRange } from "@/types";

function defaultRange(): DateRange {
  const today = new Date();
  return { from: format(subDays(today, 7), "yyyy-MM-dd"), to: format(today, "yyyy-MM-dd") };
}

export type BreadcrumbItem = { label: string; href?: string };

export type TopBarState = {
  breadcrumbs: BreadcrumbItem[];
  dateRange: DateRange;
  activePeriod: string;
  showDatePicker: boolean;
};

type TopBarContextValue = TopBarState & {
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
  setDateRange: (range: DateRange, period?: string) => void;
  setShowDatePicker: (show: boolean) => void;
};

const TopBarContext = createContext<TopBarContextValue | null>(null);

export function TopBarProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [dateRange, setDateRangeState] = useState<DateRange>(defaultRange);
  const [activePeriod, setActivePeriod] = useState("7d");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const setDateRange = useCallback((range: DateRange, period?: string) => {
    setDateRangeState(range);
    if (period) setActivePeriod(period);
  }, []);

  return (
    <TopBarContext.Provider value={{
      breadcrumbs, setBreadcrumbs,
      dateRange, activePeriod, setDateRange,
      showDatePicker, setShowDatePicker,
    }}>
      {children}
    </TopBarContext.Provider>
  );
}

export function useTopBar() {
  const ctx = useContext(TopBarContext);
  if (!ctx) throw new Error("useTopBar must be used inside TopBarProvider");
  return ctx;
}
