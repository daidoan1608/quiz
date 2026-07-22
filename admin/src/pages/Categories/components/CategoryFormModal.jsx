import React from "react";
import { Form, Input } from "antd";
import { AppstoreAddOutlined, EditOutlined } from "@ant-design/icons";
import {
  buildAdminModalFooter,
} from "../../../components/common/forms/AdminFormActions";
import AdminModalFormShell from "../../../components/common/modal/AdminModalFormShell";
import { useCategoryForm } from "../hooks/useCategoryForm";

const { TextArea } = Input;

export const CategoryFormModal = ({
  mode,
  categoryId,
  open,
  onCancel,
  onSuccess,
}) => {
  const { form, loading, submitting, isEditMode, submit, cancel } =
    useCategoryForm({
      mode,
      categoryId,
      open,
      onCancel,
      onSuccess,
    });

  return (
    <AdminModalFormShell
      title={isEditMode ? `Cập Nhật Khoa: ${categoryId}` : "Thêm Khoa Mới"}
      icon={isEditMode ? <EditOutlined /> : <AppstoreAddOutlined />}
      open={open}
      onCancel={cancel}
      loading={loading}
      footer={buildAdminModalFooter({
        loading: submitting,
        onCancel: cancel,
        onSubmit: () => form.submit(),
      })}
      width={500}
      centered
      maskClosable={!loading}
    >
      <Form form={form} layout="vertical" onFinish={submit} size="large">
        <Form.Item
          label="Tên khoa"
          name="categoryName"
          rules={[
            { required: true, message: "Vui lòng nhập tên khoa!" },
            { min: 3, message: "Tên khoa phải từ 3 ký tự trở lên" },
          ]}
        >
          <Input placeholder="Ví dụ: Công nghệ thông tin" />
        </Form.Item>

        <Form.Item label="Mô tả" name="categoryDescription">
          <TextArea
            rows={4}
            placeholder="Nhập mô tả chi tiết về khoa..."
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </AdminModalFormShell>
  );
};
