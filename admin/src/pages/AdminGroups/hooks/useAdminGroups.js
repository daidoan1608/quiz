import { useCallback, useEffect, useState } from "react";
import { appMessage as message } from "../../../utils/ui/messageService";
import { adminGroupApi } from "../../../api/services";
import { getApiErrorMessage } from "../../../api/axiosConfig";

export const useAdminGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      setGroups(await adminGroupApi.getAll());
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể tải nhóm quyền."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const removeGroup = async (groupId) => {
    if (!groupId) {
      message.error("Không tìm thấy ID nhóm quyền để xóa.");
      return;
    }

    try {
      await adminGroupApi.remove(groupId);
      message.success("Đã xóa nhóm quyền.");
      fetchGroups();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể xóa nhóm quyền."));
    }
  };

  const toggleGroupActive = async (group, active) => {
    if (!group?.id) {
      message.error("Không tìm thấy ID nhóm quyền để cập nhật.");
      return;
    }

    setGroups((prev) =>
      prev.map((item) => (item.id === group.id ? { ...item, active } : item))
    );
    try {
      await adminGroupApi.save({ ...group, active });
      message.success("Đã cập nhật trạng thái nhóm quyền.");
      fetchGroups();
    } catch (error) {
      setGroups((prev) =>
        prev.map((item) =>
          item.id === group.id ? { ...item, active: group.active } : item
        )
      );
      message.error(getApiErrorMessage(error, "Không thể cập nhật trạng thái nhóm quyền."));
    }
  };

  return {
    groups,
    loading,
    fetchGroups,
    removeGroup,
    toggleGroupActive,
  };
};
