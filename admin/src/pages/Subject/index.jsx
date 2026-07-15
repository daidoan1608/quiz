import React, { useCallback, useEffect, useState } from "react";
import { Button, Input, Popconfirm, Segmented, Space, Table, Tooltip, Typography, message } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ReadOutlined,
  SearchOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { subjectApi } from "../../api/services";
import ManagementPageLayout from "../../layouts/ManagementPageLayout";
import AddSubjectModal from "../../components/Modal/AddSubjectModal";
import UpdateSubjectModal from "../../components/Modal/UpdateSubjectModal";
import ChapterListModal from "../../components/Modal/ChapterListModal";

const { Text } = Typography;

export default function SubjectManager() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState("active");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [subjectIdToUpdate, setSubjectIdToUpdate] = useState(null);
  const [isChapterListModalOpen, setIsChapterListModalOpen] = useState(false);
  const [selectedSubjectIdForChapters, setSelectedSubjectIdForChapters] = useState(null);
  const [selectedSubjectNameForChapters, setSelectedSubjectNameForChapters] = useState(null);

  const isAdmin = localStorage.getItem("role") === "ADMIN";

  const fetchSubjects = useCallback(async (keyword = searchText) => {
    setLoading(true);
    try {
      const trimmedKeyword = keyword.trim();
      const data =
        viewMode === "deleted"
          ? await subjectApi.getDeleted()
          : trimmedKeyword
            ? await subjectApi.search(trimmedKeyword)
            : await subjectApi.getAll();
      setSubjects(data);
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể tải danh sách môn học.");
    } finally {
      setLoading(false);
    }
  }, [searchText, viewMode]);

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchSubjects(searchText), 400);
    return () => clearTimeout(timeoutId);
  }, [searchText, viewMode, fetchSubjects]);

  const handleDelete = async (subjectId) => {
    if (!isAdmin) return message.warning("Bạn không có quyền xóa môn học.");
    try {
      await subjectApi.remove(subjectId);
      message.success("Đã chuyển môn học vào thùng rác.");
      fetchSubjects();
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể xóa môn học.");
    }
  };

  const handleRestore = async (subjectId) => {
    try {
      await subjectApi.restore(subjectId);
      message.success("Khôi phục môn học thành công.");
      fetchSubjects();
    } catch (error) {
      message.error(error.response?.data?.message || "Cần khôi phục khoa cha trước.");
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsUpdateModalOpen(false);
    setSubjectIdToUpdate(null);
    setIsChapterListModalOpen(false);
    setSelectedSubjectIdForChapters(null);
    setSelectedSubjectNameForChapters(null);
  };

  const columns = [
    { title: "ID", dataIndex: "subjectId", key: "subjectId", width: 90, sorter: (a, b) => a.subjectId - b.subjectId, render: (text) => <Text strong>{text}</Text> },
    { title: "Tên môn học", dataIndex: "name", key: "name", render: (text) => <Text strong>{text}</Text> },
    { title: "Mô tả", dataIndex: "description", key: "description", responsive: ["md"], render: (text) => text || <Text type="secondary">Không có mô tả</Text> },
    ...(viewMode === "deleted"
      ? [
          { title: "Xóa lúc", dataIndex: "deletedAt", key: "deletedAt", width: 180, render: (value) => value || "-" },
          { title: "Nguồn xóa", dataIndex: "deleteOriginType", key: "deleteOriginType", width: 120, render: (value) => value || "-" },
        ]
      : []),
    {
      title: "Hành động",
      key: "action",
      width: viewMode === "active" ? 180 : 90,
      fixed: "right",
      render: (_, record) =>
        viewMode === "active" ? (
          <Space>
            <Tooltip title="Xem chương">
              <Button
                className="action-btn"
                icon={<UnorderedListOutlined />}
                onClick={() => {
                  setSelectedSubjectIdForChapters(record.subjectId);
                  setSelectedSubjectNameForChapters(record.name);
                  setIsChapterListModalOpen(true);
                }}
              />
            </Tooltip>
            <Button className="action-btn is-primary" icon={<EditOutlined />} disabled={!isAdmin} onClick={() => { setSubjectIdToUpdate(record.subjectId); setIsUpdateModalOpen(true); }} />
            <Popconfirm
              title="Chuyển môn học vào thùng rác?"
              description="Các chương, đề và câu hỏi đang hoạt động thuộc môn này sẽ bị xóa mềm theo cascade."
              onConfirm={() => handleDelete(record.subjectId)}
              okText="Chuyển vào thùng rác"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              disabled={!isAdmin}
            >
              <Button className="action-btn is-danger" icon={<DeleteOutlined />} disabled={!isAdmin} />
            </Popconfirm>
          </Space>
        ) : (
          <Popconfirm
            title="Khôi phục môn học?"
            description="Chỉ khôi phục được khi khoa cha đang hoạt động."
            onConfirm={() => handleRestore(record.subjectId)}
            okText="Khôi phục"
            cancelText="Hủy"
          >
            <Button className="action-btn is-success" icon={<UndoOutlined />} disabled={!isAdmin} />
          </Popconfirm>
        ),
    },
  ];

  const filters = (
    <Space wrap>
      <Segmented value={viewMode} onChange={setViewMode} options={[{ label: "Đang hoạt động", value: "active" }, { label: "Thùng rác", value: "deleted" }]} />
      <Input
        placeholder="Tìm tên môn..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        disabled={viewMode === "deleted"}
        allowClear
        style={{ width: 300 }}
      />
    </Space>
  );

  return (
    <>
      <ManagementPageLayout
        title={<Space><ReadOutlined /> Quản lý môn học</Space>}
        filters={filters}
        table={<Table columns={columns} dataSource={subjects} rowKey="subjectId" loading={loading} pagination={{ pageSize: 7 }} scroll={{ x: 820 }} />}
        onReload={() => fetchSubjects(searchText)}
        onAdd={isAdmin && viewMode === "active" ? () => setIsAddModalOpen(true) : undefined}
      />

      {selectedSubjectIdForChapters && (
        <ChapterListModal isModalOpen={isChapterListModalOpen} onCancel={handleCloseModal} subjectId={selectedSubjectIdForChapters} subjectName={selectedSubjectNameForChapters} />
      )}

      <AddSubjectModal isModalOpen={isAddModalOpen} onCancel={handleCloseModal} onSuccess={() => { fetchSubjects(); handleCloseModal(); }} />

      {subjectIdToUpdate && (
        <UpdateSubjectModal isModalOpen={isUpdateModalOpen} onCancel={handleCloseModal} onSuccess={() => { fetchSubjects(); handleCloseModal(); }} subjectId={subjectIdToUpdate} />
      )}
    </>
  );
}
