import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { authAxios } from "../../../api/axiosConfig";
import { categoryApi, exportApi, subjectApi } from "../../../api/services";
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

  const fetchData = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const examResponse = await authAxios.get("/admin/user-exams", {
          params: {
            page: page - 1,
            size: pagination.pageSize,
            keyword: searchText.trim() || undefined,
            categoryId: advancedFilters.categoryId,
            subjectId: advancedFilters.subjectId,
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
    [advancedFilters, pagination.pageSize, searchText]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchData(1), 350);
    return () => clearTimeout(timeoutId);
  }, [fetchData]);

  useEffect(() => {
    Promise.all([categoryApi.getAll(), subjectApi.getAll()])
      .then(([categoryData, subjectData]) => {
        setCategories(categoryData);
        setSubjects(subjectData);
      })
      .catch(() => message.warning("Không thể tải dữ liệu bộ lọc."));
  }, []);

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
    categories,
    subjects,
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
