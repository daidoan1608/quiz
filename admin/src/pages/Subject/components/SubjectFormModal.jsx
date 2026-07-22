import React from "react";
import {
  Divider,
  Form,
  Input,
  Modal,
  Select,
  Skeleton,
} from "antd";
import {
  EditOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import {
  AdminResetButton,
} from "../../../components/common/buttons/AdminButtons";
import { buildAdminModalFooter } from "../../../components/common/forms/AdminFormActions";
import AdminModalTitle from "../../../components/common/modal/AdminModalTitle";
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
    <Modal
      title={
        <AdminModalTitle icon={isEditMode ? <EditOutlined /> : <ReadOutlined />}>
          {isEditMode ? `Cập nhật môn học ID: ${subjectId}` : "Thêm Môn Học"}
        </AdminModalTitle>
      }
      open={open}
      onCancel={cancel}
      footer={footer}
      width={500}
      centered
      maskClosable={!loading}
    >
      <Divider className="admin-modal-divider" />
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <Form form={form} layout="vertical" onFinish={submit} size="large">
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
            rules={
              isEditMode
                ? [{ required: true, message: "Vui lòng nhập mô tả!" }]
                : undefined
            }
          >
            <TextArea
              rows={4}
              placeholder="Nhập mô tả chi tiết..."
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};
