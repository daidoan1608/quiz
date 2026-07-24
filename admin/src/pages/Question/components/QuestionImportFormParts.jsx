import React from "react";
import { Alert, Col, Form, Row, Select, Upload } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import { AdminExportButton } from "../../../components/common/buttons/AdminButtons";
import sampleQuestionZipUrl from "../../../assets/templates/mau_zip.zip?url";

const { Option } = Select;
const { Dragger } = Upload;

export function QuestionImportInfoAlert({ compact = false }) {
  return (
    <Alert
      className="question-import-info"
      type="info"
      message={
        <div>
          Chức năng này dùng để nhập dữ liệu câu hỏi hàng loạt từ file Excel/CSV
          hoặc <b>file ZIP</b> chứa cả file Excel và thư mục ảnh minh họa,
          ví dụ thư mục <code>images/</code> trong ZIP.
          {!compact && (
            <>
              {" "}
              Các cột nội dung câu hỏi và đáp án hỗ trợ Markdown/LaTeX như
              <code> **in đậm**</code>, <code>$x^2$</code>, <code>{"$$\\frac{a}{b}$$"}</code>.
              Mỗi câu cần 2 đến 8 đáp án. Đáp án phải nhập liền từ A đến H;
              không bỏ trống đáp án ở giữa rồi nhập đáp án phía sau.
            </>
          )}
        </div>
      }
      action={
        <AdminExportButton
          type="link"
          href={sampleQuestionZipUrl}
          download="mau_nhap_cau_hoi.zip"
        >
          Tải folder mẫu
        </AdminExportButton>
      }
      showIcon
    />
  );
}

export function QuestionImportClassificationFields({
  categories,
  chapters,
  handleCategoryChange,
  handleSubjectChange,
  isChaptersEmpty,
  subjects,
}) {
  return (
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
            {categories.map((category) => (
              <Option key={category.categoryId} value={category.categoryId}>
                {category.categoryName}
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
            {subjects.map((subject) => (
              <Option key={subject.subjectId} value={subject.subjectId}>
                {subject.name}
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
            {chapters.map((chapter) => (
              <Option key={chapter.chapterId} value={chapter.chapterId}>
                {chapter.name} (Chương {chapter.chapterNumber})
              </Option>
            ))}
          </Select>
        </Form.Item>
        {isChaptersEmpty && (
          <Alert
            className="question-import-chapter-alert"
            type="warning"
            message="Không có chương nào khả dụng"
            showIcon
          />
        )}
      </Col>
    </Row>
  );
}

export function QuestionImportUploadField({ selectedFile, uploadProps }) {
  return (
    <Form.Item
      name="fileUpload"
      rules={[{ required: !selectedFile, message: "Vui lòng chọn file!" }]}
    >
      <Dragger className="question-import-dragger" {...uploadProps}>
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
  );
}

export function QuestionImportPreviewAlert({ maxErrors, previewResult }) {
  if (!previewResult) return null;

  const errors = previewResult.errors || [];
  const visibleErrors = maxErrors ? errors.slice(0, maxErrors) : errors;

  return (
    <Alert
      className="question-import-preview"
      type={previewResult.invalidRows > 0 ? "warning" : "success"}
      showIcon
      message={`Kiểm tra: ${previewResult.validRows}/${previewResult.totalRows} dòng hợp lệ`}
      description={
        errors.length > 0 ? (
          <div className="question-import-error-list">
            {visibleErrors.map((error, index) => (
              <div key={`${error}-${index}`}>{error}</div>
            ))}
            {maxErrors && errors.length > maxErrors && (
              <div>...còn {errors.length - maxErrors} lỗi khác</div>
            )}
          </div>
        ) : (
          "Không phát hiện lỗi định dạng cơ bản."
        )
      }
    />
  );
}
