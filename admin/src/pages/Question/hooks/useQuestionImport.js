import { useCallback, useEffect, useState } from "react";
import { Form, message, notification } from "antd";
import {
  authAxios,
  getApiErrorMessage,
  publicAxios,
} from "../../../api/axiosConfig";
import { normalizeApiListResponse } from "../../../utils/apiResponseData";

export const useQuestionImport = ({ isModalOpen, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewResult, setPreviewResult] = useState(null);
  const [isChaptersEmpty, setIsChaptersEmpty] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await publicAxios.get("/public/categories");
      setCategories(normalizeApiListResponse(response));
    } catch (error) {
      message.error("Không thể tải danh sách khoa.");
    }
  }, []);

  useEffect(() => {
    if (isModalOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories, isModalOpen]);

  const handleCategoryChange = (categoryId) => {
    form.setFieldsValue({ subjectId: null, chapterId: null });
    setSubjects([]);
    setChapters([]);
    setIsChaptersEmpty(false);

    const category = categories.find((item) => item.categoryId === categoryId);
    if (category?.subjects) {
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
      setIsChaptersEmpty(true);
      message.error("Không thể lấy danh sách chương.");
    }
  };

  const buildImportFormData = (values) => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("categoryId", values.categoryId);
    formData.append("subjectId", values.subjectId);
    formData.append("chapterId", values.chapterId);
    return formData;
  };

  const handlePreview = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedFile) {
        message.error("Vui lòng chọn file để kiểm tra!");
        return;
      }

      setPreviewLoading(true);
      const response = await authAxios.post(
        "admin/questions/import/preview",
        buildImportFormData(values),
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const result = response.data?.data || response.data;
      setPreviewResult(result);

      if (result?.invalidRows > 0) {
        message.warning("File còn lỗi, vui lòng kiểm tra danh sách bên dưới.");
      } else {
        message.success("File hợp lệ, có thể import.");
      }
    } catch (error) {
      notification.error({
        message: "Kiểm tra file thất bại",
        description: getApiErrorMessage(
          error,
          "Không thể đọc file hoặc thông tin phân loại chưa hợp lệ."
        ),
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleUpload = async (values) => {
    if (!selectedFile) {
      message.error("Vui lòng chọn file để upload!");
      return;
    }

    if (isChaptersEmpty || chapters.length === 0) {
      message.error("Không thể upload vì môn học/chương chưa khả dụng!");
      return;
    }

    setLoading(true);

    try {
      const response = await authAxios.post(
        "admin/questions/import",
        buildImportFormData(values),
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200) {
        message.success("Import dữ liệu câu hỏi thành công!");
        form.resetFields();
        setSelectedFile(null);
        setPreviewResult(null);
        setSubjects([]);
        setChapters([]);
        onSuccess();
      } else {
        notification.error({
          message: "Không thể import file",
          description:
            response.data?.message ||
            "Có lỗi xảy ra trong quá trình xử lý file.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Upload thất bại",
        description: getApiErrorMessage(
          error,
          "Lỗi kết nối hoặc định dạng file không đúng."
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedFile(null);
    setPreviewResult(null);
    setSubjects([]);
    setChapters([]);
    onCancel();
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    accept: ".xlsx,.xls,.csv,.zip",
    fileList: selectedFile ? [selectedFile] : [],
    beforeUpload: (file) => {
      setSelectedFile(file);
      setPreviewResult(null);
      return false;
    },
    onRemove: () => {
      setSelectedFile(null);
      setPreviewResult(null);
      return true;
    },
  };

  return {
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
  };
};
