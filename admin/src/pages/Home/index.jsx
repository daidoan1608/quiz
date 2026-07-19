import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import { DashboardView } from "./components/DashboardView";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { readStoredOrder, saveStoredOrder } from "./utils/dashboardStorage";

export default function ContentHome() {
  const { canGlobal } = useAuth();
  const canViewStatistics = canGlobal("STATISTIC", "VIEW");
  const [widgetOrder, setWidgetOrder] = useState(readStoredOrder);
  const { loading, statistics, tableLimits, updateLimit } =
    useDashboardStats(canViewStatistics);

  useEffect(() => {
    saveStoredOrder(widgetOrder);
  }, [widgetOrder]);

  return (
    <div>
      <DashboardView
        canViewStatistics={canViewStatistics}
        loading={loading}
        statistics={statistics}
        tableLimits={tableLimits}
        updateLimit={updateLimit}
        widgetOrder={widgetOrder}
        setWidgetOrder={setWidgetOrder}
      />
    </div>
  );
}
