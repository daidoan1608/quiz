import React from "react";
import { Form, Input, Modal, Switch, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

export const DocumentModal = ({
  form,
  editing,
  modalOpen,
  saving,
  closeModal,
  saveDocument,
  setSelectedFile,
}) => (
  <Modal
    title={editing ? "Cập nhật tài liệu" : "Thêm tài liệu"}
    open={modalOpen}
    onCancel={closeModal}
    onOk={saveDocument}
    confirmLoading={saving}
    okText={editing ? "Cập nhật" : "Tải lên"}
    cancelText="Hủy"
    destroyOnClose
  >
    <Form form={form} layout="vertical" initialValues={{ active: true }}>
      <Form.Item
        label="Tiêu đề"
        name="title"
        rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
      >
        <Input placeholder="Nhập tiêu đề tài liệu" />
      </Form.Item>
      <Form.Item label="Mô tả" name="description">
        <Input.TextArea rows={3} placeholder="Mô tả ngắn về tài liệu" />
      </Form.Item>
      <Form.Item label="Hiển thị trên client" name="active" valuePropName="checked">
        <Switch />
      </Form.Item>

      {!editing && (
        <Form.Item label="File tài liệu" required>
          <Dragger
            maxCount={1}
            beforeUpload={(file) => {
              setSelectedFile(file);
              return false;
            }}
            onRemove={() => setSelectedFile(null)}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Kéo thả hoặc nhấn để chọn file</p>
            <p className="ant-upload-hint">
              Hỗ trợ doc, docx, ppt, pptx, xls, xlsx, pdf, csv, zip, rar.
            </p>
          </Dragger>
        </Form.Item>
      )}
    </Form>
  </Modal>
);
