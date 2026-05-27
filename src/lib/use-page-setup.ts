"use client";

import { useEffect } from "react";
import { useTopBar, BreadcrumbItem } from "./topbar-context";

export function usePageSetup(breadcrumbs: BreadcrumbItem[], showDatePicker = false) {
  const { setBreadcrumbs, setShowDatePicker } = useTopBar();

  useEffect(() => {
    setBreadcrumbs(breadcrumbs);
    setShowDatePicker(showDatePicker);
    return () => {
      setBreadcrumbs([]);
      setShowDatePicker(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(breadcrumbs), showDatePicker]);
}
