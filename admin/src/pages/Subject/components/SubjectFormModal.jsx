import React from "react";
import {
  Button,
  Divider,
  Form,
  Input,
  Modal,
  Select,
  Skeleton,
  Typography,
} from "antd";
import {
  EditOutlined,
  ReadOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  cancelModalButtonStyle,
  primaryModalButtonStyle,
} from "../../../utils/ui/antdModalButtonStyles";
import { useSubjectForm } from "../hooks/useSubjectForm";

const { Title } = Typography;
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

  const footer = [
    isEditMode && (
      <Button
        key="restore"
        icon={<ReloadOutlined />}
        onClick={reload}
        disabled={loading}
      >
        Khôi phục gốc
      </Button>
    ),
    <Button key="back" style={cancelModalButtonStyle} onClick={cancel}>
      Hủy bỏ
    </Button>,
    <Button
      key="submit"
      type="default"
      style={primaryModalButtonStyle}
      icon={<SaveOutlined />}
      loading={submitting}
      onClick={() => form.submit()}
    >
      {isEditMode ? "Lưu thay đổi" : "Lưu"}
    </Button>,
  ].filter(Boolean);

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          {isEditMode ? (
            <>
              <EditOutlined style={{ marginRight: 8 }} /> Cập nhật môn học ID:{" "}
              {subjectId}
            </>
          ) : (
            <>
              <ReadOutlined style={{ marginRight: 8 }} /> Thêm Môn Học
            </>
          )}
        </Title>
      }
      open={open}
      onCancel={cancel}
      footer={footer}
      width={500}
      centered
      maskClosable={!loading}
    >
      <Divider style={{ margin: "16px 0" }} />
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
