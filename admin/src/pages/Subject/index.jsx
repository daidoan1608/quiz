// src/pages/Subjects/SubjectManager.js
import React, { useMemo, useState, useEffect } from "react";
import {
  Button,
  Typography,
  Space,
  Tooltip,
  Popconfirm,
  Input,
  Table,
  message
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ReadOutlined,
  UnorderedListOutlined,
  SearchOutlined,
} from "@ant-design/icons";

// --- IMPORT LAYOUT CHUNG ---
import ManagementPageLayout from '../../layouts/ManagementPageLayout';

// --- IMPORT API VÀ MODAL ---
import { authAxios } from "../../api/axiosConfig";
import AddSubjectModal from "../../components/modal/AddSubjectModal";
import UpdateSubjectModal from "../../components/modal/UpdateSubjectModal";
import ChapterListModal from "../../components/modal/ChapterListModal";

const { Text } = Typography;

const currentUserRole = localStorage.getItem("role");
const isAdmin = currentUserRole === "ADMIN";

export default function SubjectManager() {
  const [searchText, setSearchText] = useState("");

  // --- STATES DỮ LIỆU & LOADING ---
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- STATES QUẢN LÝ MODAL ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [subjectIdToUpdate, setSubjectIdToUpdate] = useState(null);
  const [isChapterListModalOpen, setIsChapterListModalOpen] = useState(false);
  const [selectedSubjectIdForChapters, setSelectedSubjectIdForChapters] = useState(null);
  const [selectedSubjectNameForChapters, setSelectedSubjectNameForChapters] = useState(null);


  // --- 1. LOGIC LẤY DỮ LIỆU (Tương đương refreshData) ---
  const fetchSubjects = async () => {
    if (!isAdmin) {
        // Môn học là public, không cần check quyền, chỉ cần check quyền khi chỉnh sửa/xoá.
    }
    setLoading(true);
    try {
      const response = await authAxios.get("public/subjects");
      // Giả định data trả về là response.data.data hoặc response.data
      setSubjects(response.data.data || response.data);
    } catch (error) {
      console.error("Lỗi API:", error);
      message.error("Không thể tải danh sách môn học.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // --- 2. LOGIC XỬ LÝ DELETE ---
  const handleDelete = async (id) => {
    if (!isAdmin) {
      message.warning("Bạn không có quyền xóa môn học này.");
      return;
    }
    try {
      await authAxios.delete(`/admin/subjects/${id}`);
      message.success("Xóa môn học thành công!");
      // Cập nhật state trực tiếp sau khi xoá
      setSubjects(prev => prev.filter(item => item.subjectId !== id));
    } catch (error) {
      message.error("Không thể xóa môn học.");
    }
  };

  // --- 3. HÀM XỬ LÝ MODAL VÀ REFRESH ---

  const handleOpenUpdateModal = (subjectId) => {
    setSubjectIdToUpdate(subjectId);
    setIsUpdateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsUpdateModalOpen(false);
    setSubjectIdToUpdate(null);
    setIsChapterListModalOpen(false);
    setSelectedSubjectIdForChapters(null);
    setSelectedSubjectNameForChapters(null);
  };

  // Hàm xử lý khi Thêm/Sửa thành công (gọi lại API)
  const handleSuccess = () => {
    fetchSubjects(); // Làm mới dữ liệu sau khi CRUD thành công
    handleCloseModal();
  };


  // --- 4. LỌC DỮ LIỆU (Giữ nguyên logic useMemo) ---
  const filteredSubjects = useMemo(() => {
    if (!searchText) return subjects;
    const lowerSearch = searchText.toLowerCase();
    return subjects.filter(
      (item) =>
        item.name?.toLowerCase().includes(lowerSearch) ||
        item.subjectId?.toString().includes(lowerSearch)
    );
  }, [subjects, searchText]);


  // --- 5. ĐỊNH NGHĨA CỘT (Giữ nguyên) ---
  const columns = [
    {
      title: "ID", dataIndex: "subjectId", key: "subjectId", width: 100,
      sorter: (a, b) => a.subjectId - b.subjectId, render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Tên môn học", dataIndex: "name", key: "name",
      render: (text) => (<Text style={{ fontSize: 15, fontWeight: 500 }}>{text}</Text>),
    },
    {
      title: "Mô tả", dataIndex: "description", key: "description", responsive: ["md"],
      render: (text) => text || (<Text type="secondary" italic>Không có mô tả</Text>),
    },
    {
      title: "Hành động", key: "action", width: 180,
      render: (_, record) => (
        <Space>
          {/* Nút Xem chi tiết / Quản lý chương -> MỞ MODAL */}
          <Tooltip title="Xem các chương của môn học">
            <Button
              icon={<UnorderedListOutlined />}
              onClick={() => {
                setSelectedSubjectIdForChapters(record.subjectId);
                setSelectedSubjectNameForChapters(record.name);
                setIsChapterListModalOpen(true);
              }}
              style={{ color: "#faad14", borderColor: "#faad14" }}
            />
          </Tooltip>

          {/* Nút Sửa -> MỞ MODAL */}
          <Tooltip title={!isAdmin ? "Chỉ Admin mới được sửa" : "Sửa môn học"}>
            <Button
              type="primary"
              ghost
              icon={<EditOutlined />}
              disabled={!isAdmin}
              onClick={() => handleOpenUpdateModal(record.subjectId)}
            />
          </Tooltip>

          {/* Nút Xóa */}
          <Popconfirm
            title="Xóa môn học này?"
            description="Hành động này không thể hoàn tác!"
            onConfirm={() => handleDelete(record.subjectId)}
            okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
            disabled={!isAdmin}
          >
            <Tooltip title={!isAdmin ? "Chỉ Admin mới được xóa" : "Xóa môn học"}>
              <Button danger icon={<DeleteOutlined />} disabled={!isAdmin} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // --- ĐỊNH NGHĨA COMPONENTS CON CHO LAYOUT ---

  const pageTitle = (
    <Space>
      <ReadOutlined /> Quản lý môn học
    </Space>
  );

  const subjectFilters = (
    <Input
      placeholder="Tìm tên môn, mã môn..."
      prefix={<SearchOutlined />}
      onChange={(e) => setSearchText(e.target.value)}
      allowClear
      style={{ maxWidth: 300 }}
    />
  );

  const subjectTable = (
    <Table // Sử dụng trực tiếp Table của antd
      columns={columns}
      dataSource={filteredSubjects} // Truyền dữ liệu đã lọc
      rowKey="subjectId"
      loading={loading}
      pagination={{
        pageSize: 7,
      }}
      scroll={{ x: 700 }}
    />
  );


  return (
    <>
      {/* SỬ DỤNG MANAGEMENTPAGELAYOUT */}
      <ManagementPageLayout
        title={pageTitle}
        filters={subjectFilters}
        table={subjectTable}

        // Nút tải lại (gọi hàm API cục bộ)
        onReload={fetchSubjects}

        // Nút thêm mới (Chỉ Admin)
        onAdd={isAdmin ? () => setIsAddModalOpen(true) : undefined}
      />

      {/* --- MODAL QUẢN LÝ CHƯƠNG --- */}
      {selectedSubjectIdForChapters && (
        <ChapterListModal
          isModalOpen={isChapterListModalOpen}
          onCancel={handleCloseModal}
          subjectId={selectedSubjectIdForChapters}
          subjectName={selectedSubjectNameForChapters}
        />
      )}

      {/* --- MODAL THÊM MÔN HỌC --- */}
      <AddSubjectModal
        isModalOpen={isAddModalOpen}
        onCancel={handleCloseModal}
        onSuccess={handleSuccess}
      />

      {/* --- MODAL CẬP NHẬT MÔN HỌC --- */}
      {subjectIdToUpdate && (
        <UpdateSubjectModal
          isModalOpen={isUpdateModalOpen}
          onCancel={handleCloseModal}
          onSuccess={handleSuccess}
          subjectId={subjectIdToUpdate}
        />
      )}
    </>
  );
}