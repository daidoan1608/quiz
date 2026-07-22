import React from "react";
import { Table } from "antd";

const columns = [
  { title: "Câu hỏi", dataIndex: "content", ellipsis: true },
  { title: "Chương", dataIndex: "chapterName", width: 160 },
  { title: "Độ khó", dataIndex: "difficulty", width: 110 },
  { title: "Loại", dataIndex: "questionType", width: 150 },
];

export function ExamQuestionPickerTable({
  dataSource,
  loading,
  onPageChange,
  onSelectionChange,
  page,
  pageSize = 20,
  selectedQuestionIds,
  total,
}) {
  const toggleQuestion = (questionId) => {
    onSelectionChange(
      selectedQuestionIds.includes(questionId)
        ? selectedQuestionIds.filter((id) => id !== questionId)
        : [...selectedQuestionIds, questionId]
    );
  };

  return (
    <Table
      size="small"
      rowKey="questionId"
      loading={loading}
      dataSource={dataSource}
      rowClassName="exam-question-picker-table__row"
      onRow={(record) => ({
        onClick: () => toggleQuestion(record.questionId),
      })}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: false,
        onChange: onPageChange,
      }}
      rowSelection={{
        selectedRowKeys: selectedQuestionIds,
        preserveSelectedRowKeys: true,
        onChange: onSelectionChange,
        onCell: () => ({
          onClick: (event) => event.stopPropagation(),
        }),
      }}
      columns={columns}
    />
  );
}
