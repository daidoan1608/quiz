import React from 'react';
import {
  Form, Select, Modal,
  Typography, Divider,
  Upload, Row, Col, Alert
} from "antd";
import {
  CloudUploadOutlined,
  ImportOutlined,
} from "@ant-design/icons";
import {
  AdminCheckButton,
  AdminExportButton,
  AdminImportButton,
} from "../../../components/common/buttons/AdminButtons";
import { useQuestionImport } from "../hooks/useQuestionImport";

const { Title } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

const QuestionImportModal = ({ isModalOpen, onCancel, onSuccess }) => {
  const {
    form,
    categories,
    subjects,
    chapters,
    loading,
    previewLoading,
    selectedFile,
    previewResult,
    isChaptersEmpty,
    uploadProps,
    handleCategoryChange,
    handleSubjectChange,
    handlePreview,
    handleUpload,
    handleCancel,
  } = useQuestionImport({ isModalOpen, onCancel, onSuccess });

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <ImportOutlined style={{ marginRight: 8 }} /> Import Câu Hỏi
        </Title>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={700}
      centered
      maskClosable={false}
    >
      <Alert
        type="info"
        message={
          <div>
            Chức năng này dùng để nhập dữ liệu câu hỏi hàng loạt từ file Excel/CSV hoặc <b>file ZIP</b> chứa cả file Excel và thư mục ảnh minh họa (ví dụ thư mục <code>images/</code> trong ZIP).
          </div>
        }
        action={
          <AdminExportButton
            type="link"
            href="/templates/mau_zip.zip"
            download="mau_nhap_cau_hoi.zip"
          >
            Tải folder mẫu
          </AdminExportButton>
        }
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Divider orientation="left">Thông tin phân loại</Divider>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleUpload}
        size="large"
      >
        {/* Dropdowns (Cascading Selects) */}
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Chọn Khoa"
              name="categoryId"
              rules={[{ required: true, message: "Vui lòng chọn khoa!" }]}
            >
              <Select
                placeholder="-- Chọn khoa --"
                onChange={handleCategoryChange}
                showSearch
                optionFilterProp="children"
              >
                {categories.map((cat) => (
                  <Option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Chọn Môn Học"
              name="subjectId"
              rules={[{ required: true, message: "Vui lòng chọn môn!" }]}
            >
              <Select
                placeholder="-- Chọn môn --"
                onChange={handleSubjectChange}
                disabled={subjects.length === 0}
                showSearch
                optionFilterProp="children"
              >
                {subjects.map((sub) => (
                  <Option key={sub.subjectId} value={sub.subjectId}>
                    {sub.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Chọn Chương"
              name="chapterId"
              rules={[{ required: true, message: "Vui lòng chọn chương!" }]}
            >
              <Select
                placeholder="-- Chọn chương --"
                disabled={chapters.length === 0}
                showSearch
                optionFilterProp="children"
              >
                {chapters.map((chap) => (
                  <Option key={chap.chapterId} value={chap.chapterId}>
                    {chap.name} (Chương {chap.chapterNumber})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {isChaptersEmpty && (
              <Alert
                type="warning"
                message="Không có chương nào khả dụng"
                showIcon
                style={{ marginTop: -10 }}
              />
            )}
          </Col>
        </Row>

        <Divider orientation="left">Chọn tập tin</Divider>

        {/* Upload Component */}
        <Form.Item
          name="fileUpload"
          rules={[
            { required: !selectedFile, message: "Vui lòng chọn file!" },
          ]}
        >
          <Dragger {...uploadProps} style={{ padding: "20px" }}>
            <p className="ant-upload-drag-icon">
              <CloudUploadOutlined />
            </p>
            <p className="ant-upload-text">
              Kéo thả file vào đây hoặc nhấn để chọn file
            </p>
            <p className="ant-upload-hint">
              Hỗ trợ file *.xlsx, *.xls, *.csv, *.zip (Tải lên file Excel đơn lẻ hoặc file ZIP chứa Excel + folder ảnh)
            </p>
          </Dragger>
        </Form.Item>

        {previewResult && (
          <Alert
            type={previewResult.invalidRows > 0 ? "warning" : "success"}
            showIcon
            style={{ marginTop: 16 }}
            message={`Kiểm tra: ${previewResult.validRows}/${previewResult.totalRows} dòng hợp lệ`}
            description={
              previewResult.errors?.length > 0 ? (
                <div style={{ maxHeight: 140, overflowY: "auto" }}>
                  {previewResult.errors.slice(0, 20).map((error, index) => (
                    <div key={`${error}-${index}`}>{error}</div>
                  ))}
                  {previewResult.errors.length > 20 && (
                    <div>...còn {previewResult.errors.length - 20} lỗi khác</div>
                  )}
                </div>
              ) : (
                "Không phát hiện lỗi định dạng cơ bản."
              )
            }
          />
        )}

        {/* Upload Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 30,
          }}
        >
          <AdminCheckButton
            loading={previewLoading}
            size="large"
            onClick={handlePreview}
          >
            Kiểm tra file
          </AdminCheckButton>
          <AdminImportButton
            htmlType="submit"
            loading={loading}
            size="large"
            disabled={(isChaptersEmpty && chapters.length === 0) || previewResult?.invalidRows > 0}
          >
            Bắt đầu Upload
          </AdminImportButton>
        </div>
      </Form>
    </Modal>
  );
};

export default QuestionImportModal;
