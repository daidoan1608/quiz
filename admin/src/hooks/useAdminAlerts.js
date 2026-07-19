import { useCallback, useEffect, useMemo, useState } from "react";
import { auditLogApi, examApi, questionApi, userApi } from "../api/services";
import { useAuth } from "../context/AuthProvider";
import {
  buildAuditAlerts,
  buildContentAlerts,
  buildUserAlerts,
  getListFromPage,
} from "../utils/adminAlerts/adminAlertBuilders";
import { readDismissedAlertIds, writeDismissedAlertIds } from "../utils/adminAlerts/adminAlertStorage";

export const useAdminAlerts = ({ isOpen, onCountChange }) => {
  const { canGlobal, canAny } = useAuth();
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlertIds, setDismissedAlertIds] = useState(() => readDismissedAlertIds());

  const visibleAlerts = useMemo(
    () => alerts.filter((alert) => !dismissedAlertIds.has(alert.id)),
    [alerts, dismissedAlertIds]
  );

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const [auditResult, questionResult, examResult, userResult] = await Promise.allSettled([
        canGlobal("AUDIT_LOG", "VIEW") ? auditLogApi.getLatest() : Promise.resolve([]),
        canAny("QUESTION", "VIEW") ? questionApi.filterPage({ page: 0, size: 100 }) : Promise.resolve([]),
        canAny("EXAM", "VIEW") ? examApi.filterPage({ page: 0, size: 100 }) : Promise.resolve([]),
        canGlobal("USER", "VIEW") ? userApi.filter({ page: 0, size: 100 }) : Promise.resolve([]),
      ]);

      const auditLogs = auditResult.status === "fulfilled" ? auditResult.value : [];
      const questions = questionResult.status === "fulfilled" ? getListFromPage(questionResult.value) : [];
      const exams = examResult.status === "fulfilled" ? getListFromPage(examResult.value) : [];
      const users = userResult.status === "fulfilled" ? getListFromPage(userResult.value) : [];

      setAlerts([
        ...buildAuditAlerts(auditLogs),
        ...buildContentAlerts(questions, exams),
        ...buildUserAlerts(users),
      ].slice(0, 30));
    } finally {
      setLoading(false);
    }
  }, [canAny, canGlobal]);

  useEffect(() => {
    if (isOpen) fetchAlerts();
  }, [fetchAlerts, isOpen]);

  useEffect(() => {
    onCountChange?.(visibleAlerts.length);
  }, [onCountChange, visibleAlerts.length]);

  const dismissAlert = (alertId) => {
    setDismissedAlertIds((previousIds) => {
      const nextIds = new Set(previousIds);
      nextIds.add(alertId);
      writeDismissedAlertIds(nextIds);
      return nextIds;
    });
  };

  const dismissAllVisibleAlerts = () => {
    setDismissedAlertIds((previousIds) => {
      const nextIds = new Set(previousIds);
      visibleAlerts.forEach((alert) => nextIds.add(alert.id));
      writeDismissedAlertIds(nextIds);
      return nextIds;
    });
  };

  const groupedAlerts = useMemo(
    () =>
      visibleAlerts.reduce((map, alert) => {
        const group = alert.group || "Khác";
        map[group] = [...(map[group] || []), alert];
        return map;
      }, {}),
    [visibleAlerts]
  );

  return {
    dismissAlert,
    dismissAllVisibleAlerts,
    groupedAlerts,
    loading,
    visibleAlerts,
  };
};
