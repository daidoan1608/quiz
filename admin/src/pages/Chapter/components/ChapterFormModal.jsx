import React from "react";
import {
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
} from "antd";
import {
  BookOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { AdminResetButton } from "../../../components/common/buttons/AdminButtons";
import { buildAdminModalFooter } from "../../../components/common/forms/AdminFormActions";
import AdminReadonlyField from "../../../components/common/forms/AdminReadonlyField";
import AdminModalFormShell from "../../../components/common/modal/AdminModalFormShell";
import { useChapterForm } from "../hooks/useChapterForm";

export const ChapterFormModal = ({
  mode,
  chapterId,
  open,
  onCancel,
  onSuccess,
}) => {
  const {
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
    reload,
  } = useChapterForm({
    mode,
    chapterId,
    open,
    onCancel,
    onSuccess,
  });

  const footer = buildAdminModalFooter({
    extra: (
      <AdminResetButton key="reset" onClick={reload} disabled={loading}>
        Khôi phục
      </AdminResetButton>
    ),
    loading: submitting,
    onCancel: cancel,
    onSubmit: () => form.submit(),
  });

  return (
    <AdminModalFormShell
      title={isEditMode ? "Cập nhật chương" : "Thêm Chương Mới"}
      icon={isEditMode ? <EditOutlined /> : <BookOutlined />}
      open={open}
      onCancel={cancel}
      loading={loading}
      footer={footer}
      width={isEditMode ? 500 : 700}
      centered
      maskClosable={!loading}
    >
      <Form form={form} layout="vertical" onFinish={submit} size="large">
        {isEditMode ? (
          <>
            <AdminReadonlyField name="chapterId" />

            <Form.Item
              label="Tên chương"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên chương!" }]}
            >
              <Input placeholder="Ví dụ: Giới thiệu về OOP" />
            </Form.Item>

            <Form.Item
              label="Số chương"
              name="chapterNumber"
              rules={[{ required: true, message: "Vui lòng nhập số chương!" }]}
            >
              <InputNumber
                className="admin-full-control"
                placeholder="Ví dụ: 1"
                min={1}
              />
            </Form.Item>
          </>
        ) : (
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Chọn Khoa"
                name="categoryId"
                rules={[{ required: true, message: "Vui lòng chọn khoa!" }]}
              >
                <Select
                  placeholder="-- Chọn Khoa --"
                  onChange={fetchSubjectsByCategory}
                  showSearch
                  optionFilterProp="label"
                  options={categories.map((category) => ({
                    value: category.categoryId,
                    label: category.categoryName,
                  }))}
                />
              </Form.Item>

              <Form.Item
                label="Chọn Môn Học"
                name="subjectId"
                rules={[{ required: true, message: "Vui lòng chọn môn học!" }]}
              >
                <Select
                  placeholder={
                    isSubjectDisabled
                      ? "Vui lòng chọn Khoa trước"
                      : "-- Chọn Môn Học --"
                  }
                  disabled={isSubjectDisabled}
                  showSearch
                  optionFilterProp="label"
                  options={subjects.map((subject) => ({
                    value: subject.subjectId,
                    label: subject.name,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Tên Chương"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên chương!" },
                ]}
              >
                <Input placeholder="Ví dụ: Giới thiệu về Java" />
              </Form.Item>

              <Form.Item
                label="Chương số"
                name="chapterNumber"
                rules={[
                  { required: true, message: "Vui lòng nhập số chương!" },
                ]}
              >
                <InputNumber
                  className="admin-full-control"
                  min={1}
                  placeholder="Ví dụ: 1"
                />
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    </AdminModalFormShell>
  );
};
