import React from "react";
import {
  DatePicker,
  Space,
  Tag,
} from "antd";
import {
  EyeOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import ManagementPageLayout from "../../../layouts/ManagementPageLayout";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminSearchInput,
} from "../../../components/common/filters/AdminFilterControls";
import AdminTable from "../../../components/common/table/AdminTable";
import { AdminActionButton } from "../../../components/common/table/AdminTableActions";
import AdminTableText from "../../../components/common/table/AdminTableText";
import { AdminExportButton } from "../../../components/common/buttons/AdminButtons";
import { getNoWrapHeaderColumns } from "../utils/tableColumnStyles";
import UserExamDetailModal from "./UserExamDetailModal";

export const UserExamListView = ({
  data,
  categories,
  subjects,
  loading,
  searchText,
  setSearchText,
  selectedUserExamId,
  isDetailModalOpen,
  advancedFilters,
  pagination,
  updateFilter,
  changePage,
  fetchData,
  openDetailModal,
  closeDetailModal,
  downloadExamResults,
}) => {
  const columns = getNoWrapHeaderColumns([
    {
      title: "Môn học",
      dataIndex: "subjectName",
      key: "subjectName",
      render: (text) => <AdminTableText strong>{text}</AdminTableText>,
      width: 200,
      ellipsis: true,
      sorter: (a, b) =>
        String(a.subjectName || "").localeCompare(String(b.subjectName || "")),
    },
    {
      title: "Đề thi",
      dataIndex: "title",
      key: "title",
      width: 260,
      ellipsis: true,
      sorter: (a, b) => String(a.title || "").localeCompare(String(b.title || "")),
      render: (text) => <AdminTableText>{text}</AdminTableText>,
    },
    {
      title: "Người làm bài",
      key: "user",
      width: 220,
      ellipsis: true,
      sorter: (a, b) =>
        String(a.fullName || a.username || "").localeCompare(
          String(b.fullName || b.username || "")
        ),
      render: (_, record) => (
        <div className="admin-table-cell-stack">
          <AdminTableText strong>{record.fullName}</AdminTableText>
          <br />
          <AdminTableText type="secondary">@{record.username}</AdminTableText>
        </div>
      ),
    },
    {
      title: "Điểm số",
      dataIndex: "score",
      key: "score",
      width: 100,
      sorter: (a, b) => a.score - b.score,
      render: (score) => {
        const color = score >= 80 ? "success" : score >= 50 ? "warning" : "error";
        return (
          <Tag className="admin-table-score-tag" color={color}>
            {score}
          </Tag>
        );
      },
    },
    {
      title: "Thời gian",
      key: "time",
      width: 250,
      sorter: (a, b) => new Date(a.startTime || 0) - new Date(b.startTime || 0),
      render: (_, record) => (
        <div className="admin-table-compact-text">
          <div>Bắt đầu: {new Date(record.startTime).toLocaleString()}</div>
          <div>Kết thúc: {new Date(record.endTime).toLocaleString()}</div>
        </div>
      ),
    },
    {
      title: "UUID",
      dataIndex: "userId",
      key: "userId",
      width: 150,
      ellipsis: true,
      sorter: (a, b) => String(a.userId || "").localeCompare(String(b.userId || "")),
      render: (text) => <AdminTableText>{text}</AdminTableText>,
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <AdminActionButton
          title="Xem chi tiết bài làm"
          icon={<EyeOutlined />}
          onClick={() => openDetailModal(record.userExamId)}
        />
      ),
    },
  ]);

  const filteredSubjects = subjects
    .filter(
      (subject) =>
        !advancedFilters.categoryId ||
        subject.categoryId === advancedFilters.categoryId
    )
    .map((subject) => ({
      value: subject.subjectId,
      label: subject.name,
    }));

  const filters = (
    <AdminFilterBar
      filters={
        <>
          <AdminSearchInput
            placeholder="Tìm đề thi, môn học, user..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <AdminFilterSelect
            placeholder="Khoa"
            value={advancedFilters.categoryId}
            onChange={(value) => updateFilter("categoryId", value)}
            showSearch
            optionFilterProp="label"
            options={categories.map((category) => ({
              value: category.categoryId,
              label: category.categoryName,
            }))}
          />
          <AdminFilterSelect
            placeholder="Môn học"
            value={advancedFilters.subjectId}
            onChange={(value) => updateFilter("subjectId", value)}
            showSearch
            optionFilterProp="label"
            options={filteredSubjects}
          />
          <DatePicker.RangePicker
            className="management-filter-control"
            value={advancedFilters.startRange}
            onChange={(value) => updateFilter("startRange", value)}
            format="DD/MM/YYYY"
            placeholder={["Bắt đầu từ", "Bắt đầu đến"]}
            allowClear
          />
        </>
      }
    />
  );

  return (
    <>
      <ManagementPageLayout
        title={
          <Space>
            <ReadOutlined /> Quản lý bài thi người dùng
          </Space>
        }
        filters={filters}
        extra={
          <AdminExportButton onClick={downloadExamResults} />
        }
        table={
          <AdminTable
            columns={columns}
            dataSource={data}
            rowKey="userExamId"
            loading={loading}
            pagination={{
              ...pagination,
              onChange: changePage,
            }}
            scroll={{ x: 1200 }}
          />
        }
        onReload={() => fetchData(1)}
      />
      <UserExamDetailModal
        isModalOpen={isDetailModalOpen}
        userExamId={selectedUserExamId}
        onCancel={closeDetailModal}
      />
    </>
  );
};
