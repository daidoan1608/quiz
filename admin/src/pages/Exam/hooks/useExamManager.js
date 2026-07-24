import { useCallback, useEffect, useMemo, useState } from "react";
import { appMessage as message } from "../../../utils/ui/messageService";
import { getApiErrorMessage } from "../../../api/axiosConfig";
import { unwrapPageData } from "../../../api/services/apiResponse";
import { categoryApi, examApi, subjectApi, userApi } from "../../../api/services";
import { useAuth } from "../../../context/AuthProvider";
import { useDebouncedEffect } from "../../../hooks/useDebouncedEffect";
import { EXAM_DEFAULT_FILTERS } from "../constants";

const examMatchesKeyword = (exam, keyword) =>
  !keyword ||
  `${exam.examCode || ""} ${exam.title || ""} ${exam.description || ""} ${exam.subjectName || ""} ${exam.subjectId || ""}`
    .toLowerCase()
    .includes(keyword);

export const useExamManager = () => {
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState("active");
  const [advancedFilters, setAdvancedFilters] = useState(EXAM_DEFAULT_FILTERS);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 7,
    total: 0,
  });
  const [tableSort, setTableSort] = useState({});
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const { current: currentPage, pageSize } = pagination;
  const { user, canOnSubject, getAllowedSubjectIds } = useAuth();
  const isMod = user?.role === "MOD";
  const allowedSubjectIds = useMemo(
    () => getAllowedSubjectIds("EXAM", "VIEW")?.map(String) || [],
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

  const fetchExams = useCallback(
    async (page, nextPageSize) => {
      setLoading(true);
      try {
        const keyword = searchText.trim().toLowerCase();
        if (isMod) {
          const allRows = (
            await Promise.all(
              allowedSubjectIds.map((subjectId) => examApi.getBySubject(subjectId))
            )
          )
            .flat()
            .filter((exam) => {
              const subject = subjects.find(
                (item) => item.subjectId === exam.subjectId
              );
              const matchesCategory =
                !advancedFilters.categoryId ||
                subject?.categoryId === advancedFilters.categoryId;
              const matchesSubject =
                !advancedFilters.subjectId ||
                exam.subjectId === advancedFilters.subjectId;
              return (
                examMatchesKeyword(exam, keyword) &&
                matchesCategory &&
                matchesSubject
              );
            });
          setExams(allRows.slice((page - 1) * nextPageSize, page * nextPageSize));
          setPagination((prev) => ({
            ...prev,
            current: page,
            pageSize: nextPageSize,
            total: allRows.length,
          }));
          return;
        }

        const data = await examApi.filterPage({
          page: page - 1,
          size: nextPageSize,
          keyword: searchText.trim() || undefined,
          categoryId: advancedFilters.categoryId,
          subjectId: advancedFilters.subjectId,
          createdBy: advancedFilters.createdBy,
          deleted: viewMode === "deleted",
          sortBy: tableSort.sortBy,
          sortDir: tableSort.sortDir,
        });
        const pageData = unwrapPageData(data);
        setExams(pageData.content);
        setPagination((prev) => ({
          ...prev,
          current: pageData.current || page,
          pageSize: pageData.pageSize || nextPageSize,
          total: pageData.total,
        }));
      } catch (error) {
        message.error(getApiErrorMessage(error, "Không thể tải danh sách đề thi."));
      } finally {
        setLoading(false);
      }
    },
    [
      advancedFilters,
      searchText,
      tableSort,
      viewMode,
      isMod,
      allowedSubjectIds,
      subjects,
    ]
  );

  useDebouncedEffect(() => {
    fetchExams(currentPage, pageSize);
  }, [currentPage, fetchExams, pageSize]);

  useEffect(() => {
    Promise.all([
      categoryApi.getAll(),
      subjectApi.getAll(),
      isMod ? Promise.resolve([]) : userApi.getAll(),
    ])
      .then(([categoryData, subjectData, userData]) => {
        setCategories(categoryData);
        setSubjects(
          isMod
            ? subjectData.filter((subject) =>
                allowedSubjectIds.includes(String(subject.subjectId))
              )
            : subjectData
        );
        setCreators(
          userData.filter((currentUser) =>
            ["ADMIN", "MOD"].includes(currentUser.role)
          )
        );
      })
      .catch(() => message.warning("Không thể tải dữ liệu bộ lọc."));
  }, [isMod, allowedSubjectIds]);

  const resetToFirstPage = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const changeSearchText = (value) => {
    setSearchText(value);
    resetToFirstPage();
  };

  const changeViewMode = (value) => {
    setViewMode(value);
    resetToFirstPage();
  };

  const updateFilter = (key, value) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "categoryId" ? { subjectId: undefined } : {}),
    }));
    resetToFirstPage();
  };

  const handleTableChange = (nextPagination, __, sorter) => {
    setTableSort(
      sorter?.order
        ? { sortBy: sorter.columnKey || sorter.field, sortDir: sorter.order }
        : {}
    );
    setPagination((prev) => ({
      ...prev,
      current: nextPagination.current,
      pageSize: nextPagination.pageSize,
    }));
  };

  const getSortOrder = (key) =>
    tableSort.sortBy === key ? tableSort.sortDir : null;

  const deleteExam = async (examId) => {
    try {
      const exam = exams.find((item) => item.examId === examId);
      if (exam && !canOnSubject(exam.subjectId, "EXAM", "DELETE")) {
        message.warning("Bạn không có quyền xóa đề thi này.");
        return;
      }
      await examApi.remove(examId);
      message.success("Đã chuyển đề thi vào thùng rác.");
      fetchExams(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể xóa đề thi."));
    }
  };

  const restoreExam = async (examId) => {
    try {
      await examApi.restore(examId);
      message.success("Khôi phục đề thi thành công.");
      fetchExams(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(getApiErrorMessage(error, "Cần khôi phục môn cha trước."));
    }
  };

  const openViewModal = (examId) => {
    setSelectedExamId(examId);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedExamId(null);
  };

  const canCreateExam =
    viewMode === "active" &&
    (!isMod ||
      allowedSubjectIds.some((subjectId) =>
        canOnSubject(subjectId, "EXAM", "CREATE")
      ));

  const visibleSubjects = subjects.filter(
    (subject) =>
      !advancedFilters.categoryId ||
      subject.categoryId === advancedFilters.categoryId
  );

  return {
    exams,
    categories: visibleCategories,
    subjects: visibleSubjects,
    creators,
    loading,
    searchText,
    changeSearchText,
    viewMode,
    changeViewMode,
    advancedFilters,
    pagination,
    isMod,
    isViewModalOpen,
    selectedExamId,
    canCreateExam,
    canOnSubject,
    getSortOrder,
    handleTableChange,
    fetchExams,
    updateFilter,
    deleteExam,
    restoreExam,
    openViewModal,
    closeViewModal,
  };
};
