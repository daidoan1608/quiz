import { useCallback, useEffect, useState } from "react";
import { appMessage as message } from "../../../utils/ui/messageService";
import { getApiErrorMessage } from "../../../api/axiosConfig";
import { categoryApi } from "../../../api/services/categoryApi";
import { chapterApi, questionApi } from "../../../api/services/contentApi";
import { subjectApi } from "../../../api/services/subjectApi";
import { buildNewQuestionAnswers, validateCorrectAnswers } from "../../../utils/questionForm";
import { QUESTION_FORM_INITIAL_VALUES } from "../constants";

const INITIAL_QUESTION_TYPE = "SINGLE_CHOICE";

export const useQuestionCreateForm = ({ form, isModalOpen, onCancel, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [questionType, setQuestionType] = useState(INITIAL_QUESTION_TYPE);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [previewImgUrl, setPreviewImgUrl] = useState("");

  const resetFormState = useCallback(() => {
    form.resetFields();
    form.setFieldsValue({ answers: QUESTION_FORM_INITIAL_VALUES.answers });
    setCorrectAnswers([]);
    setPreviewImgUrl("");
    setQuestionType(INITIAL_QUESTION_TYPE);
    setSubjects([]);
    setChapters([]);
  }, [form]);

  const fetchCategories = useCallback(async () => {
    try {
      setCategories(await categoryApi.getAll());
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    if (isModalOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories, isModalOpen]);

  const handleCategoryChange = async (categoryId) => {
    form.setFieldsValue({ subjectId: null, chapterId: null });
    setSubjects([]);
    setChapters([]);

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

  const handleSubjectChange = async (subjectId) => {
    form.setFieldsValue({ chapterId: null });
    setChapters([]);

    if (!subjectId) return;

    try {
      const chapterData = await chapterApi.getBySubject(subjectId);
      setChapters(chapterData);
      if (chapterData.length === 0) message.warning("Môn học này chưa có chương nào!");
    } catch (error) {
      console.error("Lỗi fetch chương:", error);
      message.error("Không thể tải danh sách chương.");
    }
  };

  const handleQuestionTypeChange = (value) => {
    setQuestionType(value);
    setCorrectAnswers([]);
  };

  const submitQuestion = async (values) => {
    const answerCount = values.answers?.length || 0;
    const validationMessage = validateCorrectAnswers(values.questionType, correctAnswers, answerCount);
    if (validationMessage) {
      message.error(validationMessage);
      return;
    }

    setLoading(true);
    try {
      await questionApi.create({
        content: values.content,
        difficulty: values.difficulty,
        subjectId: values.subjectId,
        chapterId: values.chapterId,
        imageUrl: values.imageUrl,
        questionType: values.questionType,
        examEnabled: values.examEnabled,
        practiceEnabled: values.practiceEnabled,
        answers: buildNewQuestionAnswers(values, correctAnswers),
      });
      message.success("Thêm câu hỏi thành công!");
      resetFormState();
      onSuccess();
    } catch (error) {
      console.error("Error adding question:", error);
      message.error(getApiErrorMessage(error, "Không thể thêm câu hỏi. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetFormState();
    onCancel();
  };

  return {
    categories,
    chapters,
    correctAnswers,
    handleCancel,
    handleCategoryChange,
    handleQuestionTypeChange,
    handleSubjectChange,
    loading,
    previewImgUrl,
    questionType,
    setCorrectAnswers,
    setPreviewImgUrl,
    subjects,
    submitQuestion,
  };
};
