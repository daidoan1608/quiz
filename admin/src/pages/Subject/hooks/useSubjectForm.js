import { useCallback, useEffect, useState } from "react";
import { appMessage as message } from "../../../utils/ui/messageService";
import { Form } from "antd";
import { getApiErrorMessage } from "../../../api/axiosConfig";
import { categoryApi, subjectApi } from "../../../api/services";

export const useSubjectForm = ({
  mode,
  subjectId,
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEditMode = mode === "edit";

  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể lấy danh sách khoa."));
    }
  }, []);

  const fetchSubject = useCallback(async () => {
    if (!subjectId) return;

    setLoading(true);
    try {
      const data = await subjectApi.getById(subjectId);
      form.setFieldsValue(data);
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể lấy thông tin môn học."));
      onCancel();
    } finally {
      setLoading(false);
    }
  }, [form, onCancel, subjectId]);

  useEffect(() => {
    if (!open) return;

    if (!isEditMode) {
      form.resetFields();
      setLoading(false);
      if (categories.length === 0) {
        fetchCategories();
      }
      return;
    }

    fetchSubject();
  }, [
    categories.length,
    fetchCategories,
    fetchSubject,
    form,
    isEditMode,
    open,
  ]);

  const submit = async (values) => {
    setSubmitting(true);
    try {
      if (isEditMode) {
        await subjectApi.update(subjectId, values);
        message.success("Môn học đã được cập nhật thành công!");
      } else {
        await subjectApi.create(values);
        message.success("Thêm môn học thành công!");
      }
      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error(
        getApiErrorMessage(
          error,
          isEditMode
            ? "Không thể cập nhật môn học. Vui lòng thử lại."
            : "Không thể thêm môn học. Vui lòng thử lại."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = () => {
    form.resetFields();
    onCancel();
  };

  return {
    form,
    categories,
    loading,
    submitting,
    isEditMode,
    submit,
    cancel,
    reload: isEditMode ? fetchSubject : fetchCategories,
  };
};
