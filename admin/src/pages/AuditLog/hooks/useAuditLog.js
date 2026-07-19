import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { getApiErrorMessage } from "../../../api/axiosConfig";
import { auditLogApi } from "../../../api/services";

export const useAuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      setLogs(await auditLogApi.getLatest());
    } catch (error) {
      message.error(
        getApiErrorMessage(error, "Không thể tải nhật ký hệ thống.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    fetchLogs,
  };
};
