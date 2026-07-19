import { useEffect, useState } from "react";
import { Form, message } from "antd";
import { getApiErrorMessage } from "../../../api/axiosConfig";
import { documentApi } from "../../../api/services/documentApi";

export const useDocumentsManager = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [form] = Form.useForm();

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await documentApi.getAll();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể tải danh sách tài liệu"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const openCreateModal = () => {
    setEditing(null);
    setSelectedFile(null);
    form.resetFields();
    form.setFieldsValue({ active: true });
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditing(record);
    setSelectedFile(null);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      active: record.active,
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const saveDocument = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await documentApi.update(editing.id, values);
        message.success("Đã cập nhật tài liệu");
      } else {
        if (!selectedFile) {
          message.error("Vui lòng chọn file tài liệu");
          return;
        }
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description || "");
        formData.append("active", values.active ?? true);
        formData.append("file", selectedFile);
        await documentApi.create(formData);
        message.success("Đã tải tài liệu lên");
      }
      setModalOpen(false);
      loadDocuments();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể lưu tài liệu"));
    } finally {
      setSaving(false);
    }
  };

  const deleteDocument = async (id) => {
    try {
      await documentApi.delete(id);
      message.success("Đã xóa tài liệu");
      loadDocuments();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể xóa tài liệu"));
    }
  };

  const updateDocumentStatus = async (id, active) => {
    try {
      await documentApi.update(id, { active });
      loadDocuments();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể cập nhật trạng thái"));
    }
  };

  return {
    documents,
    loading,
    saving,
    modalOpen,
    editing,
    form,
    loadDocuments,
    openCreateModal,
    openEditModal,
    closeModal,
    saveDocument,
    deleteDocument,
    updateDocumentStatus,
    setSelectedFile,
  };
};
