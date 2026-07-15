import React, { useCallback, useEffect, useState } from "react";
import { Button, Input, Popconfirm, Segmented, Space, Table, Tooltip, Typography, message } from "antd";
import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { chapterApi } from "../../api/services";
import ManagementPageLayout from "../../layouts/ManagementPageLayout";
import AddChapterModal from "../../components/Modal/AddChapterModal";
import UpdateChapterModal from "../../components/Modal/UpdateChapterModal";
import ChapterQuestionModal from "../../components/Modal/ChapterQuestionModal";

const { Text } = Typography;

export default function ChapterManager() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState("active");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [chapterIdToUpdate, setChapterIdToUpdate] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [chapterIdToView, setChapterIdToView] = useState(null);

  const fetchChapters = useCallback(async (keyword = searchText) => {
    setLoading(true);
    try {
      const trimmedKeyword = keyword.trim();
      const data =
        viewMode === "deleted"
          ? await chapterApi.getDeleted()
          : trimmedKeyword
            ? await chapterApi.search(trimmedKeyword)
            : await chapterApi.getAll();
      setChapters(data);
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể tải danh sách chương.");
    } finally {
      setLoading(false);
    }
  }, [searchText, viewMode]);

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchChapters(searchText), 400);
    return () => clearTimeout(timeoutId);
  }, [searchText, viewMode, fetchChapters]);

  const handleDelete = async (chapterId) => {
    try {
      await chapterApi.remove(chapterId);
      message.success("Đã chuyển chương vào thùng rác.");
      fetchChapters();
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể xóa chương.");
    }
  };

  const handleRestore = async (chapterId) => {
    try {
      await chapterApi.restore(chapterId);
      message.success("Khôi phục chương thành công.");
      fetchChapters();
    } catch (error) {
      message.error(error.response?.data?.message || "Cần khôi phục môn cha trước.");
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsUpdateModalOpen(false);
    setChapterIdToUpdate(null);
    setIsQuestionModalOpen(false);
    setChapterIdToView(null);
  };

  const columns = [
    { title: "ID", dataIndex: "chapterId", key: "chapterId", width: 90, sorter: (a, b) => a.chapterId - b.chapterId, render: (text) => <Text type="secondary">{text}</Text> },
    { title: "Tên chương", dataIndex: "name", key: "name", render: (text) => <Text strong>{text}</Text> },
    { title: "Mã môn", dataIndex: "subjectId", key: "subjectId", width: 120, render: (text) => <Text code>{text}</Text> },
    {
      title: "Chương",
      dataIndex: "chapterNumber",
      key: "chapterNumber",
      width: 130,
      sorter: (a, b) => a.chapterNumber - b.chapterNumber,
      render: (text) => <Text style={{ whiteSpace: "nowrap" }}>{text}</Text>,
    },
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
            <Tooltip title="Xem câu hỏi">
              <Button className="action-btn" icon={<UnorderedListOutlined />} onClick={() => { setChapterIdToView(record.chapterId); setIsQuestionModalOpen(true); }} />
            </Tooltip>
            <Button className="action-btn is-primary" icon={<EditOutlined />} onClick={() => { setChapterIdToUpdate(record.chapterId); setIsUpdateModalOpen(true); }} />
            <Popconfirm
              title="Chuyển chương vào thùng rác?"
              description="Các câu hỏi đang hoạt động thuộc chương này sẽ bị xóa mềm theo cascade."
              onConfirm={() => handleDelete(record.chapterId)}
              okText="Chuyển vào thùng rác"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button className="action-btn is-danger" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ) : (
          <Popconfirm
            title="Khôi phục chương?"
            description="Chỉ khôi phục được khi môn cha đang hoạt động."
            onConfirm={() => handleRestore(record.chapterId)}
            okText="Khôi phục"
            cancelText="Hủy"
          >
            <Button className="action-btn is-success" icon={<UndoOutlined />} />
          </Popconfirm>
        ),
    },
  ];

  const filters = (
    <Space wrap>
      <Segmented value={viewMode} onChange={setViewMode} options={[{ label: "Đang hoạt động", value: "active" }, { label: "Thùng rác", value: "deleted" }]} />
      <Input
        placeholder="Tìm tên chương..."
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
        title={<Space><BookOutlined /> Quản lý chương</Space>}
        filters={filters}
        table={<Table columns={columns} dataSource={chapters} rowKey="chapterId" loading={loading} pagination={{ pageSize: 7 }} scroll={{ x: 820 }} />}
        onReload={() => fetchChapters(searchText)}
        onAdd={viewMode === "active" ? () => setIsAddModalOpen(true) : undefined}
      />

      <AddChapterModal isModalOpen={isAddModalOpen} onCancel={handleCloseModal} onSuccess={() => { fetchChapters(); handleCloseModal(); }} />

      {chapterIdToUpdate && (
        <UpdateChapterModal isModalOpen={isUpdateModalOpen} onCancel={handleCloseModal} onSuccess={() => { fetchChapters(); handleCloseModal(); }} chapterId={chapterIdToUpdate} />
      )}

      {isQuestionModalOpen && chapterIdToView && (
        <ChapterQuestionModal isModalOpen={isQuestionModalOpen} onCancel={handleCloseModal} chapterId={chapterIdToView} />
      )}
    </>
  );
}
