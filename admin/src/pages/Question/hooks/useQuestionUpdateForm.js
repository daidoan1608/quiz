import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { getApiErrorMessage } from "../../../api/axiosConfig";
import { questionApi } from "../../../api/services/contentApi";
import {
  buildUpdatedQuestionAnswers,
  isAnswerCorrect,
  resolveQuestionType,
  validateCorrectAnswers,
} from "../../../utils/questionForm";

export const useQuestionUpdateForm = ({ form, isModalOpen, onCancel, onSuccess, questionId }) => {
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questionType, setQuestionType] = useState("SINGLE_CHOICE");
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [previewImgUrl, setPreviewImgUrl] = useState("");
  const [originalAnswers, setOriginalAnswers] = useState([]);
  const [imageType, setImageType] = useState("upload");

  const fetchQuestion = useCallback(async () => {
    if (!questionId || !isModalOpen) {
      setLoadingData(true);
      return;
    }

    setLoadingData(true);
    try {
      const data = await questionApi.getById(questionId);
      const qType = resolveQuestionType(data);
      setQuestionType(qType);
      setCorrectAnswers(
        data.answers
          .map((answer, index) => (isAnswerCorrect(answer) ? index : null))
          .filter((index) => index !== null)
      );
      setOriginalAnswers(data.answers);
      setPreviewImgUrl(data.imageUrl || "");
      setImageType(data.imageUrl && data.imageUrl.startsWith("http") ? "url" : "upload");
      form.setFieldsValue({
        content: data.content,
        difficulty: data.difficulty,
        imageUrl: data.imageUrl,
        questionType: qType,
        answer_0: data.answers[0]?.content,
        answer_1: data.answers[1]?.content,
        answer_2: data.answers[2]?.content,
        answer_3: data.answers[3]?.content,
      });
    } catch (error) {
      console.error("Error:", error);
      message.error("Không thể tải thông tin câu hỏi!");
      onCancel();
    } finally {
      setLoadingData(false);
    }
  }, [form, isModalOpen, onCancel, questionId]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleQuestionTypeChange = (value) => {
    setQuestionType(value);
    setCorrectAnswers([]);
  };

  const submitQuestion = async (values) => {
    const validationMessage = validateCorrectAnswers(values.questionType, correctAnswers);
    if (validationMessage) {
      message.error(validationMessage);
      return;
    }

    setSubmitting(true);
    try {
      await questionApi.update(questionId, {
        questionId: Number(questionId),
        content: values.content,
        difficulty: values.difficulty,
        imageUrl: values.imageUrl,
        questionType: values.questionType,
        answers: buildUpdatedQuestionAnswers(values, originalAnswers, correctAnswers),
      });
      message.success("Cập nhật câu hỏi thành công!");
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      message.error(getApiErrorMessage(error, "Không thể cập nhật câu hỏi. Vui lòng thử lại."));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    correctAnswers,
    handleQuestionTypeChange,
    imageType,
    loadingData,
    previewImgUrl,
    questionType,
    setCorrectAnswers,
    setImageType,
    setPreviewImgUrl,
    submitQuestion,
    submitting,
  };
};
