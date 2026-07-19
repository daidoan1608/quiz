import { useCallback, useEffect, useState } from "react";
import { Form, message } from "antd";
import { authAxios, getApiErrorMessage } from "../../../api/axiosConfig";
import { normalizeApiListResponse } from "../../../utils/apiResponseData";

export const useChapterForm = ({
  mode,
  chapterId,
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEditMode = mode === "edit";
  const isSubjectDisabled = subjects.length === 0;

  const fetchCategories = useCallback(async () => {
    try {
      const response = await authAxios.get("/public/categories");
      setCategories(normalizeApiListResponse(response));
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể lấy danh sách khoa."));
    }
  }, []);

  const fetchSubjectsByCategory = useCallback(
    async (categoryId) => {
      form.setFieldsValue({ subjectId: null });
      setSubjects([]);

      if (!categoryId) return;

      try {
        const response = await authAxios.get(
          `/public/subjects/category/${categoryId}`
        );
        const subjectData = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setSubjects(subjectData);

        if (subjectData.length === 0) {
          message.warning("Khoa này chưa có môn học nào!");
        }
      } catch (error) {
        message.error(
          getApiErrorMessage(error, "Không thể lấy danh sách môn học theo khoa.")
        );
      }
    },
    [form]
  );

  const fetchChapter = useCallback(async () => {
    if (!chapterId) return;

    setLoading(true);
    try {
      const response = await authAxios.get(`/public/chapters/${chapterId}`);
      form.setFieldsValue(response.data.data);
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể lấy thông tin chương."));
      onCancel();
    } finally {
      setLoading(false);
    }
  }, [chapterId, form, onCancel]);

  useEffect(() => {
    if (!open) return;

    if (isEditMode) {
      fetchChapter();
      return;
    }

    form.resetFields();
    setSubjects([]);
    setLoading(false);
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [
    categories.length,
    fetchCategories,
    fetchChapter,
    form,
    isEditMode,
    open,
  ]);

  const resetCreateForm = () => {
    form.resetFields();
    setSubjects([]);
  };

  const submit = async (values) => {
    setSubmitting(true);
    try {
      if (isEditMode) {
        await authAxios.patch(`/admin/chapters/${chapterId}`, values);
        message.success("Cập nhật chương thành công!");
      } else {
        await authAxios.post("/admin/chapters", {
          name: values.name,
          subjectId: values.subjectId,
          chapterNumber: values.chapterNumber,
        });
        message.success("Thêm chương thành công!");
      }

      resetCreateForm();
      onSuccess();
    } catch (error) {
      message.error(
        getApiErrorMessage(
          error,
          isEditMode
            ? "Không thể cập nhật chương. Vui lòng thử lại."
            : "Không thể thêm chương. Vui lòng thử lại."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = () => {
    resetCreateForm();
    onCancel();
  };

  return {
    form,
    categories,
    subjects,
    loading,
    submitting,
    isEditMode,
    isSubjectDisabled,
    fetchSubjectsByCategory,
    submit,
    cancel,
    reload: isEditMode ? fetchChapter : resetCreateForm,
  };
};
