import { useEffect, useState } from "react";
import { appMessage as message } from "../../../utils/ui/messageService";
import { Form } from "antd";
import { getApiErrorMessage } from "../../../api/axiosConfig";
import { categoryApi } from "../../../api/services";

export const useCategoryForm = ({
  mode,
  categoryId,
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (!open) return;
    if (!isEditMode || !categoryId) {
      form.resetFields();
      setLoading(false);
      return;
    }

    const fetchCategory = async () => {
      setLoading(true);
      try {
        const data = await categoryApi.getById(categoryId);
        form.setFieldsValue(data);
      } catch (error) {
        message.error(getApiErrorMessage(error, "Không thể lấy thông tin khoa."));
        onCancel();
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId, form, isEditMode, onCancel, open]);

  const submit = async (values) => {
    setSubmitting(true);
    try {
      if (isEditMode) {
        const { categoryId: _categoryId, ...payload } = values;
        await categoryApi.update(categoryId, payload);
        message.success("Cập nhật khoa thành công!");
      } else {
        await categoryApi.create(values);
        message.success("Thêm khoa mới thành công!");
      }
      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error(
        getApiErrorMessage(
          error,
          isEditMode
            ? "Không thể cập nhật khoa."
            : "Không thể thêm khoa. Vui lòng thử lại."
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
    loading,
    submitting,
    isEditMode,
    submit,
    cancel,
  };
};
