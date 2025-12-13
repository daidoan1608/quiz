import React, { useEffect, useState, useCallback } from "react";
import {
  Form, Input, Button, Modal, Select, InputNumber,
  message, Typography, Divider, Space, Row, Col,
  Radio, Statistic, Alert,
} from "antd";
import {
  SaveOutlined, FileAddOutlined, ControlOutlined,
} from "@ant-design/icons";
import { authAxios } from "../../api/axiosConfig"; // Điều chỉnh đường dẫn nếu cần

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Định nghĩa component AddExamModal
const AddExamModal = ({ isModalOpen, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const userId = localStorage.getItem("userId");

  // --- STATES ---
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Quản lý giới hạn câu hỏi (Max)
  const [maxQuestions, setMaxQuestions] = useState({
    totalQuestion: 0,
    totalEasy: 0,
    totalMedium: 0,
    totalHard: 0,
    totalQuestionByChapter: {},
  });

  // Chế độ sinh câu hỏi: 'total' | 'difficulty' | 'chapter'
  const [generationMode, setGenerationMode] = useState("total");

  // State lưu số lượng câu hỏi người dùng chọn
  const [inputTotal, setInputTotal] = useState(0);
  const [inputDiff, setInputDiff] = useState({ easy: 0, medium: 0, hard: 0 });
  const [inputChapters, setInputChapters] = useState([]); // Array object chapters

  // --- FETCH DATA ---

  const fetchCategories = async () => {
    try {
      const response = await authAxios.get("/public/categories");
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : [response.data.data];
      setCategories(Array.isArray(data[0]) ? data[0] : data);
    } catch (error) {
      console.error("Lỗi danh mục:", error);
    }
  };

  const fetchQuestionLimits = async (subjectId) => {
    try {
      const res = await authAxios.get(
        `/admin/questions/total-questions/${subjectId}`
      );
      const limitData = res.data.data;
      setMaxQuestions(limitData);

      // Chuẩn bị dữ liệu cho phần chọn theo chương
      const chaptersArr = Object.entries(
        limitData.totalQuestionByChapter || {}
      ).map(([id, data]) => ({
        chapterId: id,
        chapterName: data.chapterName,
        maxTotal: data.totalQuestions,
        selected: 0, // Reset số câu hỏi được chọn
      }));
      setInputChapters(chaptersArr);
    } catch (error) {
      console.error("Lỗi limit:", error);
      message.error("Không thể lấy thông tin số lượng câu hỏi!");
      setMaxQuestions({});
      setInputChapters([]);
    }
  };

  // Tải danh mục khi modal mở lần đầu
  useEffect(() => {
    if (isModalOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [isModalOpen, categories.length]);

  // Tải limit câu hỏi khi SubjectId thay đổi
  useEffect(() => {
    if (selectedSubject) {
        fetchQuestionLimits(selectedSubject);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);


  // --- HANDLERS ---

  const handleCategoryChange = (val) => {
    form.setFieldsValue({ subjectId: null }); // Reset môn học
    setSelectedSubject(null);
    setMaxQuestions({}); // Reset limit
    setInputTotal(0); // Reset input

    const cat = categories.find((c) => c.categoryId === val);
    setSubjects(cat ? cat.subjects : []);
  };

  const handleSubjectChange = (val) => {
    setSelectedSubject(val);
    // Reset các input chọn câu hỏi khi đổi môn
    setInputTotal(0);
    setInputDiff({ easy: 0, medium: 0, hard: 0 });
  };

  // Tính tổng số câu đang chọn (để hiển thị)
  const calculateTotalSelected = useCallback(() => {
    if (generationMode === "total") return inputTotal;
    if (generationMode === "difficulty")
      return inputDiff.easy + inputDiff.medium + inputDiff.hard;
    if (generationMode === "chapter")
      return inputChapters.reduce((acc, curr) => acc + curr.selected, 0);
    return 0;
  }, [generationMode, inputTotal, inputDiff, inputChapters]);

  // Xử lý Submit
  const onFinish = async (values) => {
    const totalSelected = calculateTotalSelected();

    if (totalSelected <= 0) {
      message.error("Vui lòng chọn ít nhất 1 câu hỏi!");
      return;
    }

    setLoading(true);
    try {
      const examDto = {
        subjectId: values.subjectId,
        title: values.title,
        description: values.description,
        duration: values.duration,
        createdBy: userId,
      };

      // Chuẩn bị payload dựa trên mode
      const payload = {
        examDto,
        totalQuestions: generationMode === "total" ? inputTotal : null,
        easyQuestions: generationMode === "difficulty" ? inputDiff.easy : 0,
        mediumQuestions: generationMode === "difficulty" ? inputDiff.medium : 0,
        hardQuestions: generationMode === "difficulty" ? inputDiff.hard : 0,
        totalQuestionByChapter:
          generationMode === "chapter"
            ? inputChapters.reduce((acc, curr) => {
                if (curr.selected > 0) acc[curr.chapterId] = curr.selected;
                return acc;
              }, {})
            : {},
      };

      await authAxios.post("/admin/exams", payload);
      message.success("Thêm bài thi thành công!");

      // Reset form và đóng modal
      form.resetFields();
      setInputTotal(0);
      setInputDiff({ easy: 0, medium: 0, hard: 0 });
      setInputChapters([]);
      setSelectedSubject(null);
      setMaxQuestions({});
      onSuccess();

    } catch (error) {
      console.error("Lỗi submit:", error);
      message.error("Không thể thêm bài thi. Vui lòng kiểm tra lại!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đóng Modal
  const handleCancel = () => {
    form.resetFields();
    setInputTotal(0);
    setInputDiff({ easy: 0, medium: 0, hard: 0 });
    setInputChapters([]);
    setSelectedSubject(null);
    setMaxQuestions({});
    onCancel();
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <FileAddOutlined style={{ marginRight: 8 }} /> Tạo Đề Thi Mới
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
          Tạo Đề Thi
        </Button>,
      ]}
      width={900}
      centered
    >
      <Divider style={{ margin: '16px 0' }} />
      <Form form={form} layout="vertical" onFinish={onFinish} size="large">
        {/* 1. THÔNG TIN CƠ BẢN */}
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Chọn Khoa"
              name="categoryId"
              rules={[{ required: true, message: "Chọn khoa!" }]}
            >
              <Select
                placeholder="-- Chọn khoa --"
                onChange={handleCategoryChange}
                showSearch
                optionFilterProp="children"
              >
                {categories.map((c) => (
                  <Option key={c.categoryId} value={c.categoryId}>
                    {c.categoryName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Chọn Môn Học"
              name="subjectId"
              rules={[{ required: true, message: "Chọn môn!" }]}
            >
              <Select
                placeholder="-- Chọn môn --"
                onChange={handleSubjectChange}
                disabled={subjects.length === 0}
                showSearch
                optionFilterProp="children"
              >
                {subjects.map((s) => (
                  <Option key={s.subjectId} value={s.subjectId}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Tên bài thi"
          name="title"
          rules={[{ required: true, message: "Nhập tên bài thi!" }]}
        >
          <Input placeholder="Ví dụ: Thi cuối kỳ Java - Đề 1" />
        </Form.Item>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Thời gian làm bài (phút)"
              name="duration"
              rules={[{ required: true, message: "Nhập thời gian!" }]}
            >
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                placeholder="Ví dụ: 60"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Mô tả" name="description">
              <TextArea rows={1} placeholder="Ghi chú thêm..." />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">
          <ControlOutlined /> Cấu hình câu hỏi
        </Divider>

        {/* 2. CẤU HÌNH CÂU HỎI */}
        {!selectedSubject ? (
    <Alert
        message="Vui lòng chọn Môn học để xem số lượng câu hỏi khả dụng."
        type="info"
        showIcon
    />
) : (
    <>
        {/* Điều chỉnh layout cho Radio Group */}
        <Row align="middle"
            justify="space-between"
            style={{ marginBottom: 16}}>
            <Col>
                <Text strong>Phương thức tạo đề</Text>
            </Col>
            <Col>
                <Radio.Group
                    value={generationMode}
                    onChange={(e) => setGenerationMode(e.target.value)}
                    buttonStyle="solid"
                >
                    <Radio.Button value="total">Ngẫu nhiên tổng hợp</Radio.Button>
                    <Radio.Button value="difficulty">Theo độ khó</Radio.Button>
                    <Radio.Button value="chapter">Theo chương</Radio.Button>
                </Radio.Group>
            </Col>
        </Row>

        <div>
            {/* MODE 1: TOTAL */}
            {generationMode === "total" && (
                <Row gutter={16} align="middle">
                    <Col span={10}>
                        <Text>Số câu hỏi ngẫu nhiên</Text>
                    </Col>
                    <Col span={14}>
                        <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            max={maxQuestions.totalQuestion}
                            value={inputTotal}
                            onChange={setInputTotal}
                            addonAfter={`/ ${
                                maxQuestions.totalQuestion || 0
                            } có sẵn`}
                        />
                    </Col>
                </Row>
            )}

            {/* MODE 2: DIFFICULTY - Giữ nguyên vì đã khá ổn với Space/Row */}
            {generationMode === "difficulty" && (
                <Space direction="vertical" style={{ width: "100%" }}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <div style={{ marginBottom: 5 }}>
                                Dễ (Max: {maxQuestions.totalEasy})
                            </div>
                            <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                max={maxQuestions.totalEasy}
                                value={inputDiff.easy}
                                onChange={(v) =>
                                    setInputDiff({ ...inputDiff, easy: v })
                                }
                            />
                        </Col>
                        <Col span={8}>
                            <div style={{ marginBottom: 5 }}>
                                Trung bình (Max: {maxQuestions.totalMedium})
                            </div>
                            <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                max={maxQuestions.totalMedium}
                                value={inputDiff.medium}
                                onChange={(v) =>
                                    setInputDiff({ ...inputDiff, medium: v })
                                }
                            />
                        </Col>
                        <Col span={8}>
                            <div style={{ marginBottom: 5 }}>
                                Khó (Max: {maxQuestions.totalHard})
                            </div>
                            <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                max={maxQuestions.totalHard}
                                value={inputDiff.hard}
                                onChange={(v) =>
                                    setInputDiff({ ...inputDiff, hard: v })
                                }
                            />
                        </Col>
                    </Row>
                </Space>
            )}

            {/* MODE 3: CHAPTERS - Thêm gutter */}
            {generationMode === "chapter" && (
                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                    {inputChapters.map((chap, idx) => (
                        <Row
                            key={chap.chapterId}
                            style={{ marginBottom: 12 }}
                            gutter={16}
                            align="middle"
                        >
                            <Col span={14}>
                                <Text>{chap.chapterName}</Text>
                            </Col>
                            <Col span={10}>
                                <InputNumber
                                    style={{ width: "100%" }}
                                    min={0}
                                    max={chap.maxTotal}
                                    value={chap.selected}
                                    onChange={(val) => {
                                        const newArr = [...inputChapters];
                                        newArr[idx].selected = val;
                                        setInputChapters(newArr);
                                    }}
                                    addonAfter={`/ ${chap.maxTotal}`}
                                />
                            </Col>
                        </Row>
                    ))}
                    {inputChapters.length === 0 && (
                        <Text type="secondary">Môn này chưa có chương nào.</Text>
                    )}
                </div>
            )}

            <Divider style={{ margin: "16px 0" }} />

            <Row justify="end" align="middle">
                <Text style={{ marginRight: 16 }}>
                    Tổng số câu hỏi sẽ tạo:
                </Text>
                <Statistic
                    value={calculateTotalSelected()}
                />
            </Row>
        </div>
    </>
)}
      </Form>
    </Modal>
  );
};

export default AddExamModal;