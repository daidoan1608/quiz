import React from "react";
import {
  Form,
  Input,
  Select,
} from "antd";
import {
  EditOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import {
  AdminResetButton,
} from "../../../components/common/buttons/AdminButtons";
import { buildAdminModalFooter } from "../../../components/common/forms/AdminFormActions";
import AdminReadonlyField from "../../../components/common/forms/AdminReadonlyField";
import AdminModalFormShell from "../../../components/common/modal/AdminModalFormShell";
import { useSubjectForm } from "../hooks/useSubjectForm";

const { TextArea } = Input;

export const SubjectFormModal = ({
  mode,
  subjectId,
  open,
  onCancel,
  onSuccess,
}) => {
  const {
    form,
    categories,
    loading,
    submitting,
    isEditMode,
    submit,
    cancel,
    reload,
  } = useSubjectForm({
    mode,
    subjectId,
    open,
    onCancel,
    onSuccess,
  });

  const footer = buildAdminModalFooter({
    extra: isEditMode && (
      <AdminResetButton key="restore" onClick={reload} disabled={loading}>
        Khôi phục
      </AdminResetButton>
    ),
    loading: submitting,
    onCancel: cancel,
    onSubmit: () => form.submit(),
  });

  return (
    <AdminModalFormShell
      title={isEditMode ? "Cập nhật môn học" : "Thêm Môn Học"}
      icon={isEditMode ? <EditOutlined /> : <ReadOutlined />}
      open={open}
      onCancel={cancel}
      loading={loading}
      footer={footer}
      width={500}
      centered
      maskClosable={!loading}
    >
      <Form form={form} layout="vertical" onFinish={submit} size="large">
        {isEditMode && (
          <AdminReadonlyField name="subjectId" />
        )}

        {!isEditMode && (
          <Form.Item
            label="Chọn Khoa"
            name="categoryId"
            rules={[{ required: true, message: "Vui lòng chọn khoa!" }]}
          >
            <Select
              placeholder="-- Chọn Khoa --"
              showSearch
              optionFilterProp="label"
              options={categories.map((category) => ({
                value: category.categoryId,
                label: category.categoryName,
              }))}
            />
          </Form.Item>
        )}

        <Form.Item
          label="Tên môn học"
          name="name"
          rules={[
            { required: true, message: "Vui lòng nhập tên môn học!" },
            {
              min: 3,
              message: isEditMode
                ? "Tên môn học quá ngắn!"
                : "Tên môn học phải từ 3 ký tự trở lên",
            },
          ]}
        >
          <Input
            placeholder={isEditMode ? "Ví dụ: Lập trình Java" : "Ví dụ: Cơ sở dữ liệu"}
          />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
        >
          <TextArea
            rows={4}
            placeholder="Nhập mô tả chi tiết..."
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </AdminModalFormShell>
  );
};
