import { useEffect, useState } from "react";
import { fetchNotificationRecipients } from "../../../api/services/notificationApi";
import { appMessage as message } from "../../../utils/ui/messageService";

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
  }, [historyId, isModalOpen]);

  return { loading, recipients };
};
