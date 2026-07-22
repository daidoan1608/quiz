import { useCallback, useEffect, useMemo, useState } from "react";
import { appMessage as message } from "../../../utils/ui/messageService";
import { getApiErrorMessage } from "../../../api/axiosConfig";
import { categoryApi, chapterApi, subjectApi } from "../../../api/services";
import { useAuth } from "../../../context/AuthProvider";
import { useDebouncedEffect } from "../../../hooks/useDebouncedEffect";
import { useTableSort } from "../../../hooks/useTableSort";

const chapterMatchesKeyword = (chapter, keyword) =>
  !keyword ||
  `${chapter.name || ""} ${chapter.chapterId || ""} ${chapter.subjectId || ""}`
    .toLowerCase()
    .includes(keyword.toLowerCase());

export const useChapterManager = () => {
  const [chapters, setChapters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState("active");
  const [categoryFilter, setCategoryFilter] = useState(undefined);
  const [subjectFilter, setSubjectFilter] = useState(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [chapterIdToUpdate, setChapterIdToUpdate] = useState(null);
  const { tableSort, handleTableChange, getSortOrder } = useTableSort();
  const { user, canOnSubject, getAllowedSubjectIds } = useAuth();
  const isMod = user?.role === "MOD";
  const allowedSubjectIds = useMemo(
    () => getAllowedSubjectIds("CHAPTER", "VIEW")?.map(String) || [],
    [getAllowedSubjectIds]
  );
  const visibleCategories = useMemo(
    () =>
      isMod
        ? categories.filter((category) =>
            subjects.some((subject) => subject.categoryId === category.categoryId)
          )
        : categories,
    [categories, isMod, subjects]
  );

  const fetchChapters = useCallback(
    async (keyword = searchText) => {
      setLoading(true);
      try {
        const trimmedKeyword = keyword.trim();
        const data = isMod
          ? (
              await Promise.all(
                allowedSubjectIds.map((subjectId) =>
                  chapterApi.getBySubject(subjectId)
                )
              )
            )
              .flat()
              .filter((chapter) => {
                const subject = subjects.find(
                  (item) => item.subjectId === chapter.subjectId
                );
                const matchesCategory =
                  !categoryFilter || subject?.categoryId === categoryFilter;
                const matchesSubject =
                  !subjectFilter || chapter.subjectId === subjectFilter;
                return (
                  chapterMatchesKeyword(chapter, trimmedKeyword) &&
                  matchesCategory &&
                  matchesSubject
                );
              })
          : await chapterApi.filter({
              keyword: trimmedKeyword || undefined,
              categoryId: categoryFilter,
              subjectId: subjectFilter,
              deleted: viewMode === "deleted",
              sortBy: tableSort.sortBy,
              sortDir: tableSort.sortDir,
            });
        setChapters(data);
      } catch (error) {
        message.error(
          getApiErrorMessage(error, "Không thể tải danh sách chương.")
        );
      } finally {
        setLoading(false);
      }
    },
    [
      searchText,
      viewMode,
      categoryFilter,
      subjectFilter,
      tableSort,
      isMod,
      allowedSubjectIds,
      subjects,
    ]
  );

  useEffect(() => {
    Promise.all([categoryApi.getAll(), subjectApi.getAll()])
      .then(([categoryData, subjectData]) => {
        setCategories(categoryData);
        setSubjects(
          isMod
            ? subjectData.filter((subject) =>
                allowedSubjectIds.includes(String(subject.subjectId))
              )
            : subjectData
        );
      })
      .catch(() => message.warning("Không thể tải dữ liệu bộ lọc."));
  }, [isMod, allowedSubjectIds]);

  useDebouncedEffect(() => {
    fetchChapters(searchText);
  }, [searchText, viewMode, fetchChapters]);

  const changeCategoryFilter = (value) => {
    setCategoryFilter(value);
    setSubjectFilter(undefined);
  };

  const deleteChapter = async (chapterId) => {
    try {
      const chapter = chapters.find((item) => item.chapterId === chapterId);
      if (chapter && !canOnSubject(chapter.subjectId, "CHAPTER", "DELETE")) {
        message.warning("Bạn không có quyền xóa chương này.");
        return;
      }
      await chapterApi.remove(chapterId);
      message.success("Đã chuyển chương vào thùng rác.");
      fetchChapters();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể xóa chương."));
    }
  };

  const restoreChapter = async (chapterId) => {
    try {
      await chapterApi.restore(chapterId);
      message.success("Khôi phục chương thành công.");
      fetchChapters();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Cần khôi phục môn cha trước."));
    }
  };

  const openAddModal = () => setIsAddModalOpen(true);

  const openUpdateModal = (chapterId) => {
    setChapterIdToUpdate(chapterId);
    setIsUpdateModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setIsUpdateModalOpen(false);
    setChapterIdToUpdate(null);
  };

  const refreshAndCloseModal = () => {
    fetchChapters();
    closeModal();
  };

  const canCreateChapter =
    viewMode === "active" &&
    (!isMod ||
      allowedSubjectIds.some((subjectId) =>
        canOnSubject(subjectId, "CHAPTER", "CREATE")
      ));

  const visibleSubjects = subjects.filter(
    (subject) => !categoryFilter || subject.categoryId === categoryFilter
  );

  return {
    chapters,
    categories: visibleCategories,
    subjects: visibleSubjects,
    loading,
    searchText,
    setSearchText,
    viewMode,
    setViewMode,
    categoryFilter,
    changeCategoryFilter,
    subjectFilter,
    setSubjectFilter,
    isMod,
    isAddModalOpen,
    isUpdateModalOpen,
    chapterIdToUpdate,
    canCreateChapter,
    canOnSubject,
    getSortOrder,
    handleTableChange,
    fetchChapters,
    deleteChapter,
    restoreChapter,
    openAddModal,
    openUpdateModal,
    closeModal,
    refreshAndCloseModal,
  };
};
