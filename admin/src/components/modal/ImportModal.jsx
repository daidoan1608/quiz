import React, { useEffect, useState, useCallback } from 'react';
import { authAxios, publicAxios } from "../../api/axiosConfig"; // Giữ lại publicAxios
import {
  Form, Select, Button, Modal,
  Typography, message, Divider,
  Upload, Row, Col, notification, Alert, Space
} from "antd";
import {
  CloudUploadOutlined,
  DownloadOutlined,
  ImportOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

const ImportModal = ({ isModalOpen, onCancel, onSuccess }) => {
  const [form] = Form.useForm();

  // State data
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // Lưu file đã chọn

  // State UI
  const [isChaptersEmpty, setIsChaptersEmpty] = useState(false);

  // --- 1. FETCH DỮ LIỆU ---
  const fetchCategories = useCallback(async () => {
    try {
      const response = await publicAxios.get("/public/categories");
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : [response.data.data];
      setCategories(Array.isArray(data[0]) ? data[0] : data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khoa:", error);
    }
  }, []);

  // Fetch categories khi Modal mở
  useEffect(() => {
    if (isModalOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [isModalOpen, categories.length, fetchCategories]);


  // Fetch subjects & chapters logic
  const handleCategoryChange = (categoryId) => {
    form.setFieldsValue({ subjectId: null, chapterId: null });
    setSubjects([]);
    setChapters([]);
    setIsChaptersEmpty(false);

    const category = categories.find((cat) => cat.categoryId === categoryId);
    if (category && category.subjects) {
      setSubjects(category.subjects);
    }
  };

  const handleSubjectChange = async (subjectId) => {
    form.setFieldsValue({ chapterId: null });
    setChapters([]);
    setIsChaptersEmpty(false);

    if (!subjectId) return;

    try {
      const response = await authAxios.get(
        `/public/chapters/subject/${subjectId}`
      );
      const data = response.data.data || [];

      if (data.length > 0) {
        setChapters(data);
      } else {
        setIsChaptersEmpty(true);
        message.warning("Môn học này chưa có chương nào.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chương:", error);
      setIsChaptersEmpty(true);
    }
  };

  // --- 2. XỬ LÝ UPLOAD ---
  const handleUpload = async (values) => {
    if (!selectedFile) {
      message.error("Vui lòng chọn file để upload!");
      return;
    }

    if (isChaptersEmpty || chapters.length === 0) {
        message.error("Không thể upload vì môn học/chương chưa khả dụng!");
        return;
    }

    // Đảm bảo Form Antd đã validate (vì nó là onFinish)

    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("categoryId", values.categoryId);
    formData.append("subjectId", values.subjectId);
    formData.append("chapterId", values.chapterId);

    try {
      const response = await authAxios.post(
        "admin/questions/import",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        message.success("Import dữ liệu câu hỏi thành công!");
        // Reset form và state
        form.resetFields();
        setSelectedFile(null);
        setSubjects([]);
        setChapters([]);
        onSuccess(); // Đóng modal và làm mới dữ liệu
      } else {
        notification.error({
          message: "Lỗi Upload",
          description:
            response.data?.message ||
            "Có lỗi xảy ra trong quá trình xử lý file.",
        });
      }
    } catch (error) {
      console.error("Lỗi khi upload file:", error);
      notification.error({
        message: "Upload thất bại",
        description:
          error.response?.data?.message ||
          "Lỗi kết nối hoặc định dạng file không đúng.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
      form.resetFields();
      setSelectedFile(null);
      setSubjects([]);
      setChapters([]);
      onCancel();
  };

  // Cấu hình Dragger Upload
  const uploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    accept: ".xlsx,.xls,.csv",
    fileList: selectedFile ? [selectedFile] : [], // Kiểm soát file list thủ công
    beforeUpload: (file) => {
      setSelectedFile(file);
      return false;
    },
    onRemove: () => {
      setSelectedFile(null);
      return true;
    },
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <ImportOutlined style={{ marginRight: 8 }} /> Import Câu Hỏi
        </Title>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null} // Tùy chỉnh footer trong Form
      width={700}
      centered
      maskClosable={false}
    >
      <Alert
        type="info"
        message="Chức năng này dùng để nhập dữ liệu câu hỏi hàng loạt từ file Excel/CSV. Vui lòng đảm bảo file theo đúng định dạng mẫu."
        action={
          <Button type="link" icon={<DownloadOutlined />}>
            Tải file mẫu
          </Button>
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
              Hỗ trợ file *.xlsx, *.xls, *.csv (chỉ 1 file duy nhất)
            </p>
          </Dragger>
        </Form.Item>

        {/* Upload Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 30,
          }}
        >
          <Button
            type="primary"
            htmlType="submit"
            icon={<ImportOutlined />}
            loading={loading}
            size="large"
            disabled={isChaptersEmpty && chapters.length === 0}
          >
            Bắt đầu Upload
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ImportModal;