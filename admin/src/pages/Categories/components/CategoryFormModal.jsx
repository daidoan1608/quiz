import React from "react";
import { Button, Divider, Form, Input, Modal, Skeleton, Typography } from "antd";
import { AppstoreAddOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import {
  cancelModalButtonStyle,
  primaryModalButtonStyle,
} from "../../../utils/ui/antdModalButtonStyles";
import { useCategoryForm } from "../hooks/useCategoryForm";

const { Title } = Typography;
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
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          {isEditMode ? (
            <>
              <EditOutlined style={{ marginRight: 8 }} /> Cập Nhật Khoa: {categoryId}
            </>
          ) : (
            <>
              <AppstoreAddOutlined style={{ marginRight: 8 }} /> Thêm Khoa Mới
            </>
          )}
        </Title>
      }
      open={open}
      onCancel={cancel}
      footer={[
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
      ]}
      width={500}
      centered
      maskClosable={!loading}
    >
      <Divider style={{ margin: "16px 0" }} />
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
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
      )}
    </Modal>
  );
};
