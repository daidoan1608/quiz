import React from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Row,
  Select,
  Space,
  Typography,
  Upload,
} from "antd";
import {
  ArrowLeftOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
  ImportOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuestionImport } from "./hooks/useQuestionImport";

const { Title } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

const QuestionImportPage = () => {
  const navigate = useNavigate();
  const goBack = () => navigate("/questions");
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
  } = useQuestionImport({
    isModalOpen: true,
    onCancel: goBack,
    onSuccess: goBack,
  });

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
          Quay lại
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          <ImportOutlined /> Import câu hỏi
        </Title>
      </Space>

      <Card bordered={false}>
        <Alert
          type="info"
          message={
            <div>
              Chức năng này dùng để nhập dữ liệu câu hỏi hàng loạt từ file Excel/CSV
              hoặc <b>file ZIP</b> chứa cả file Excel và thư mục ảnh minh họa,
              ví dụ thư mục <code>images/</code> trong ZIP.
              Các cột nội dung câu hỏi và đáp án hỗ trợ Markdown/LaTeX như
              <code> **in đậm**</code>, <code>$x^2$</code>, <code>{"$$\\frac{a}{b}$$"}</code>.
              Mỗi câu cần 2 đến 8 đáp án. Đáp án phải nhập liền từ A đến H;
              không bỏ trống đáp án ở giữa rồi nhập đáp án phía sau.
            </div>
          }
          action={
            <Button
              type="link"
              icon={<DownloadOutlined />}
              href="/templates/mau_import.xlsx"
              download="mau_nhap_cau_hoi.xlsx"
            >
              Tải file mẫu
            </Button>
          }
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form form={form} layout="vertical" onFinish={handleUpload} size="large">
          <Divider orientation="left">Thông tin phân loại</Divider>
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Khoa"
                name="categoryId"
                rules={[{ required: true, message: "Vui lòng chọn khoa!" }]}
              >
                <Select
                  placeholder="Chọn khoa"
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
                label="Môn học"
                name="subjectId"
                rules={[{ required: true, message: "Vui lòng chọn môn!" }]}
              >
                <Select
                  placeholder={subjects.length === 0 ? "Chọn khoa trước" : "Chọn môn"}
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
                label="Chương"
                name="chapterId"
                rules={[{ required: true, message: "Vui lòng chọn chương!" }]}
              >
                <Select
                  placeholder={chapters.length === 0 ? "Chọn môn trước" : "Chọn chương"}
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
          <Form.Item
            name="fileUpload"
            rules={[{ required: !selectedFile, message: "Vui lòng chọn file!" }]}
          >
            <Dragger {...uploadProps} style={{ padding: 24 }}>
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined />
              </p>
              <p className="ant-upload-text">
                Kéo thả file vào đây hoặc nhấn để chọn file
              </p>
              <p className="ant-upload-hint">
                Hỗ trợ *.xlsx, *.xls, *.csv, *.zip. CSV nên lưu UTF-8; nếu có dấu phẩy
                hoặc xuống dòng trong Markdown/LaTeX, hãy bọc ô bằng dấu nháy kép.
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
                  <div style={{ maxHeight: 260, overflowY: "auto" }}>
                    {previewResult.errors.map((error, index) => (
                      <div key={`${error}-${index}`}>{error}</div>
                    ))}
                  </div>
                ) : (
                  "Không phát hiện lỗi định dạng cơ bản."
                )
              }
            />
          )}

          <Space style={{ display: "flex", justifyContent: "flex-end", marginTop: 30 }}>
            <Button onClick={handleCancel}>Hủy bỏ</Button>
            <Button icon={<CloudUploadOutlined />} loading={previewLoading} onClick={handlePreview}>
              Kiểm tra file
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<ImportOutlined />}
              loading={loading}
              disabled={(isChaptersEmpty && chapters.length === 0) || previewResult?.invalidRows > 0}
            >
              Bắt đầu import
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default QuestionImportPage;
