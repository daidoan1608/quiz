import { useCallback, useEffect, useMemo, useState } from "react";
import { appMessage as message } from "../../../utils/ui/messageService";
import { getApiErrorMessage } from "../../../api/axiosConfig";
import { categoryApi, subjectApi } from "../../../api/services";
import { useAuth } from "../../../context/AuthProvider";
import { useDebouncedEffect } from "../../../hooks/useDebouncedEffect";
import { useTableSort } from "../../../hooks/useTableSort";

const subjectMatchesKeyword = (subject, keyword) =>
  !keyword ||
  `${subject.name || ""} ${subject.description || ""} ${subject.categoryName || ""} ${subject.subjectId || ""}`
    .toLowerCase()
    .includes(keyword.toLowerCase());

export const useSubjectManager = () => {
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [permittedCategoryIds, setPermittedCategoryIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState("active");
  const [categoryFilter, setCategoryFilter] = useState(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [subjectIdToUpdate, setSubjectIdToUpdate] = useState(null);
  const { tableSort, handleTableChange, getSortOrder } = useTableSort();
  const { user, canOnSubject, canAnySubject } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isMod = user?.role === "MOD";

  const fetchSubjects = useCallback(
    async (keyword = searchText) => {
      setLoading(true);
      try {
        const trimmedKeyword = keyword.trim();
        const allSubjects = isMod ? await subjectApi.getAll() : [];
        const permittedSubjects = isMod
          ? allSubjects.filter((subject) =>
              canOnSubject(subject.subjectId, "SUBJECT", "VIEW")
            )
          : [];
        const data = isMod
          ? permittedSubjects.filter((subject) => {
              const matchesCategory =
                !categoryFilter || subject.categoryId === categoryFilter;
              return (
                subjectMatchesKeyword(subject, trimmedKeyword) &&
                matchesCategory
              );
            })
          : await subjectApi.filter({
              keyword: trimmedKeyword || undefined,
              categoryId: categoryFilter,
              deleted: viewMode === "deleted",
              sortBy: tableSort.sortBy,
              sortDir: tableSort.sortDir,
            });
        setSubjects(data);
        if (isMod) {
          setPermittedCategoryIds(
            Array.from(
              new Set(
                permittedSubjects
                  .map((subject) => subject.categoryId)
                  .filter(Boolean)
              )
            )
          );
        }
      } catch (error) {
        message.error(
          getApiErrorMessage(error, "Không thể tải danh sách môn học.")
        );
      } finally {
        setLoading(false);
      }
    },
    [searchText, viewMode, categoryFilter, tableSort, isMod, canOnSubject]
  );

  useEffect(() => {
    categoryApi
      .getAll()
      .then(setCategories)
      .catch(() => message.warning("Không thể tải bộ lọc khoa."));
  }, []);

  useDebouncedEffect(() => {
    fetchSubjects(searchText);
  }, [searchText, viewMode, fetchSubjects]);

  const visibleCategories = useMemo(
    () =>
      isMod
        ? categories.filter((category) =>
            permittedCategoryIds.includes(category.categoryId)
          )
        : categories,
    [categories, isMod, permittedCategoryIds]
  );

  const deleteSubject = async (subjectId) => {
    if (!canOnSubject(subjectId, "SUBJECT", "DELETE")) {
      message.warning("Bạn không có quyền xóa môn học.");
      return;
    }
    try {
      await subjectApi.remove(subjectId);
      message.success("Đã chuyển môn học vào thùng rác.");
      fetchSubjects();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể xóa môn học."));
    }
  };

  const restoreSubject = async (subjectId) => {
    try {
      await subjectApi.restore(subjectId);
      message.success("Khôi phục môn học thành công.");
      fetchSubjects();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Cần khôi phục khoa cha trước."));
    }
  };

  const openAddModal = () => setIsAddModalOpen(true);

  const openUpdateModal = (subjectId) => {
    setSubjectIdToUpdate(subjectId);
    setIsUpdateModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setIsUpdateModalOpen(false);
    setSubjectIdToUpdate(null);
  };

  const refreshAndCloseModal = () => {
    fetchSubjects();
    closeModal();
  };

  return {
    subjects,
    categories: visibleCategories,
    loading,
    searchText,
    setSearchText,
    viewMode,
    setViewMode,
    categoryFilter,
    setCategoryFilter,
    isAdmin,
    isMod,
    isAddModalOpen,
    isUpdateModalOpen,
    subjectIdToUpdate,
    canOnSubject,
    canAnySubject,
    getSortOrder,
    handleTableChange,
    fetchSubjects,
    deleteSubject,
    restoreSubject,
    openAddModal,
    openUpdateModal,
    closeModal,
    refreshAndCloseModal,
  };
};
