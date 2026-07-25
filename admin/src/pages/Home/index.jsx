import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import { DashboardView } from "./components/DashboardView";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { readStoredOrder, saveStoredOrder } from "./utils/dashboardStorage";

export default function ContentHome() {
  const { canGlobal } = useAuth();
  const canViewStatistics = canGlobal("STATISTIC", "VIEW");
  const [widgetOrder, setWidgetOrder] = useState(readStoredOrder);
  const dashboardStats =
    useDashboardStats(canViewStatistics);

  useEffect(() => {
    saveStoredOrder(widgetOrder);
  }, [widgetOrder]);

  return (
    <div>
      <DashboardView
        canViewStatistics={canViewStatistics}
        {...dashboardStats}
        widgetOrder={widgetOrder}
        setWidgetOrder={setWidgetOrder}
      />
    </div>
  );
}
