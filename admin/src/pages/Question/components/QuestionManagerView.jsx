import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Popconfirm,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ImportOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import ManagementPageLayout from "../../../layouts/ManagementPageLayout";
import MarkdownLatex from "../../../components/common/MarkdownLatex";
import { QUESTION_PAGE_SIZE_OPTIONS } from "../constants";

const { Text } = Typography;

const renderAnswerContent = (answers, index) => {
  const answer = answers && answers[index];
  if (!answer) return <Text type="secondary">-</Text>;
  return (
    <Tooltip
      title={<MarkdownLatex content={answer.content} style={{ maxWidth: 300 }} />}
      overlayStyle={{ maxWidth: 320 }}
    >
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

export const QuestionManagerView = ({
  questions,
  loading,
  searchText,
  changeSearchText,
  viewMode,
  changeViewMode,
  subjects,
  chapters,
  creators,
  advancedFilters,
  pagination,
  isMod,
  canCreateQuestion,
  canImportQuestion,
  canOnSubject,
  getSortOrder,
  handleTableChange,
  fetchQuestions,
  updateFilter,
  deleteQuestion,
  restoreQuestion,
  downloadQuestions,
}) => {
  const navigate = useNavigate();
  const columns = [
    {
      title: "ID",
      dataIndex: "questionId",
      key: "questionId",
      width: 70,
      fixed: "left",
    },
    {
      title: "Nội dung câu hỏi",
      dataIndex: "content",
      key: "content",
      width: 280,
      render: (text) => (
        <Tooltip
          title={
            <MarkdownLatex
              content={text}
              style={{ maxWidth: 450, maxHeight: 300, overflowY: "auto" }}
            />
          }
          overlayStyle={{ maxWidth: 480 }}
        >
          <MarkdownLatex
            content={text}
            style={{
              maxWidth: 250,
              maxHeight: 80,
              overflow: "hidden",
              fontWeight: "bold",
            }}
          />
        </Tooltip>
      ),
    },
    {
      title: "Mức độ",
      dataIndex: "difficulty",
      key: "difficulty",
      width: 100,
      render: (diff) => (
        <Tag color={diff === "HARD" ? "red" : diff === "EASY" ? "green" : "blue"}>
          {diff}
        </Tag>
      ),
    },
    {
      title: "Chương",
      dataIndex: "chapterName",
      key: "chapterName",
      width: 150,
    },
    {
      title: "Đáp án A",
      key: "ansA",
      width: 150,
      render: (_, record) => renderAnswerContent(record.answers, 0),
    },
    {
      title: "Đáp án B",
      key: "ansB",
      width: 150,
      render: (_, record) => renderAnswerContent(record.answers, 1),
    },
    {
      title: "Đáp án C",
      key: "ansC",
      width: 150,
      render: (_, record) => renderAnswerContent(record.answers, 2),
    },
    {
      title: "Đáp án D",
      key: "ansD",
      width: 150,
      render: (_, record) => renderAnswerContent(record.answers, 3),
    },
    ...(viewMode === "deleted"
      ? [
          {
            title: "Xóa lúc",
            dataIndex: "deletedAt",
            key: "deletedAt",
            width: 180,
            render: (value) => value || "-",
          },
          {
            title: "Nguồn xóa",
            dataIndex: "deleteOriginType",
            key: "deleteOriginType",
            width: 120,
            render: (value) => value || "-",
          },
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
            <Button
              className="action-btn is-primary"
              icon={<EditOutlined />}
              disabled={!canOnSubject(record.subjectId, "QUESTION", "UPDATE")}
              onClick={() => navigate(`/questions/${record.questionId}/edit`)}
            />
            <Popconfirm
              title="Chuyển câu hỏi vào thùng rác?"
              description="Liên kết đề thi, câu trả lời và lịch sử bài làm vẫn được giữ."
              onConfirm={() => deleteQuestion(record.questionId)}
              okText="Chuyển vào thùng rác"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              disabled={!canOnSubject(record.subjectId, "QUESTION", "DELETE")}
            >
              <Button
                className="action-btn is-danger"
                icon={<DeleteOutlined />}
                disabled={!canOnSubject(record.subjectId, "QUESTION", "DELETE")}
              />
            </Popconfirm>
          </Space>
        ) : (
          <Popconfirm
            title="Khôi phục câu hỏi?"
            description="Chỉ khôi phục được khi chương cha đang hoạt động."
            onConfirm={() => restoreQuestion(record.questionId)}
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
      <Segmented
        value={viewMode}
        onChange={changeViewMode}
        disabled={isMod}
        options={[
          { label: "Đang hoạt động", value: "active" },
          { label: "Thùng rác", value: "deleted" },
        ]}
      />
      <Input
        placeholder="Tìm nội dung câu hỏi..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(event) => changeSearchText(event.target.value)}
        allowClear
        style={{ width: 300 }}
      />
      <Select
        placeholder="Môn học"
        value={advancedFilters.subjectId}
        onChange={(value) => updateFilter("subjectId", value)}
        allowClear
        style={{ width: 180 }}
        options={subjects.map((subject) => ({
          value: subject.subjectId,
          label: subject.name,
        }))}
      />
      <Select
        placeholder="Chương"
        value={advancedFilters.chapterId}
        onChange={(value) => updateFilter("chapterId", value)}
        allowClear
        style={{ width: 180 }}
        options={chapters.map((chapter) => ({
          value: chapter.chapterId,
          label: chapter.name,
        }))}
      />
      <Select
        placeholder="Mức độ"
        value={advancedFilters.difficulty}
        onChange={(value) => updateFilter("difficulty", value)}
        allowClear
        style={{ width: 130 }}
        options={["EASY", "MEDIUM", "HARD"].map((value) => ({
          value,
          label: value,
        }))}
      />
      {!isMod && (
        <Select
          placeholder="Người tạo"
          value={advancedFilters.creatorId}
          onChange={(value) => updateFilter("creatorId", value)}
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ width: 180 }}
          options={creators.map((user) => ({
            value: user.userId,
            label: user.username,
          }))}
        />
      )}
    </Space>
  );

  const extraActions = (
    <Space>
      {!isMod && (
        <Button
          className="toolbar-btn"
          icon={<DownloadOutlined />}
          onClick={downloadQuestions}
        >
          Export CSV
        </Button>
      )}
      {canImportQuestion ? (
        <Button
          className="toolbar-btn"
          icon={<ImportOutlined />}
          onClick={() => navigate("/questions/import")}
        >
          Import
        </Button>
      ) : null}
    </Space>
  );

  return (
    <>
      <ManagementPageLayout
        title={
          <Space>
            <QuestionCircleOutlined /> Quản lý câu hỏi
          </Space>
        }
        filters={filters}
        extra={extraActions}
        table={
          <Table
            columns={columns}
            dataSource={questions}
            rowKey="questionId"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: QUESTION_PAGE_SIZE_OPTIONS,
            }}
            scroll={{ x: 1700 }}
            onChange={handleTableChange}
          />
        }
        onReload={() =>
          fetchQuestions(searchText, pagination.current, pagination.pageSize)
        }
        onAdd={canCreateQuestion ? () => navigate("/questions/create") : undefined}
      />

    </>
  );
};
