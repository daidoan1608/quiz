import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Space,
  Tag,
} from "antd";
import {
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import ManagementPageLayout from "../../../layouts/ManagementPageLayout";
import {
  AdminEntityFilterSet,
  AdminFilterBar,
  AdminSearchInput,
  AdminStatusSegmented,
} from "../../../components/common/filters/AdminFilterControls";
import AdminTable from "../../../components/common/table/AdminTable";
import {
  AdminActionButton,
  AdminConfirmAction,
  AdminTableActions,
} from "../../../components/common/table/AdminTableActions";
import AdminTableText from "../../../components/common/table/AdminTableText";
import { buildSoftDeleteColumns } from "../../../components/common/table/softDeleteColumns";
import { EXAM_PAGE_SIZE_OPTIONS } from "../constants";
import { ExamDetailModal } from "./ExamDetailModal";

export const ExamManagerView = ({
  exams,
  categories,
  subjects,
  creators,
  loading,
  searchText,
  changeSearchText,
  viewMode,
  changeViewMode,
  advancedFilters,
  pagination,
  isMod,
  isViewModalOpen,
  selectedExamId,
  canCreateExam,
  canOnSubject,
  getSortOrder,
  handleTableChange,
  fetchExams,
  updateFilter,
  deleteExam,
  restoreExam,
  openViewModal,
  closeViewModal,
}) => {
  const navigate = useNavigate();
  const columns = [
    {
      title: "Mã đề",
      dataIndex: "examCode",
      key: "examCode",
      width: 140,
      ellipsis: true,
      sorter: true,
      sortOrder: getSortOrder("examCode"),
      render: (text) => <AdminTableText>{text}</AdminTableText>,
    },
    {
      title: "Mã môn",
      dataIndex: "subjectId",
      key: "subjectId",
      width: 120,
      render: (text) => <AdminTableText>{text}</AdminTableText>,
      sorter: true,
      sortOrder: getSortOrder("subjectId"),
    },
    {
      title: "Tên đề thi",
      dataIndex: "title",
      key: "title",
      width: 320,
      ellipsis: true,
      sorter: true,
      sortOrder: getSortOrder("title"),
      render: (text) => (
        <span className="admin-table-title-cell">
          <FileTextOutlined />
          <AdminTableText strong>{text}</AdminTableText>
        </span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 320,
      ellipsis: true,
      responsive: ["md"],
      sorter: true,
      sortOrder: getSortOrder("description"),
      render: (text) => <AdminTableText empty="Không có">{text}</AdminTableText>,
    },
    {
      title: "Thời gian",
      dataIndex: "duration",
      key: "duration",
      width: 120,
      sorter: true,
      sortOrder: getSortOrder("duration"),
      render: (duration) => (
        <Tag icon={<ClockCircleOutlined />} color="blue">
          {duration} phút
        </Tag>
      ),
    },
    {
      title: "Số câu",
      dataIndex: "questionCount",
      key: "questionCount",
      width: 100,
      sorter: true,
      sortOrder: getSortOrder("questionCount"),
      render: (count, record) => (
        <Tag>{count ?? record.questions?.length ?? 0} câu</Tag>
      ),
    },
    ...(viewMode === "deleted" ? buildSoftDeleteColumns(getSortOrder) : []),
    {
      title: "Hành động",
      key: "action",
      width: viewMode === "active" ? 220 : 90,
      fixed: "right",
      render: (_, record) =>
        viewMode === "active" ? (
          <AdminTableActions>
            <AdminActionButton
              title="Xem đề thi"
              variant="info"
              icon={<EyeOutlined />}
              onClick={() => openViewModal(record.examId)}
            />
            <AdminActionButton
              title="Preview PDF"
              variant="accent"
              icon={<FilePdfOutlined />}
              onClick={() => navigate(`/exams/${record.examId}/print-preview?mode=student`)}
            />
            <AdminActionButton
              title="Sửa đề thi"
              variant="warning"
              icon={<EditOutlined />}
              onClick={() => navigate(`/exams/${record.examId}/edit`)}
              disabled={!canOnSubject(record.subjectId, "EXAM", "UPDATE")}
            />
            <AdminConfirmAction
              buttonTitle="Chuyển vào thùng rác"
              confirmTitle="Chuyển đề thi vào thùng rác?"
              description="Lịch sử bài làm và attempt đang làm vẫn được giữ."
              onConfirm={() => deleteExam(record.examId)}
              okText="Chuyển vào thùng rác"
              danger
              disabled={!canOnSubject(record.subjectId, "EXAM", "DELETE")}
              icon={<DeleteOutlined />}
            />
          </AdminTableActions>
        ) : (
          <AdminConfirmAction
            buttonTitle="Khôi phục"
            confirmTitle="Khôi phục đề thi?"
            onConfirm={() => restoreExam(record.examId)}
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
            placeholder="Tìm tên đề, mã môn..."
            value={searchText}
            onChange={(event) => changeSearchText(event.target.value)}
          />
          <AdminEntityFilterSet
            categories={categories}
            categoryValue={advancedFilters.categoryId}
            onCategoryChange={(value) => updateFilter("categoryId", value)}
            subjects={subjects}
            subjectValue={advancedFilters.subjectId}
            onSubjectChange={(value) => updateFilter("subjectId", value)}
            creators={creators}
            creatorValue={advancedFilters.createdBy}
            onCreatorChange={(value) => updateFilter("createdBy", value)}
            hideChapter
            hideCreator={isMod}
          />
        </>
      }
      statusSwitch={
        <AdminStatusSegmented
          value={viewMode}
          onChange={changeViewMode}
          disabled={isMod}
        />
      }
    />
  );

  return (
    <>
      <ManagementPageLayout
        title={
          <Space>
            <FileTextOutlined /> Quản lý đề thi
          </Space>
        }
        filters={filters}
        table={
          <AdminTable
            columns={columns}
            dataSource={exams}
            rowKey="examId"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: EXAM_PAGE_SIZE_OPTIONS,
            }}
            scroll={{ x: viewMode === "active" ? 1250 : 1370 }}
            onChange={handleTableChange}
          />
        }
        onReload={() => fetchExams(pagination.current, pagination.pageSize)}
        onAdd={canCreateExam ? () => navigate("/exams/create") : undefined}
      />

      <ExamDetailModal
        open={isViewModalOpen}
        onCancel={closeViewModal}
        examId={selectedExamId}
      />
    </>
  );
};
