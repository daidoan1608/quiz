import React from "react";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Skeleton,
  Typography,
} from "antd";
import {
  BookOutlined,
  EditOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  cancelModalButtonStyle,
  primaryModalButtonStyle,
} from "../../../utils/ui/antdModalButtonStyles";
import { useChapterForm } from "../hooks/useChapterForm";

const { Title } = Typography;

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

  const footer = [
    <Button key="reset" icon={<ReloadOutlined />} onClick={reload} disabled={loading}>
      {isEditMode ? "Khôi phục gốc" : "Làm mới"}
    </Button>,
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
      {isEditMode ? "Lưu thay đổi" : "Lưu Chương"}
    </Button>,
  ];

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          {isEditMode ? (
            <>
              <EditOutlined style={{ marginRight: 8 }} /> Cập nhật chương ID:{" "}
              {chapterId}
            </>
          ) : (
            <>
              <BookOutlined style={{ marginRight: 8 }} /> Thêm Chương Mới
            </>
          )}
        </Title>
      }
      open={open}
      onCancel={cancel}
      footer={footer}
      width={isEditMode ? 500 : 700}
      centered
      maskClosable={!loading}
    >
      <Divider style={{ margin: "16px 0" }} />
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <Form form={form} layout="vertical" onFinish={submit} size="large">
          {isEditMode ? (
            <>
              <Form.Item
                label="Tên chương"
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập tên chương!" }]}
              >
                <Input placeholder="Ví dụ: Giới thiệu về OOP" />
              </Form.Item>

              <Form.Item
                label="Mã môn học (Subject ID)"
                name="subjectId"
                tooltip="Mã môn học không nên thay đổi sau khi chương được tạo."
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="ID môn học"
                  min={1}
                  disabled
                />
              </Form.Item>

              <Form.Item
                label="Số chương"
                name="chapterNumber"
                rules={[{ required: true, message: "Vui lòng nhập số chương!" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
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
                    style={{ width: "100%" }}
                    min={1}
                    placeholder="Ví dụ: 1"
                  />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
      )}
    </Modal>
  );
};
