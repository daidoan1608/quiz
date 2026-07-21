import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { getApiErrorMessage } from "../../../api/axiosConfig";
import { examApi, questionApi } from "../../../api/services/contentApi";
import { subjectApi } from "../../../api/services/subjectApi";

export const useExamUpdateForm = ({ form, examId, open, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [examDetail, setExamDetail] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionTotal, setQuestionTotal] = useState(0);
  const [questionPage, setQuestionPage] = useState(1);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [filters, setFilters] = useState({
    keyword: "",
    chapterId: null,
    difficulty: null,
    usageFilter: "all",
  });

  const selectedQuestionPayload = useMemo(
    () => selectedQuestionIds.map((questionId) => ({ questionId })),
    [selectedQuestionIds]
  );

  const resetState = useCallback(() => {
    form.resetFields();
    setExamDetail(null);
    setChapters([]);
    setQuestions([]);
    setQuestionTotal(0);
    setQuestionPage(1);
    setSelectedQuestionIds([]);
    setSelectedSubjectId(null);
    setFilters({ keyword: "", chapterId: null, difficulty: null, usageFilter: "all" });
  }, [form]);

  const fetchSubjects = useCallback(async () => {
    try {
      setSubjects(await subjectApi.getAll());
    } catch (error) {
      message.warning("Không thể tải danh sách môn học.");
    }
  }, []);

  const fetchExamDetail = useCallback(async () => {
    if (!examId) return;
    setDetailLoading(true);
    try {
      const data = await examApi.getDetail(examId);
      setExamDetail(data);
      setSelectedQuestionIds((data.questions || []).map((question) => question.questionId));
      setSelectedSubjectId(data.subjectId);
      form.setFieldsValue({
        examCode: data.examCode,
        subjectId: data.subjectId,
        title: data.title,
        description: data.description,
        duration: data.duration,
      });
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể tải thông tin đề thi."));
    } finally {
      setDetailLoading(false);
    }
  }, [examId, form]);

  const fetchChapters = useCallback(async (subjectId) => {
    if (!subjectId) {
      setChapters([]);
      return;
    }
    try {
      const data = await subjectApi.getById(subjectId);
      setChapters(data.chapters || []);
    } catch (error) {
      setChapters([]);
      message.warning("Không thể tải danh sách chương.");
    }
  }, []);

  const fetchQuestions = useCallback(async () => {
    const subjectId = selectedSubjectId;
    if (!open || !subjectId) return;
    setPickerLoading(true);
    try {
      const pageData = await questionApi.filterPage({
        subjectId,
        keyword: filters.keyword || undefined,
        chapterId: filters.chapterId || undefined,
        difficulty: filters.difficulty || undefined,
        usageFilter: filters.usageFilter,
        deleted: false,
        examEnabled: true,
        page: questionPage - 1,
        size: 30,
      });
      setQuestions(pageData.content || []);
      setQuestionTotal(pageData.totalElements || 0);
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể tải danh sách câu hỏi."));
    } finally {
      setPickerLoading(false);
    }
  }, [filters, open, questionPage, selectedSubjectId]);

  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }
    fetchSubjects();
    fetchExamDetail();
  }, [fetchExamDetail, fetchSubjects, open, resetState]);

  useEffect(() => {
    if (!open) return;
    fetchChapters(selectedSubjectId);
  }, [examDetail, fetchChapters, open, selectedSubjectId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSubjectChange = (subjectId) => {
    setSelectedSubjectId(subjectId);
    setSelectedQuestionIds([]);
    setQuestionPage(1);
    setFilters({ keyword: "", chapterId: null, difficulty: null, usageFilter: "all" });
    fetchChapters(subjectId);
  };

  const submitExam = async (values) => {
    if (selectedQuestionIds.length === 0) {
      message.error("Vui lòng chọn ít nhất 1 câu hỏi.");
      return;
    }

    setLoading(true);
    try {
      await examApi.update(examId, {
        subjectId: values.subjectId,
        examCode: values.examCode,
        title: values.title,
        description: values.description,
        duration: values.duration,
        questions: selectedQuestionPayload,
      });
      message.success("Cập nhật đề thi thành công.");
      onSuccess();
      onCancel();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể cập nhật đề thi."));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  return {
    chapters,
    detailLoading,
    filters,
    handleCancel,
    handleSubjectChange,
    loading,
    pickerLoading,
    questionPage,
    questionTotal,
    questions,
    selectedQuestionIds,
    setFilters,
    setQuestionPage,
    setSelectedQuestionIds,
    subjects,
    submitExam,
  };
};
