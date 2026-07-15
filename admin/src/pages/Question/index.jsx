import React, { useCallback, useEffect, useState } from "react";
import { Button, Input, Popconfirm, Segmented, Space, Table, Tag, Tooltip, Typography, message } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ImportOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { questionApi } from "../../api/services";
import ManagementPageLayout from "../../layouts/ManagementPageLayout";
import AddQuestionModal from "../../components/Modal/AddQuestionModal";
import UpdateQuestionModal from "../../components/Modal/UpdateQuestionModal";
import ImportModal from "../../components/Modal/ImportModal";
import MarkdownLatex from "../../components/common/MarkdownLatex";

const { Text } = Typography;

export default function QuestionManager() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState("active");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [questionIdToUpdate, setQuestionIdToUpdate] = useState(null);

  const fetchQuestions = useCallback(async (keyword = searchText) => {
    setLoading(true);
    try {
      const trimmedKeyword = keyword.trim();
      const data =
        viewMode === "deleted"
          ? await questionApi.getDeleted()
          : trimmedKeyword
            ? await questionApi.search(trimmedKeyword)
            : await questionApi.getAll();
      setQuestions(data);
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể tải danh sách câu hỏi.");
    } finally {
      setLoading(false);
    }
  }, [searchText, viewMode]);

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchQuestions(searchText), 400);
    return () => clearTimeout(timeoutId);
  }, [searchText, viewMode, fetchQuestions]);

  const handleDelete = async (questionId) => {
    try {
      await questionApi.remove(questionId);
      message.success("Đã chuyển câu hỏi vào thùng rác.");
      fetchQuestions();
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể xóa câu hỏi.");
    }
  };

  const handleRestore = async (questionId) => {
    try {
      await questionApi.restore(questionId);
      message.success("Khôi phục câu hỏi thành công.");
      fetchQuestions();
    } catch (error) {
      message.error(error.response?.data?.message || "Cần khôi phục chương cha trước.");
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsUpdateModalOpen(false);
    setIsImportModalOpen(false);
    setQuestionIdToUpdate(null);
  };

  const handleSuccess = () => {
    fetchQuestions();
    handleCloseModal();
  };

  const renderAnswerContent = (answers, index) => {
    const answer = answers && answers[index];
    if (!answer) return <Text type="secondary">-</Text>;
    return (
      <Tooltip title={<MarkdownLatex content={answer.content} style={{ maxWidth: 300 }} />} overlayStyle={{ maxWidth: 320 }}>
        <MarkdownLatex
          content={answer.content}
          style={{
            maxWidth: 150,
            overflow: "hidden",
            maxHeight: 60,
            color: answer.isCorrect ? "#52c41a" : undefined,
            fontWeight: answer.isCorrect ? "bold" : undefined,
          }}
        />
      </Tooltip>
    );
  };

  const columns = [
    { title: "ID", dataIndex: "questionId", key: "questionId", width: 70, fixed: "left" },
    {
      title: "Nội dung câu hỏi",
      dataIndex: "content",
      key: "content",
      width: 280,
      render: (text) => (
        <Tooltip title={<MarkdownLatex content={text} style={{ maxWidth: 450, maxHeight: 300, overflowY: "auto" }} />} overlayStyle={{ maxWidth: 480 }}>
          <MarkdownLatex content={text} style={{ maxWidth: 250, maxHeight: 80, overflow: "hidden", fontWeight: "bold" }} />
        </Tooltip>
      ),
    },
    {
      title: "Mức độ",
      dataIndex: "difficulty",
      key: "difficulty",
      width: 100,
      render: (diff) => <Tag color={diff === "HARD" ? "red" : diff === "EASY" ? "green" : "blue"}>{diff}</Tag>,
    },
    { title: "Chương", dataIndex: "chapterName", key: "chapterName", width: 150 },
    { title: "Đáp án A", key: "ansA", width: 150, render: (_, record) => renderAnswerContent(record.answers, 0) },
    { title: "Đáp án B", key: "ansB", width: 150, render: (_, record) => renderAnswerContent(record.answers, 1) },
    { title: "Đáp án C", key: "ansC", width: 150, render: (_, record) => renderAnswerContent(record.answers, 2) },
    { title: "Đáp án D", key: "ansD", width: 150, render: (_, record) => renderAnswerContent(record.answers, 3) },
    ...(viewMode === "deleted"
      ? [
          { title: "Xóa lúc", dataIndex: "deletedAt", key: "deletedAt", width: 180, render: (value) => value || "-" },
          { title: "Nguồn xóa", dataIndex: "deleteOriginType", key: "deleteOriginType", width: 120, render: (value) => value || "-" },
        ]
      : []),
    {
      title: "Hành động",
      key: "action",
      width: viewMode === "active" ? 120 : 90,
      fixed: "right",
      render: (_, record) =>
        viewMode === "active" ? (
          <Space>
            <Button className="action-btn is-primary" icon={<EditOutlined />} onClick={() => { setQuestionIdToUpdate(record.questionId); setIsUpdateModalOpen(true); }} />
            <Popconfirm
              title="Chuyển câu hỏi vào thùng rác?"
              description="Liên kết đề thi, câu trả lời và lịch sử bài làm vẫn được giữ."
              onConfirm={() => handleDelete(record.questionId)}
              okText="Chuyển vào thùng rác"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button className="action-btn is-danger" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ) : (
          <Popconfirm
            title="Khôi phục câu hỏi?"
            description="Chỉ khôi phục được khi chương cha đang hoạt động."
            onConfirm={() => handleRestore(record.questionId)}
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
        placeholder="Tìm nội dung câu hỏi..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        disabled={viewMode === "deleted"}
        allowClear
        style={{ width: 300 }}
      />
    </Space>
  );

  const extraActions =
    viewMode === "active" ? (
      <Button className="toolbar-btn" icon={<ImportOutlined />} onClick={() => setIsImportModalOpen(true)}>
        Import
      </Button>
    ) : null;

  return (
    <>
      <ManagementPageLayout
        title={<Space><QuestionCircleOutlined /> Quản lý câu hỏi</Space>}
        filters={filters}
        extra={extraActions}
        table={<Table columns={columns} dataSource={questions} rowKey="questionId" loading={loading} pagination={{ pageSize: 7, showSizeChanger: false }} scroll={{ x: 1700 }} />}
        onReload={() => fetchQuestions(searchText)}
        onAdd={viewMode === "active" ? () => setIsAddModalOpen(true) : undefined}
      />

      <AddQuestionModal isModalOpen={isAddModalOpen} onCancel={handleCloseModal} onSuccess={handleSuccess} />

      {questionIdToUpdate && (
        <UpdateQuestionModal isModalOpen={isUpdateModalOpen} onCancel={handleCloseModal} onSuccess={handleSuccess} questionId={questionIdToUpdate} />
      )}

      <ImportModal isModalOpen={isImportModalOpen} onCancel={handleCloseModal} onSuccess={handleSuccess} />
    </>
  );
}
