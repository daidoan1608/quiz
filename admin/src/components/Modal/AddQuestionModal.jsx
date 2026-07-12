import React, { useState, useEffect, useCallback } from 'react';
import { authAxios } from '../../api/axiosConfig';
import {
  Form, Input, Button, Select,
  Radio, Checkbox, message, Typography, Divider,
  Row, Col, Alert, Modal, Upload, theme
} from 'antd';
import {
  SaveOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { parseMarkdown } from '../../utils/parseMarkdown';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AddQuestionModal = ({ isModalOpen, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const { token } = theme.useToken();

  // State data
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  // State loading & UI
  const [loading, setLoading] = useState(false);
  const [questionType, setQuestionType] = useState('SINGLE_CHOICE');
  const [correctAnswers, setCorrectAnswers] = useState([]); // Lưu các index đáp án đúng
  const [previewImgUrl, setPreviewImgUrl] = useState('');

  const [imageType, setImageType] = useState('upload'); // 'upload' | 'url'
  const [uploadingImage, setUploadingImage] = useState(false);

  const content = Form.useWatch("content", form);
  const answerA = Form.useWatch("answerA", form);
  const answerB = Form.useWatch("answerB", form);
  const answerC = Form.useWatch("answerC", form);
  const answerD = Form.useWatch("answerD", form);

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
  }, [content, answerA, answerB, answerC, answerD]);

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

  // 1. Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await authAxios.get("/public/categories");
      const data = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      setCategories(Array.isArray(data[0]) ? data[0] : data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    if (isModalOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [isModalOpen, categories.length, fetchCategories]);

  // 2. Xử lý khi chọn Khoa -> Fetch Môn theo Khoa
  const handleCategoryChange = async (categoryId) => {
    form.setFieldsValue({ subjectId: null, chapterId: null });
    setSubjects([]);
    setChapters([]);

    if (!categoryId) return;

    try {
      // API /public/categories chỉ trả summary, không kèm subjects.
      // Cần gọi riêng API lấy môn học theo khoa.
      const response = await authAxios.get(`/public/subjects/category/${categoryId}`);
      const subjectData = Array.isArray(response.data.data) ? response.data.data : [];
      setSubjects(subjectData);

      if (subjectData.length === 0) {
        message.warning("Khoa này chưa có môn học nào!");
      }
    } catch (error) {
      console.error("Lỗi fetch môn học:", error);
      message.error("Không thể tải danh sách môn học theo khoa.");
    }
  };

  // 3. Xử lý khi chọn Môn -> Fetch Chương
  const handleSubjectChange = async (subjectId) => {
    form.setFieldsValue({ chapterId: null });
    setChapters([]);

    if (!subjectId) return;

    try {
      const response = await authAxios.get(`/public/chapters/subject/${subjectId}`);
      const chapterData = Array.isArray(response.data.data) ? response.data.data : [];
      setChapters(chapterData);

      if (chapterData.length === 0) {
        message.warning("Môn học này chưa có chương nào!");
      }
    } catch (error) {
      console.error("Lỗi fetch chương:", error);
      message.error("Không thể tải danh sách chương.");
    }
  };

  // 4. Xử lý Submit Form
  const onFinish = async (values) => {
    if (correctAnswers.length === 0) {
      message.error("Vui lòng chọn ít nhất một đáp án đúng!");
      return;
    }

    setLoading(true);
    try {
      const formattedAnswers = [
        { content: values.answerA, isCorrect: correctAnswers.includes(0) },
        { content: values.answerB, isCorrect: correctAnswers.includes(1) },
        { content: values.answerC, isCorrect: correctAnswers.includes(2) },
        { content: values.answerD, isCorrect: correctAnswers.includes(3) },
      ];

      const newQuestion = {
        content: values.content,
        difficulty: values.difficulty,
        subjectId: values.subjectId,
        chapterId: values.chapterId,
        imageUrl: values.imageUrl,
        questionType: values.questionType,
        answers: formattedAnswers,
      };

      await authAxios.post("/admin/questions", newQuestion);
      message.success("Thêm câu hỏi thành công!");

      form.resetFields();
      setCorrectAnswers([]);
      setPreviewImgUrl('');
      setQuestionType('SINGLE_CHOICE');
      setSubjects([]);
      setChapters([]);
      onSuccess();

    } catch (error) {
      console.error("Error adding question:", error);
      message.error(
        error.response?.data?.message || "Thêm câu hỏi thất bại! Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
      form.resetFields();
      setCorrectAnswers([]);
      setPreviewImgUrl('');
      setQuestionType('SINGLE_CHOICE');
      setSubjects([]);
      setChapters([]);
      onCancel();
  }

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <QuestionCircleOutlined style={{ marginRight: 8 }} /> Thêm Câu Hỏi Mới
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
          loading={loading}
          onClick={() => form.submit()}
          size="large"
        >
          Lưu Câu Hỏi
        </Button>,
      ]}
      width={900}
      centered
      maskClosable={false}
    >
      <Divider style={{ margin: '16px 0' }} />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        size="large"
        initialValues={{ difficulty: 'MEDIUM', questionType: 'SINGLE_CHOICE' }}
      >
        {/* KHỐI 1: PHÂN LOẠI */}
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
                {categories.map(cat => (
                  <Option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Chọn Môn"
              name="subjectId"
              rules={[{ required: true, message: "Vui lòng chọn môn!" }]}
            >
              <Select
                placeholder={subjects.length === 0 ? "Vui lòng chọn khoa trước" : "-- Chọn môn --"}
                onChange={handleSubjectChange}
                disabled={subjects.length === 0}
                showSearch
                optionFilterProp="children"
              >
                {subjects.map(sub => (
                  <Option key={sub.subjectId} value={sub.subjectId}>{sub.name}</Option>
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
                placeholder={chapters.length === 0 ? "Vui lòng chọn môn trước" : "-- Chọn chương --"}
                disabled={chapters.length === 0}
                showSearch
                optionFilterProp="children"
              >
                {chapters.map(chap => (
                  <Option key={chap.chapterId} value={chap.chapterId}>{chap.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Nội dung câu hỏi"
              name="content"
              rules={[{ required: true, message: "Nhập nội dung câu hỏi!" }]}
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
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="EASY">Dễ</Option>
                <Option value="MEDIUM">Trung bình</Option>
                <Option value="HARD">Khó</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left"><CheckCircleOutlined /> Thiết lập đáp án</Divider>

        <Alert
          message={
            questionType === 'SINGLE_CHOICE'
              ? "Nhập 4 đáp án và tích chọn vào ô tròn cạnh đáp án đúng."
              : "Nhập 4 đáp án và tích chọn các ô vuông cạnh các đáp án đúng."
          }
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />

        {/* KHỐI 2: ĐÁP ÁN */}
        {questionType === 'SINGLE_CHOICE' ? (
          <Radio.Group
            onChange={(e) => setCorrectAnswers([e.target.value])}
            value={correctAnswers[0]}
            style={{ width: '100%' }}
          >
            {['A', 'B', 'C', 'D'].map((label, index) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}>
                <Radio value={index} style={{ marginRight: 16, marginTop: 6 }}>
                  <Text strong style={{ color: correctAnswers.includes(index) ? '#52c41a' : 'inherit' }}>
                    Đáp án {label} {correctAnswers.includes(index) && "(Đúng)"}
                  </Text>
                </Radio>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Form.Item
                    name={`answer${label}`}
                    rules={[{ required: true, message: `Nhập đáp án ${label}!` }]}
                    style={{ margin: 0 }}
                  >
                    <TextArea
                      placeholder={`Nội dung đáp án ${label} (hỗ trợ LaTeX và Markdown, Enter để xuống dòng)`}
                      autoSize={{ minRows: 1, maxRows: 5 }}
                      style={{
                        borderColor: correctAnswers.includes(index) ? '#52c41a' : undefined,
                        backgroundColor: correctAnswers.includes(index) ? '#f6ffed' : undefined
                      }}
                    />
                  </Form.Item>
                  {(() => {
                    const ansVal = label === 'A' ? answerA : label === 'B' ? answerB : label === 'C' ? answerC : answerD;
                    if (!ansVal) return null;
                    return (
                      <div
                        style={answerPreviewBoxStyle}
                      >
                        <span style={answerPreviewLabelStyle}>Xem trước {label}:</span>
                        <span dangerouslySetInnerHTML={{ __html: parseMarkdown(ansVal) }} />
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </Radio.Group>
        ) : (
          <div style={{ width: '100%' }}>
            {['A', 'B', 'C', 'D'].map((label, index) => {
              const isChecked = correctAnswers.includes(index);
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ marginRight: 16, width: 120, paddingTop: 6 }}>
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCorrectAnswers([...correctAnswers, index]);
                        } else {
                          setCorrectAnswers(correctAnswers.filter(item => item !== index));
                        }
                      }}
                    >
                      <Text strong style={{ color: isChecked ? '#52c41a' : 'inherit' }}>
                        Đáp án {label} {isChecked && "(Đúng)"}
                      </Text>
                    </Checkbox>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Form.Item
                      name={`answer${label}`}
                      rules={[{ required: true, message: `Nhập đáp án ${label}!` }]}
                      style={{ margin: 0 }}
                    >
                      <TextArea
                        placeholder={`Nội dung đáp án ${label} (hỗ trợ LaTeX và Markdown, Enter để xuống dòng)`}
                        autoSize={{ minRows: 1, maxRows: 5 }}
                        style={{
                          borderColor: isChecked ? '#52c41a' : undefined,
                          backgroundColor: isChecked ? '#f6ffed' : undefined
                        }}
                      />
                    </Form.Item>
                    {(() => {
                      const ansVal = label === 'A' ? answerA : label === 'B' ? answerB : label === 'C' ? answerC : answerD;
                      if (!ansVal) return null;
                      return (
                        <div
                          style={answerPreviewBoxStyle}
                        >
                          <span style={answerPreviewLabelStyle}>Xem trước {label}:</span>
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
    </Modal>
  );
};

export default AddQuestionModal;