import { useCallback, useEffect, useMemo, useState } from "react";
import { appMessage as message } from "../../../utils/ui/messageService";
import { getApiErrorMessage } from "../../../api/axiosConfig";
import {
  chapterApi,
  exportApi,
  questionApi,
  subjectApi,
  userApi,
} from "../../../api/services";
import { useAuth } from "../../../context/AuthProvider";
import { useDebouncedEffect } from "../../../hooks/useDebouncedEffect";
import { QUESTION_DEFAULT_FILTERS } from "../constants";

const questionMatchesKeyword = (question, keyword) =>
  !keyword ||
  `${question.content || ""} ${question.chapterName || ""} ${question.questionId || ""}`
    .toLowerCase()
    .includes(keyword.toLowerCase());

export const useQuestionManager = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState("active");
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [creators, setCreators] = useState([]);
  const [advancedFilters, setAdvancedFilters] = useState(QUESTION_DEFAULT_FILTERS);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 7,
    total: 0,
  });
  const [tableSort, setTableSort] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [questionIdToUpdate, setQuestionIdToUpdate] = useState(null);
  const { current: currentPage, pageSize } = pagination;
  const { user, capabilities, canOnSubject } = useAuth();
  const isMod = user?.role === "MOD";
  const allowedSubjectIds = useMemo(
    () => Object.keys(capabilities.subjects || {}),
    [capabilities.subjects]
  );

  const fetchQuestions = useCallback(
    async (keyword, page, nextPageSize) => {
      setLoading(true);
      try {
        const trimmedKeyword = keyword.trim();
        if (isMod) {
          const allRows = (
            await Promise.all(
              allowedSubjectIds.map(async (subjectId) =>
                (await questionApi.getBySubject(subjectId)).map((question) => ({
                  ...question,
                  subjectId: Number(subjectId),
                }))
              )
            )
          )
            .flat()
            .filter((question) => {
              const matchesSubject =
                !advancedFilters.subjectId ||
                question.subjectId === advancedFilters.subjectId;
              const matchesChapter =
                !advancedFilters.chapterId ||
                question.chapterId === advancedFilters.chapterId;
              const matchesDifficulty =
                !advancedFilters.difficulty ||
                question.difficulty === advancedFilters.difficulty;
              const matchesExamEnabled =
                advancedFilters.examEnabled === undefined ||
                (question.examEnabled !== false) === advancedFilters.examEnabled;
              const matchesPracticeEnabled =
                advancedFilters.practiceEnabled === undefined ||
                (question.practiceEnabled !== false) === advancedFilters.practiceEnabled;
              return (
                questionMatchesKeyword(question, trimmedKeyword) &&
                matchesSubject &&
                matchesChapter &&
                matchesDifficulty &&
                matchesExamEnabled &&
                matchesPracticeEnabled
              );
            });
          setQuestions(
            allRows.slice((page - 1) * nextPageSize, page * nextPageSize)
          );
          setPagination((prev) => ({
            ...prev,
            current: page,
            pageSize: nextPageSize,
            total: allRows.length,
          }));
          return;
        }

        const data = await questionApi.filterPage({
          page: page - 1,
          size: nextPageSize,
          keyword: trimmedKeyword || undefined,
          subjectId: advancedFilters.subjectId,
          chapterId: advancedFilters.chapterId,
          difficulty: advancedFilters.difficulty,
          examEnabled: advancedFilters.examEnabled,
          practiceEnabled: advancedFilters.practiceEnabled,
          creatorId: advancedFilters.creatorId,
          deleted: viewMode === "deleted",
          sortBy: tableSort.sortBy,
          sortDir: tableSort.sortDir,
        });
        setQuestions(data.content || []);
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize: nextPageSize,
          total: data.totalElements || 0,
        }));
      } catch (error) {
        message.error(
          getApiErrorMessage(error, "Không thể tải danh sách câu hỏi.")
        );
      } finally {
        setLoading(false);
      }
    },
    [advancedFilters, tableSort, viewMode, isMod, allowedSubjectIds]
  );

  useEffect(() => {
    Promise.all([
      subjectApi.getAll(),
      isMod
        ? Promise.all(
            allowedSubjectIds.map((subjectId) =>
              chapterApi.getBySubject(subjectId)
            )
          ).then((rows) => rows.flat())
        : chapterApi.getAll(),
      isMod ? Promise.resolve([]) : userApi.getAll(),
    ])
      .then(([subjectData, chapterData, userData]) => {
        setSubjects(
          isMod
            ? subjectData.filter((subject) =>
                allowedSubjectIds.includes(String(subject.subjectId))
              )
            : subjectData
        );
        setChapters(chapterData);
        setCreators(
          userData.filter((currentUser) =>
            ["ADMIN", "MOD"].includes(currentUser.role)
          )
        );
      })
      .catch(() => message.warning("Không thể tải dữ liệu bộ lọc nâng cao."));
  }, [isMod, allowedSubjectIds]);

  useDebouncedEffect(() => {
    fetchQuestions(searchText, currentPage, pageSize);
  }, [currentPage, fetchQuestions, pageSize, searchText, viewMode]);

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
      ...(key === "subjectId" ? { chapterId: undefined } : {}),
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

  const deleteQuestion = async (questionId) => {
    try {
      const question = questions.find((item) => item.questionId === questionId);
      if (
        question &&
        !canOnSubject(question.subjectId, "QUESTION", "DELETE")
      ) {
        message.warning("Bạn không có quyền xóa câu hỏi này.");
        return;
      }
      await questionApi.remove(questionId);
      message.success("Đã chuyển câu hỏi vào thùng rác.");
      fetchQuestions(searchText, pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể xóa câu hỏi."));
    }
  };

  const restoreQuestion = async (questionId) => {
    try {
      await questionApi.restore(questionId);
      message.success("Khôi phục câu hỏi thành công.");
      fetchQuestions(searchText, pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(getApiErrorMessage(error, "Cần khôi phục chương cha trước."));
    }
  };

  const toggleQuestionAvailability = async (question, field, checked) => {
    try {
      await questionApi.update(question.questionId, {
        questionId: question.questionId,
        content: question.content,
        difficulty: question.difficulty,
        imageUrl: question.imageUrl,
        questionType: question.questionType,
        examEnabled:
          field === "examEnabled" ? checked : question.examEnabled !== false,
        practiceEnabled:
          field === "practiceEnabled" ? checked : question.practiceEnabled !== false,
      });
      message.success("Đã cập nhật trạng thái câu hỏi.");
      setQuestions((prev) =>
        prev.map((item) =>
          item.questionId === question.questionId
            ? { ...item, [field]: checked }
            : item
        )
      );
      fetchQuestions(searchText, pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể cập nhật trạng thái câu hỏi."));
    }
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const openImportModal = () => setIsImportModalOpen(true);

  const openUpdateModal = (questionId) => {
    setQuestionIdToUpdate(questionId);
    setIsUpdateModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setIsUpdateModalOpen(false);
    setIsImportModalOpen(false);
    setQuestionIdToUpdate(null);
  };

  const refreshAndCloseModal = () => {
    fetchQuestions(searchText, pagination.current, pagination.pageSize);
    closeModal();
  };

  const canCreateQuestion =
    viewMode === "active" &&
    (!isMod ||
      allowedSubjectIds.some((subjectId) =>
        canOnSubject(subjectId, "QUESTION", "CREATE")
      ));

  const canImportQuestion =
    viewMode === "active" &&
    (!isMod ||
      allowedSubjectIds.some((subjectId) =>
        canOnSubject(subjectId, "QUESTION", "IMPORT")
      ));

  const visibleChapters = chapters.filter(
    (chapter) =>
      !advancedFilters.subjectId ||
      chapter.subjectId === advancedFilters.subjectId
  );

  return {
    questions,
    loading,
    searchText,
    changeSearchText,
    viewMode,
    changeViewMode,
    subjects,
    chapters: visibleChapters,
    creators,
    advancedFilters,
    pagination,
    isMod,
    isAddModalOpen,
    isUpdateModalOpen,
    isImportModalOpen,
    questionIdToUpdate,
    canCreateQuestion,
    canImportQuestion,
    canOnSubject,
    getSortOrder,
    handleTableChange,
    fetchQuestions,
    updateFilter,
    deleteQuestion,
    restoreQuestion,
    toggleQuestionAvailability,
    openAddModal,
    openImportModal,
    openUpdateModal,
    closeModal,
    refreshAndCloseModal,
    downloadQuestions: exportApi.downloadQuestions,
  };
};
