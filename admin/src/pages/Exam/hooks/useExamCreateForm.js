import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { categoryApi } from "../../../api/services/categoryApi";
import { examApi, questionApi } from "../../../api/services/contentApi";
import { subjectApi } from "../../../api/services/subjectApi";

const EMPTY_LIMITS = {
  totalQuestion: 0,
  totalEasy: 0,
  totalMedium: 0,
  totalHard: 0,
  totalQuestionByChapter: {},
};

const INITIAL_DIFF_INPUT = { easy: 0, medium: 0, hard: 0 };

const buildChapterInputs = (limitData) =>
  Object.entries(limitData.totalQuestionByChapter || {}).map(([id, data]) => ({
    chapterId: id,
    chapterName: data.chapterName,
    maxTotal: data.totalQuestions,
    selected: 0,
  }));

export const useExamCreateForm = ({ form, isModalOpen, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [maxQuestions, setMaxQuestions] = useState(EMPTY_LIMITS);
  const [generationMode, setGenerationMode] = useState("total");
  const [inputTotal, setInputTotal] = useState(0);
  const [inputDiff, setInputDiff] = useState(INITIAL_DIFF_INPUT);
  const [inputChapters, setInputChapters] = useState([]);
  const [manualQuestions, setManualQuestions] = useState([]);
  const [manualQuestionTotal, setManualQuestionTotal] = useState(0);
  const [manualQuestionIds, setManualQuestionIds] = useState([]);
  const [manualQuestionPage, setManualQuestionPage] = useState(1);
  const [manualPickerLoading, setManualPickerLoading] = useState(false);
  const [manualFilters, setManualFilters] = useState({
    keyword: "",
    chapterId: null,
    difficulty: null,
    usageFilter: "all",
  });

  const resetQuestionConfig = useCallback(() => {
    setInputTotal(0);
    setInputDiff(INITIAL_DIFF_INPUT);
    setInputChapters([]);
    setManualQuestions([]);
    setManualQuestionTotal(0);
    setManualQuestionIds([]);
    setManualQuestionPage(1);
    setManualFilters({ keyword: "", chapterId: null, difficulty: null, usageFilter: "all" });
    setSelectedSubject(null);
    setMaxQuestions(EMPTY_LIMITS);
  }, []);

  const resetFormState = useCallback(() => {
    form.resetFields();
    resetQuestionConfig();
  }, [form, resetQuestionConfig]);

  const fetchCategories = useCallback(async () => {
    try {
      setCategories(await categoryApi.getAll());
    } catch (error) {
      console.error("Lỗi danh mục:", error);
    }
  }, []);

  const fetchQuestionLimits = useCallback(async (subjectId) => {
    try {
      const limitData = await examApi.getQuestionLimits(subjectId);
      setMaxQuestions(limitData);
      setInputChapters(buildChapterInputs(limitData));
    } catch (error) {
      console.error("Lỗi limit:", error);
      message.error("Không thể lấy thông tin số lượng câu hỏi!");
      setMaxQuestions({});
      setInputChapters([]);
    }
  }, []);

  useEffect(() => {
    if (isModalOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories, isModalOpen]);

  useEffect(() => {
    if (selectedSubject) {
      fetchQuestionLimits(selectedSubject);
    }
  }, [fetchQuestionLimits, selectedSubject]);

  const fetchManualQuestions = useCallback(async () => {
    if (!selectedSubject || generationMode !== "manual") return;
    setManualPickerLoading(true);
    try {
      const pageData = await questionApi.filterPage({
        subjectId: selectedSubject,
        keyword: manualFilters.keyword || undefined,
        chapterId: manualFilters.chapterId || undefined,
        difficulty: manualFilters.difficulty || undefined,
        usageFilter: manualFilters.usageFilter,
        deleted: false,
        examEnabled: true,
        page: manualQuestionPage - 1,
        size: 20,
      });
      setManualQuestions(pageData.content || []);
      setManualQuestionTotal(pageData.totalElements || 0);
    } catch (error) {
      console.error("Lỗi tải câu hỏi thủ công:", error);
      message.error("Không thể tải danh sách câu hỏi để chọn.");
    } finally {
      setManualPickerLoading(false);
    }
  }, [generationMode, manualFilters, manualQuestionPage, selectedSubject]);

  useEffect(() => {
    fetchManualQuestions();
  }, [fetchManualQuestions]);

  const handleCategoryChange = async (categoryId) => {
    form.setFieldsValue({ subjectId: null });
    setSelectedSubject(null);
    setSubjects([]);
    resetQuestionConfig();

    if (!categoryId) return;

    try {
      const subjectData = await subjectApi.getByCategory(categoryId);
      setSubjects(subjectData);
      if (subjectData.length === 0) message.warning("Khoa này chưa có môn học nào!");
    } catch (error) {
      console.error("Lỗi fetch môn học:", error);
      message.error("Không thể tải danh sách môn học theo khoa.");
    }
  };

  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId);
    setInputTotal(0);
    setInputDiff(INITIAL_DIFF_INPUT);
    setManualQuestionIds([]);
    setManualQuestionPage(1);
    setManualQuestions([]);
    setManualQuestionTotal(0);
    setManualFilters({ keyword: "", chapterId: null, difficulty: null, usageFilter: "all" });
  };

  const calculateTotalSelected = useCallback(() => {
    if (generationMode === "total") return inputTotal;
    if (generationMode === "difficulty") return inputDiff.easy + inputDiff.medium + inputDiff.hard;
    if (generationMode === "chapter") {
      return inputChapters.reduce((sum, chapter) => sum + chapter.selected, 0);
    }
    if (generationMode === "manual") return manualQuestionIds.length;
    return 0;
  }, [generationMode, inputChapters, inputDiff, inputTotal, manualQuestionIds.length]);

  const submitExam = async (values) => {
    const totalSelected = calculateTotalSelected();
    if (totalSelected <= 0) {
      message.error("Vui lòng chọn ít nhất 1 câu hỏi!");
      return;
    }

    setLoading(true);
    try {
      await examApi.create({
        examDto: {
          examCode: values.examCode,
          subjectId: values.subjectId,
          title: values.title,
          description: values.description,
          duration: values.duration,
          createdBy: localStorage.getItem("userId"),
        },
        totalQuestions: generationMode === "total" ? inputTotal : null,
        easyQuestions: generationMode === "difficulty" ? inputDiff.easy : 0,
        mediumQuestions: generationMode === "difficulty" ? inputDiff.medium : 0,
        hardQuestions: generationMode === "difficulty" ? inputDiff.hard : 0,
        totalQuestionByChapter:
          generationMode === "chapter"
            ? inputChapters.reduce((acc, chapter) => {
                if (chapter.selected > 0) acc[chapter.chapterId] = chapter.selected;
                return acc;
              }, {})
            : {},
        generationMode: generationMode.toUpperCase(),
        questionIds: generationMode === "manual" ? manualQuestionIds : [],
      });
      message.success("Thêm bài thi thành công!");
      resetFormState();
      onSuccess();
    } catch (error) {
      console.error("Lỗi submit:", error);
      message.error("Không thể thêm bài thi. Vui lòng kiểm tra lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetFormState();
    onCancel();
  };

  return {
    calculateTotalSelected,
    categories,
    generationMode,
    handleCancel,
    handleCategoryChange,
    handleSubjectChange,
    inputChapters,
    inputDiff,
    inputTotal,
    loading,
    manualFilters,
    manualPickerLoading,
    manualQuestionIds,
    manualQuestionPage,
    manualQuestionTotal,
    manualQuestions,
    maxQuestions,
    selectedSubject,
    setGenerationMode,
    setInputChapters,
    setInputDiff,
    setInputTotal,
    setManualFilters,
    setManualQuestionIds,
    setManualQuestionPage,
    subjects,
    submitExam,
  };
};
