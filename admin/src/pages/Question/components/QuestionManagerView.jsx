import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Segmented,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import ManagementPageLayout from "../../../layouts/ManagementPageLayout";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminSearchInput,
} from "../../../components/common/filters/AdminFilterControls";
import AdminTable from "../../../components/common/table/AdminTable";
import {
  AdminActionButton,
  AdminConfirmAction,
  AdminTableActions,
} from "../../../components/common/table/AdminTableActions";
import AdminTableSwitch from "../../../components/common/table/AdminTableSwitch";
import {
  AdminExportButton,
  AdminImportButton,
} from "../../../components/common/buttons/AdminButtons";
import MarkdownLatex from "../../../components/common/MarkdownLatex";
import { QUESTION_ANSWER_LABELS, QUESTION_PAGE_SIZE_OPTIONS } from "../constants";

const { Text } = Typography;

const renderAnswerContent = (answers, index) => {
  const answer = answers && answers[index];
  if (!answer) return <Text type="secondary">-</Text>;
  return (
    <Tooltip
      title={<MarkdownLatex content={answer.content} style={{ maxWidth: 300 }} />}
      styles={{ root: { maxWidth: 320 } }}
    >
      <span>
        <MarkdownLatex
          content={answer.content}
          style={{
            maxWidth: 150,
            overflow: "hidden",
            maxHeight: 60,
            color: answer.isCorrect ? "var(--admin-success)" : undefined,
            fontWeight: answer.isCorrect ? "bold" : undefined,
          }}
        />
      </span>
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
  toggleQuestionAvailability,
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
          styles={{ root: { maxWidth: 480 } }}
        >
          <span>
            <MarkdownLatex
              content={text}
              style={{
                maxWidth: 250,
                maxHeight: 80,
                overflow: "hidden",
                fontWeight: "bold",
              }}
            />
          </span>
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
      title: "Đề thi",
      dataIndex: "examEnabled",
      key: "examEnabled",
      width: 110,
      align: "center",
      render: (enabled, record) => (
        <AdminTableSwitch
          checked={enabled !== false}
          disabled={
            viewMode !== "active" ||
            !canOnSubject(record.subjectId, "QUESTION", "UPDATE")
          }
          onChange={(checked) =>
            toggleQuestionAvailability(record, "examEnabled", checked)
          }
        />
      ),
    },
    {
      title: "Ôn tập",
      dataIndex: "practiceEnabled",
      key: "practiceEnabled",
      width: 110,
      align: "center",
      render: (enabled, record) => (
        <AdminTableSwitch
          checked={enabled !== false}
          disabled={
            viewMode !== "active" ||
            !canOnSubject(record.subjectId, "QUESTION", "UPDATE")
          }
          onChange={(checked) =>
            toggleQuestionAvailability(record, "practiceEnabled", checked)
          }
        />
      ),
    },
    {
      title: "Chương",
      dataIndex: "chapterName",
      key: "chapterName",
      width: 150,
    },
    ...QUESTION_ANSWER_LABELS.map((label, index) => ({
      title: `Đáp án ${label}`,
      key: `ans${label}`,
      width: 150,
      render: (_, record) => renderAnswerContent(record.answers, index),
    })),
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
          <AdminTableActions>
            <AdminActionButton
              title="Sửa câu hỏi"
              variant="warning"
              icon={<EditOutlined />}
              disabled={!canOnSubject(record.subjectId, "QUESTION", "UPDATE")}
              onClick={() => navigate(`/questions/${record.questionId}/edit`)}
            />
            <AdminConfirmAction
              buttonTitle="Xóa câu hỏi"
              confirmTitle="Chuyển câu hỏi vào thùng rác?"
              description="Liên kết đề thi, câu trả lời và lịch sử bài làm vẫn được giữ."
              onConfirm={() => deleteQuestion(record.questionId)}
              okText="Chuyển vào thùng rác"
              danger
              disabled={!canOnSubject(record.subjectId, "QUESTION", "DELETE")}
              icon={<DeleteOutlined />}
            />
          </AdminTableActions>
        ) : (
          <AdminConfirmAction
            buttonTitle="Khôi phục"
            confirmTitle="Khôi phục câu hỏi?"
            description="Chỉ khôi phục được khi chương cha đang hoạt động."
            onConfirm={() => restoreQuestion(record.questionId)}
            okText="Khôi phục"
            variant="success"
            icon={<UndoOutlined />}
          />
        ),
    },
  ];

  const filters = (
    <AdminFilterBar
      filters={
        <>
      <AdminSearchInput
        placeholder="Tìm nội dung câu hỏi..."
        value={searchText}
        onChange={(event) => changeSearchText(event.target.value)}
      />
      <AdminFilterSelect
        placeholder="Môn học"
        value={advancedFilters.subjectId}
        onChange={(value) => updateFilter("subjectId", value)}
        options={subjects.map((subject) => ({
          value: subject.subjectId,
          label: subject.name,
        }))}
      />
      <AdminFilterSelect
        placeholder="Chương"
        value={advancedFilters.chapterId}
        onChange={(value) => updateFilter("chapterId", value)}
        options={chapters.map((chapter) => ({
          value: chapter.chapterId,
          label: chapter.name,
        }))}
      />
      <AdminFilterSelect
        placeholder="Mức độ"
        value={advancedFilters.difficulty}
        onChange={(value) => updateFilter("difficulty", value)}
        options={["EASY", "MEDIUM", "HARD"].map((value) => ({
          value,
          label: value,
        }))}
      />
      <AdminFilterSelect
        placeholder="Dùng trong đề thi"
        value={advancedFilters.examEnabled}
        onChange={(value) => updateFilter("examEnabled", value)}
        options={[
          { value: true, label: "Có dùng trong đề thi" },
          { value: false, label: "Không dùng trong đề thi" },
        ]}
      />
      <AdminFilterSelect
        placeholder="Hiện trong ôn tập"
        value={advancedFilters.practiceEnabled}
        onChange={(value) => updateFilter("practiceEnabled", value)}
        options={[
          { value: true, label: "Có hiện ôn tập" },
          { value: false, label: "Không hiện ôn tập" },
        ]}
      />
      {!isMod && (
        <AdminFilterSelect
          placeholder="Người tạo"
          value={advancedFilters.creatorId}
          onChange={(value) => updateFilter("creatorId", value)}
          showSearch
          optionFilterProp="label"
          options={creators.map((user) => ({
            value: user.userId,
            label: user.username,
          }))}
        />
      )}
        </>
      }
      statusSwitch={
        <Segmented
          value={viewMode}
          onChange={changeViewMode}
          disabled={isMod}
          options={[
            { label: "Đang hoạt động", value: "active" },
            { label: "Thùng rác", value: "deleted" },
          ]}
        />
      }
    />
  );

  const extraActions = (
    <Space>
      {!isMod && (
        <AdminExportButton onClick={downloadQuestions} />
      )}
      {canImportQuestion ? (
        <AdminImportButton onClick={() => navigate("/questions/import")} />
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
          <AdminTable
            columns={columns}
            dataSource={questions}
            rowKey="questionId"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: QUESTION_PAGE_SIZE_OPTIONS,
            }}
            scroll={{ x: 2520 }}
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
