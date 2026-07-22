import { useCallback, useEffect, useMemo, useState } from "react";
import { appMessage as message } from "../../../utils/ui/messageService";
import { authAxios } from "../../../api/axiosConfig";
import { categoryApi, exportApi, subjectApi } from "../../../api/services";
import { useAuth } from "../../../context/AuthProvider";
import {
  formatDayjsRangeEnd,
  formatDayjsRangeStart,
} from "../../../utils/dateFormatters";

const mapUserExamRows = (items) =>
  items.map((item, index) => {
    const exam = item.userExamDto;
    return {
      key: exam.userExamId || index,
      ...item,
      ...exam,
      username: item.username || "Unknown",
      fullName: item.fullName || item.username || "Unknown",
    };
  });

export const useUserExamList = () => {
  const { user, canGlobal, getAllowedSubjectIds } = useAuth();
  const isMod = user?.role === "MOD";
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedUserExamId, setSelectedUserExamId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    categoryId: undefined,
    subjectId: undefined,
    startRange: null,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 7,
    total: 0,
  });
  const allowedSubjectIds = useMemo(
    () => getAllowedSubjectIds("USER_EXAM", "VIEW") || [],
    [getAllowedSubjectIds]
  );
  const visibleSubjects = useMemo(
    () =>
      isMod
        ? subjects.filter((subject) =>
            allowedSubjectIds.includes(Number(subject.subjectId))
          )
        : subjects,
    [allowedSubjectIds, isMod, subjects]
  );
  const visibleCategories = useMemo(
    () =>
      isMod
        ? categories.filter((category) =>
            visibleSubjects.some((subject) => subject.categoryId === category.categoryId)
          )
        : categories,
    [categories, isMod, visibleSubjects]
  );
  const effectiveSubjectId = useMemo(() => {
    if (!isMod || canGlobal("USER_EXAM", "VIEW")) {
      return advancedFilters.subjectId;
    }
    if (
      advancedFilters.subjectId &&
      allowedSubjectIds.includes(Number(advancedFilters.subjectId))
    ) {
      return advancedFilters.subjectId;
    }
    const firstSubjectInCategory = visibleSubjects.find(
      (subject) =>
        !advancedFilters.categoryId ||
        subject.categoryId === advancedFilters.categoryId
    );
    return firstSubjectInCategory?.subjectId || allowedSubjectIds[0];
  }, [
    advancedFilters.categoryId,
    advancedFilters.subjectId,
    allowedSubjectIds,
    canGlobal,
    isMod,
    visibleSubjects,
  ]);

  const fetchData = useCallback(
    async (page = 1) => {
      if (isMod && !canGlobal("USER_EXAM", "VIEW") && !effectiveSubjectId) {
        setData([]);
        setPagination((prev) => ({ ...prev, current: page, total: 0 }));
        return;
      }
      setLoading(true);
      try {
        const examResponse = await authAxios.get("/admin/user-exams", {
          params: {
            page: page - 1,
            size: pagination.pageSize,
            keyword: searchText.trim() || undefined,
            categoryId: advancedFilters.categoryId,
            subjectId: effectiveSubjectId,
            startedFrom: formatDayjsRangeStart(advancedFilters.startRange),
            startedTo: formatDayjsRangeEnd(advancedFilters.startRange),
          },
        });

        setData(mapUserExamRows(examResponse.data.content || []));
        setPagination((prev) => ({
          ...prev,
          current: page,
          total: examResponse.data.totalElements || 0,
        }));
      } catch (error) {
        message.error("Không thể tải danh sách bài thi!");
      } finally {
        setLoading(false);
      }
    },
    [
      advancedFilters.categoryId,
      advancedFilters.startRange,
      canGlobal,
      effectiveSubjectId,
      isMod,
      pagination.pageSize,
      searchText,
    ]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchData(1), 350);
    return () => clearTimeout(timeoutId);
  }, [fetchData]);

  useEffect(() => {
    Promise.all([categoryApi.getAll(), subjectApi.getAll()])
      .then(([categoryData, subjectData]) => {
        setCategories(categoryData);
        setSubjects(
          isMod
            ? subjectData.filter((subject) =>
                allowedSubjectIds.includes(Number(subject.subjectId))
              )
            : subjectData
        );
      })
      .catch(() => message.warning("Không thể tải dữ liệu bộ lọc."));
  }, [allowedSubjectIds, isMod]);

  const updateFilter = (key, value) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "categoryId" ? { subjectId: undefined } : {}),
    }));
  };

  const changePage = (page) => {
    setPagination((prev) => ({ ...prev, current: page }));
    fetchData(page);
  };

  const openDetailModal = (userExamId) => {
    setSelectedUserExamId(userExamId);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUserExamId(null);
  };

  return {
    data,
    categories: visibleCategories,
    subjects: visibleSubjects,
    loading,
    searchText,
    setSearchText,
    selectedUserExamId,
    isDetailModalOpen,
    advancedFilters,
    pagination,
    updateFilter,
    changePage,
    fetchData,
    openDetailModal,
    closeDetailModal,
    downloadExamResults: exportApi.downloadExamResults,
  };
};
