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
} from "antd";
import {
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import ManagementPageLayout from "../../../layouts/ManagementPageLayout";
import AdminTableText from "../../../components/common/table/AdminTableText";
import { buildSoftDeleteColumns } from "../../../components/common/table/softDeleteColumns";
import { EXAM_PAGE_SIZE_OPTIONS } from "../constants";
import { ExamDetailModal } from "./ExamDetailModal";
import ExamFormCreateModal from "./ExamFormCreateModal";
import { ExamFormUpdateModal } from "./ExamFormUpdateModal";

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
  isAddModalOpen,
  isViewModalOpen,
  isUpdateModalOpen,
  selectedExamId,
  canCreateExam,
  canOnSubject,
  getSortOrder,
  handleTableChange,
  fetchExams,
  updateFilter,
  deleteExam,
  restoreExam,
  openAddModal,
  closeAddModal,
  refreshExamList,
  openViewModal,
  closeViewModal,
  openUpdateModal,
  closeUpdateModal,
}) => {
  const navigate = useNavigate();
  const columns = [
    {
      title: "Ma de",
      dataIndex: "examCode",
      key: "examCode",
      width: 140,
      ellipsis: true,
      sorter: true,
      sortOrder: getSortOrder("examCode"),
      render: (text) => <AdminTableText strong>{text}</AdminTableText>,
    },
    {
      title: "Mã môn",
      dataIndex: "subjectId",
      key: "subjectId",
      width: 120,
      render: (text) => <AdminTableText strong>{text}</AdminTableText>,
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
          <Space>
            <Tooltip title="Xem đề thi">
              <Button
                className="action-btn"
                icon={<EyeOutlined />}
                onClick={() => openViewModal(record.examId)}
              />
            </Tooltip>
            <Tooltip title="Preview PDF">
              <Button
                className="action-btn"
                icon={<FilePdfOutlined />}
                onClick={() => navigate(`/exams/${record.examId}/print-preview?mode=student`)}
              />
            </Tooltip>
            <Tooltip title="Sua de thi">
              <Button
                className="action-btn"
                icon={<EditOutlined />}
                onClick={() => openUpdateModal(record.examId)}
                disabled={!canOnSubject(record.subjectId, "EXAM", "UPDATE")}
              />
            </Tooltip>
            <Popconfirm
              title="Chuyển đề thi vào thùng rác?"
              description="Lịch sử bài làm và attempt đang làm vẫn được giữ."
              onConfirm={() => deleteExam(record.examId)}
              okText="Chuyển vào thùng rác"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              disabled={!canOnSubject(record.subjectId, "EXAM", "DELETE")}
            >
              <Button
                className="action-btn is-danger"
                icon={<DeleteOutlined />}
                disabled={!canOnSubject(record.subjectId, "EXAM", "DELETE")}
              />
            </Popconfirm>
          </Space>
        ) : (
          <Popconfirm
            title="Khôi phục đề thi?"
            onConfirm={() => restoreExam(record.examId)}
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
        placeholder="Tìm tên đề, mã môn..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(event) => changeSearchText(event.target.value)}
        allowClear
        style={{ width: 300 }}
      />
      <Select
        placeholder="Khoa"
        value={advancedFilters.categoryId}
        onChange={(value) => updateFilter("categoryId", value)}
        allowClear
        showSearch
        optionFilterProp="label"
        style={{ width: 180 }}
        options={categories.map((category) => ({
          value: category.categoryId,
          label: category.categoryName,
        }))}
      />
      <Select
        placeholder="Môn học"
        value={advancedFilters.subjectId}
        onChange={(value) => updateFilter("subjectId", value)}
        allowClear
        showSearch
        optionFilterProp="label"
        style={{ width: 200 }}
        options={subjects.map((subject) => ({
          value: subject.subjectId,
          label: subject.name,
        }))}
      />
      {!isMod && (
        <Select
          placeholder="Người tạo"
          value={advancedFilters.createdBy}
          onChange={(value) => updateFilter("createdBy", value)}
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
          <Table
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
            tableLayout="fixed"
            onChange={handleTableChange}
          />
        }
        onReload={() => fetchExams(pagination.current, pagination.pageSize)}
        onAdd={canCreateExam ? openAddModal : undefined}
      />

      <ExamFormCreateModal
        isModalOpen={isAddModalOpen}
        onCancel={closeAddModal}
        onSuccess={refreshExamList}
      />
      <ExamDetailModal
        open={isViewModalOpen}
        onCancel={closeViewModal}
        examId={selectedExamId}
      />
      <ExamFormUpdateModal
        open={isUpdateModalOpen}
        onCancel={closeUpdateModal}
        onSuccess={refreshExamList}
        examId={selectedExamId}
      />
    </>
  );
};
