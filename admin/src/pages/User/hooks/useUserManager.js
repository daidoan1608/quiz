import { useCallback, useState } from "react";
import { message } from "antd";
import { getApiErrorMessage } from "../../../api/axiosConfig";
import { exportApi, userApi } from "../../../api/services";
import { useDebouncedEffect } from "../../../hooks/useDebouncedEffect";
import { useTableSort } from "../../../hooks/useTableSort";

export const useUserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [selectedEmailVerified, setSelectedEmailVerified] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState("active");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedPermissionUser, setSelectedPermissionUser] = useState(null);
  const { tableSort, handleTableChange, getSortOrder } = useTableSort();

  const currentUserRole = localStorage.getItem("role");
  const isMod = currentUserRole === "MOD";

  const fetchUsers = useCallback(
    async (keyword = searchText) => {
      setLoading(true);
      try {
        const trimmedKeyword = keyword.trim();
        const data = await userApi.filter({
          keyword: trimmedKeyword || undefined,
          role: selectedRole === "all" ? undefined : selectedRole,
          authProvider: selectedProvider === "all" ? undefined : selectedProvider,
          emailVerified:
            selectedEmailVerified === "all"
              ? undefined
              : selectedEmailVerified === "verified",
          deleted: viewMode === "deleted",
          sortBy: tableSort.sortBy,
          sortDir: tableSort.sortDir,
        });
        setUsers(data);
      } catch (error) {
        message.error(
          getApiErrorMessage(error, "Không thể tải danh sách người dùng.")
        );
      } finally {
        setLoading(false);
      }
    },
    [
      searchText,
      viewMode,
      selectedRole,
      selectedProvider,
      selectedEmailVerified,
      tableSort,
    ]
  );

  useDebouncedEffect(() => {
    fetchUsers(searchText);
  }, [searchText, viewMode, fetchUsers]);

  const disableUser = async (userId) => {
    if (isMod) {
      message.warning("Bạn không có quyền thực hiện hành động này.");
      return;
    }
    try {
      await userApi.remove(userId);
      message.success("Đã vô hiệu hóa người dùng.");
      fetchUsers();
    } catch (error) {
      message.error(
        getApiErrorMessage(error, "Không thể vô hiệu hóa người dùng.")
      );
    }
  };

  const restoreUser = async (userId) => {
    try {
      await userApi.restore(userId);
      message.success("Khôi phục người dùng thành công.");
      fetchUsers();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể khôi phục người dùng."));
    }
  };

  const openAddModal = () => setIsAddModalOpen(true);

  const openEditModal = (userId) => {
    if (isMod) {
      message.warning("Bạn không có quyền chỉnh sửa.");
      return;
    }
    setSelectedUserId(userId);
    setIsUpdateModalOpen(true);
  };

  const openGroupsModal = (user) => {
    if (user.role !== "MOD") {
      message.warning("Chỉ tài khoản MOD mới gán nhóm quyền.");
      return;
    }
    setSelectedPermissionUser(user);
    setIsGroupModalOpen(true);
  };

  const closeModal = () => {
    setIsUpdateModalOpen(false);
    setIsGroupModalOpen(false);
    setSelectedUserId(null);
    setSelectedPermissionUser(null);
    setIsAddModalOpen(false);
  };

  const refreshAndCloseModal = () => {
    fetchUsers();
    closeModal();
  };

  return {
    users,
    loading,
    selectedRole,
    setSelectedRole,
    selectedProvider,
    setSelectedProvider,
    selectedEmailVerified,
    setSelectedEmailVerified,
    searchText,
    setSearchText,
    viewMode,
    setViewMode,
    isMod,
    isAddModalOpen,
    isUpdateModalOpen,
    isGroupModalOpen,
    selectedUserId,
    selectedPermissionUser,
    getSortOrder,
    handleTableChange,
    fetchUsers,
    disableUser,
    restoreUser,
    openAddModal,
    openEditModal,
    openGroupsModal,
    closeModal,
    refreshAndCloseModal,
    downloadUsers: exportApi.downloadUsers,
  };
};
