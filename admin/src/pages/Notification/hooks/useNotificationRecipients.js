import { useEffect, useState } from "react";
import { message } from "antd";
import { fetchNotificationRecipients } from "../../../api/services/notificationApi";

export const useNotificationRecipients = ({ isModalOpen, historyId }) => {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isModalOpen || !historyId) {
      setRecipients([]);
      return;
    }

    let mounted = true;
    const loadRecipients = async () => {
      setLoading(true);
      try {
        const data = await fetchNotificationRecipients(historyId);
        if (mounted) setRecipients(data);
      } catch (error) {
        if (mounted) {
          message.error("Lỗi tải danh sách người nhận");
          setRecipients([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadRecipients();
    return () => {
      mounted = false;
    };
  }, [isModalOpen, historyId]);

  return { loading, recipients };
};
