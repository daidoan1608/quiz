import React, { useEffect, useState, useCallback } from "react";
import {
  Form, Input, Button, Modal, Select, Radio, Checkbox, Alert, Upload,
  message, Typography, Divider, Skeleton, Row, Col, theme,
} from "antd";
import {
  SaveOutlined, EditOutlined, CheckCircleOutlined, UploadOutlined
} from "@ant-design/icons";
import { authAxios } from "../../api/axiosConfig";
import { parseMarkdown } from "../../utils/parseMarkdown";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const UpdateQuestionModal = ({ isModalOpen, onCancel, onSuccess, questionId }) => {
  const [form] = Form.useForm();
  const { token } = theme.useToken();

  // State quản lý
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State lưu loại câu hỏi và đáp án đúng
  const [questionType, setQuestionType] = useState('SINGLE_CHOICE');
  const [correctAnswers, setCorrectAnswers] = useState([]); // Mảng lưu các index đáp án đúng
  const [previewImgUrl, setPreviewImgUrl] = useState('');

  // State lưu mảng đáp án gốc (để giữ lại optionId khi gửi cập nhật)
  const [originalAnswers, setOriginalAnswers] = useState([]);

  const [imageType, setImageType] = useState('upload'); // 'upload' | 'url'
  const [uploadingImage, setUploadingImage] = useState(false);

  const content = Form.useWatch("content", form);
  const answer_0 = Form.useWatch("answer_0", form);
  const answer_1 = Form.useWatch("answer_1", form);
  const answer_2 = Form.useWatch("answer_2", form);
  const answer_3 = Form.useWatch("answer_3", form);

  const previewBoxStyle = {
    padding: '8px 12px',
    border: `1px dashed ${token.colorBorder}`,
    borderRadius: 6,
    background: token.colorFillQuaternary,
    color: token.colorText,
  };

  const previewLabelStyle = {
    color: token.colorTextSecondary,
    fontSize: 11,
    marginBottom: 4,
  };

  const answerPreviewBoxStyle = {
    marginTop: 4,
    padding: '4px 8px',
    border: `1px dashed ${token.colorBorder}`,
    borderRadius: 4,
    background: token.colorFillQuaternary,
    color: token.colorText,
    fontSize: 13,
  };

  const answerPreviewLabelStyle = {
    color: token.colorTextSecondary,
    marginRight: 8,
  };

  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      const timer = setTimeout(() => {
        window.MathJax.typesetPromise();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [content, answer_0, answer_1, answer_2, answer_3]);

  const handleUploadImage = async (options) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setUploadingImage(true);
      const response = await authAxios.post("admin/questions/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const returnedUrl = response.data.data.imageUrl;
      form.setFieldsValue({ imageUrl: returnedUrl });
      setPreviewImgUrl(returnedUrl);
      onSuccess("OK");
      message.success("Tải ảnh lên thành công!");
    } catch (err) {
      console.error(err);
      onError(err);
      message.error("Lỗi khi tải ảnh lên!");
    } finally {
      setUploadingImage(false);
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const apiRoot = process.env.REACT_APP_API_URL
      ? process.env.REACT_APP_API_URL.replace('/api/v1/', '')
      : 'http://localhost:8080';
    return `${apiRoot}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const fetchQuestion = useCallback(async () => {
    if (!questionId || !isModalOpen) {
        setLoadingData(true);
        return;
    }
    setLoadingData(true);
    try {
      const response = await authAxios.get(`/admin/questions/${questionId}`);
      const data = response.data.data;

      // 1. Tìm loại câu hỏi và các đáp án đúng
      const qType = data.questionType || 'SINGLE_CHOICE';
      setQuestionType(qType);

      const correctIdxs = data.answers
        .map((ans, idx) => (ans.isCorrect ? idx : null))
        .filter((idx) => idx !== null);
      setCorrectAnswers(correctIdxs);

      // 2. Lưu đáp án gốc để lấy optionId sau này
      setOriginalAnswers(data.answers);
      setPreviewImgUrl(data.imageUrl || '');
      setImageType(data.imageUrl && data.imageUrl.startsWith('http') ? 'url' : 'upload');

      // 3. Đổ dữ liệu vào Form
      const formData = {
        content: data.content,
        difficulty: data.difficulty,
        imageUrl: data.imageUrl,
        questionType: qType,
        answer_0: data.answers[0]?.content,
        answer_1: data.answers[1]?.content,
        answer_2: data.answers[2]?.content,
        answer_3: data.answers[3]?.content,
      };

      form.setFieldsValue(formData);
    } catch (error) {
      console.error("Error:", error);
      message.error("Không thể tải thông tin câu hỏi!");
      onCancel(); // Đóng modal nếu tải thất bại
    } finally {
      setLoadingData(false);
    }
  }, [questionId, isModalOpen, form, onCancel]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const onFinish = async (values) => {
    if (correctAnswers.length === 0) {
      message.error("Vui lòng chọn ít nhất một đáp án đúng!");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Tái cấu trúc mảng answers, giữ nguyên optionId cũ
      const updatedAnswers = originalAnswers.map((ans, index) => ({
        optionId: ans.optionId, // Quan trọng: Giữ ID để backend update đúng record
        content: values[`answer_${index}`], // Lấy nội dung mới từ form
        isCorrect: correctAnswers.includes(index), // Cập nhật trạng thái đúng/sai
      }));

      // 2. Tạo payload
      const payload = {
        questionId: Number(questionId),
        content: values.content,
        difficulty: values.difficulty,
        imageUrl: values.imageUrl,
        questionType: values.questionType,
        answers: updatedAnswers,
      };

      await authAxios.patch(`/admin/questions/${questionId}`, payload);
      message.success("Cập nhật câu hỏi thành công!");
      onSuccess(); // Đóng modal và làm mới dữ liệu
    } catch (error) {
      console.error("Error:", error);
      message.error(
        error.response?.data?.message || "Cập nhật thất bại! Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <EditOutlined style={{ marginRight: 8 }} /> Cập nhật câu hỏi ID: {questionId}
        </Title>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>Hủy bỏ</Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={submitting}
          onClick={() => form.submit()}
        >
          Lưu thay đổi
        </Button>,
      ]}
      width={800}
      centered
      maskClosable={false}
    >
      <Divider style={{ margin: '16px 0' }} />
      {loadingData ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          {/* Nội dung & Hình ảnh */}
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nội dung câu hỏi"
                name="content"
                rules={[
                  { required: true, message: "Vui lòng nhập nội dung!" },
                ]}
              >
                <TextArea rows={3} placeholder="Nhập câu hỏi (hỗ trợ LaTeX)..." />
              </Form.Item>
              {content && (
                <div
                  style={{
                    ...previewBoxStyle,
                    marginTop: -12,
                    marginBottom: 16,
                    maxHeight: 120,
                    overflowY: 'auto'
                  }}
                >
                  <div style={previewLabelStyle}>Xem trước nội dung câu hỏi:</div>
                  <div dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
                </div>
              )}
            </Col>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 10 }}>
                <Text strong>Hình thức đính kèm ảnh: </Text>
                <Radio.Group value={imageType} onChange={(e) => {
                  setImageType(e.target.value);
                  form.setFieldsValue({ imageUrl: '' });
                  setPreviewImgUrl('');
                }} buttonStyle="solid" style={{ marginLeft: 10 }}>
                  <Radio.Button value="upload">Upload tệp</Radio.Button>
                  <Radio.Button value="url">Nhập Link ảnh</Radio.Button>
                </Radio.Group>
              </div>

              {imageType === 'upload' ? (
                <Form.Item label="Chọn tệp ảnh minh họa" extra="Chấp nhận tệp .png, .jpg, .jpeg">
                  <Upload
                    accept="image/*"
                    customRequest={handleUploadImage}
                    maxCount={1}
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />} loading={uploadingImage} type="dashed" style={{ width: '100%' }}>
                      {uploadingImage ? 'Đang tải lên...' : 'Chọn ảnh để upload'}
                    </Button>
                  </Upload>
                  <Form.Item name="imageUrl" noStyle>
                    <Input type="hidden" />
                  </Form.Item>
                </Form.Item>
              ) : (
                <Form.Item
                  label="Đường dẫn ảnh minh họa (tùy chọn)"
                  name="imageUrl"
                >
                  <Input
                    placeholder="Nhập URL ảnh (ví dụ: /avatars/q_123.png hoặc link internet)"
                    onChange={(e) => setPreviewImgUrl(e.target.value)}
                  />
                </Form.Item>
              )}
              {previewImgUrl && (
                <div style={{ marginTop: 10, textAlign: 'center' }}>
                  <img src={getFullImageUrl(previewImgUrl)} alt="Preview" style={{ maxHeight: 100, maxWidth: '100%', borderRadius: 6, border: '1px solid #d9d9d9' }} />
                </div>
              )}
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Loại câu hỏi"
                name="questionType"
                rules={[{ required: true }]}
              >
                <Select onChange={(val) => {
                  setQuestionType(val);
                  setCorrectAnswers([]);
                }}>
                  <Option value="SINGLE_CHOICE">Trắc nghiệm chọn một</Option>
                  <Option value="MULTIPLE_CHOICE">Trắc nghiệm chọn nhiều</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Mức độ"
                name="difficulty"
                rules={[{ required: true, message: "Chọn mức độ!" }]}
              >
                <Select>
                  <Option value="EASY">Dễ</Option>
                  <Option value="MEDIUM">Trung bình</Option>
                  <Option value="HARD">Khó</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">
            <CheckCircleOutlined /> Chỉnh sửa đáp án
          </Divider>

          <Alert
            message={
              questionType === 'SINGLE_CHOICE'
                ? "Chọn một đáp án đúng bằng nút Radio."
                : "Chọn một hoặc nhiều đáp án đúng bằng nút Checkbox."
            }
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
          />

          {/* Danh sách đáp án */}
          {questionType === 'SINGLE_CHOICE' ? (
            <Radio.Group
              value={correctAnswers[0]}
              onChange={(e) => setCorrectAnswers([e.target.value])}
              style={{ width: "100%" }}
            >
              {[0, 1, 2, 3].map((index) => (
                <div key={index} style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
                  <Radio value={index} style={{ marginRight: 12, marginTop: 6 }}>
                    <Text strong style={{ color: correctAnswers.includes(index) ? "#52c41a" : "inherit" }}>
                      Đáp án {String.fromCharCode(65 + index)} {correctAnswers.includes(index) && "(Đúng)"}
                    </Text>
                  </Radio>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Form.Item
                    name={`answer_${index}`}
                    rules={[{ required: true, message: "Không được để trống!" }]}
                    style={{ margin: 0 }}
                  >
                    <TextArea
                      placeholder={`Nhập đáp án ${String.fromCharCode(65 + index)} (hỗ trợ LaTeX và Markdown, Enter để xuống dòng)`}
                      autoSize={{ minRows: 1, maxRows: 5 }}
                      style={{
                        borderColor: correctAnswers.includes(index) ? "#52c41a" : undefined,
                        backgroundColor: correctAnswers.includes(index) ? "#f6ffed" : undefined,
                      }}
                    />
                  </Form.Item>
                  {(() => {
                    const ansVal = index === 0 ? answer_0 : index === 1 ? answer_1 : index === 2 ? answer_2 : answer_3;
                    if (!ansVal) return null;
                    return (
                      <div
                        style={answerPreviewBoxStyle}
                      >
                        <span style={answerPreviewLabelStyle}>Xem trước {String.fromCharCode(65 + index)}:</span>
                        <span dangerouslySetInnerHTML={{ __html: parseMarkdown(ansVal) }} />
                      </div>
                    );
                  })()}
                </div>
              </div>
              ))}
            </Radio.Group>
          ) : (
            <div style={{ width: "100%" }}>
              {[0, 1, 2, 3].map((index) => {
                const isChecked = correctAnswers.includes(index);
                return (
                  <div key={index} style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
                    <div style={{ marginRight: 12, width: 120, paddingTop: 6 }}>
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCorrectAnswers([...correctAnswers, index]);
                          } else {
                            setCorrectAnswers(correctAnswers.filter((item) => item !== index));
                          }
                        }}
                      >
                        <Text strong style={{ color: isChecked ? "#52c41a" : "inherit" }}>
                          Đáp án {String.fromCharCode(65 + index)} {isChecked && "(Đúng)"}
                        </Text>
                      </Checkbox>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Form.Item
                        name={`answer_${index}`}
                        rules={[{ required: true, message: "Không được để trống!" }]}
                        style={{ margin: 0 }}
                      >
                        <TextArea
                          placeholder={`Nhập đáp án ${String.fromCharCode(65 + index)} (hỗ trợ LaTeX và Markdown, Enter để xuống dòng)`}
                          autoSize={{ minRows: 1, maxRows: 5 }}
                          style={{
                            borderColor: isChecked ? "#52c41a" : undefined,
                            backgroundColor: isChecked ? "#f6ffed" : undefined,
                          }}
                        />
                      </Form.Item>
                      {(() => {
                        const ansVal = index === 0 ? answer_0 : index === 1 ? answer_1 : index === 2 ? answer_2 : answer_3;
                        if (!ansVal) return null;
                        return (
                          <div
                            style={answerPreviewBoxStyle}
                          >
                            <span style={answerPreviewLabelStyle}>Xem trước {String.fromCharCode(65 + index)}:</span>
                            <span dangerouslySetInnerHTML={{ __html: parseMarkdown(ansVal) }} />
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Form>
      )}
    </Modal>
  );
};

export default UpdateQuestionModal;