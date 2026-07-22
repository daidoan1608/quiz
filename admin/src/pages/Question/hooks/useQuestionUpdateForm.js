import { useCallback, useEffect, useRef, useState } from "react";
import { appMessage as message } from "../../../utils/ui/messageService";
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
  const onCancelRef = useRef(onCancel);
  const submittingRef = useRef(false);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

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
        examEnabled: data.examEnabled !== false,
        practiceEnabled: data.practiceEnabled !== false,
        questionType: qType,
        answers: (data.answers || []).map((answer) => ({ content: answer.content })),
      });
    } catch (error) {
      console.error("Error:", error);
      message.error("Không thể tải thông tin câu hỏi!");
      onCancelRef.current?.();
    } finally {
      setLoadingData(false);
    }
  }, [form, isModalOpen, questionId]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleQuestionTypeChange = (value) => {
    setQuestionType(value);
    setCorrectAnswers([]);
  };

  const submitQuestion = async (values) => {
    if (submittingRef.current) {
      return;
    }

    const answerCount = values.answers?.length || 0;
    const validationMessage = validateCorrectAnswers(values.questionType, correctAnswers, answerCount);
    if (validationMessage) {
      message.error(validationMessage);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      await questionApi.update(questionId, {
        questionId: Number(questionId),
        content: values.content,
        difficulty: values.difficulty,
        imageUrl: values.imageUrl,
        questionType: values.questionType,
        examEnabled: values.examEnabled,
        practiceEnabled: values.practiceEnabled,
        answers: buildUpdatedQuestionAnswers(values, originalAnswers, correctAnswers),
      });
      message.success("Cập nhật câu hỏi thành công!");
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      message.error(getApiErrorMessage(error, "Không thể cập nhật câu hỏi. Vui lòng thử lại."));
    } finally {
      submittingRef.current = false;
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
