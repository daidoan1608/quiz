import { useCallback, useState } from "react";
import { appMessage as message } from "../../../utils/ui/messageService";
import { getApiErrorMessage } from "../../../api/axiosConfig";
import { categoryApi } from "../../../api/services";
import { useDebouncedEffect } from "../../../hooks/useDebouncedEffect";
import { useTableSort } from "../../../hooks/useTableSort";

export const useCategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState("active");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const { tableSort, handleTableChange, getSortOrder } = useTableSort();

  const isAdmin = localStorage.getItem("role") === "ADMIN";

  const fetchCategories = useCallback(
    async (keyword = searchText) => {
      setLoading(true);
      try {
        const trimmedKeyword = keyword.trim();
        const data = await categoryApi.filter({
          keyword: trimmedKeyword || undefined,
          deleted: viewMode === "deleted",
          sortBy: tableSort.sortBy,
          sortDir: tableSort.sortDir,
        });
        setCategories(data);
      } catch (error) {
        message.error(
          getApiErrorMessage(error, "Không thể tải danh sách khoa.")
        );
      } finally {
        setLoading(false);
      }
    },
    [searchText, viewMode, tableSort]
  );

  useDebouncedEffect(() => {
    fetchCategories(searchText);
  }, [searchText, viewMode, fetchCategories]);

  const deleteCategory = async (categoryId) => {
    if (!isAdmin) {
      message.warning("Chỉ Admin mới được xóa khoa.");
      return;
    }
    try {
      await categoryApi.remove(categoryId);
      message.success("Đã chuyển khoa vào thùng rác.");
      fetchCategories();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể xóa khoa."));
    }
  };

  const restoreCategory = async (categoryId) => {
    try {
      await categoryApi.restore(categoryId);
      message.success("Khôi phục khoa thành công.");
      fetchCategories();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể khôi phục khoa."));
    }
  };

  const openAddModal = () => setIsAddModalOpen(true);

  const openUpdateModal = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setIsUpdateModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setIsUpdateModalOpen(false);
    setSelectedCategoryId(null);
  };

  const refreshAndCloseModal = () => {
    fetchCategories();
    closeModal();
  };

  return {
    categories,
    loading,
    searchText,
    setSearchText,
    viewMode,
    setViewMode,
    isAdmin,
    isAddModalOpen,
    isUpdateModalOpen,
    selectedCategoryId,
    getSortOrder,
    handleTableChange,
    fetchCategories,
    deleteCategory,
    restoreCategory,
    openAddModal,
    openUpdateModal,
    closeModal,
    refreshAndCloseModal,
  };
};
