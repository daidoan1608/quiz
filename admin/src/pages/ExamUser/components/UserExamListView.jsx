import React from "react";
import {
  Button,
  DatePicker,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  ReadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import ManagementPageLayout from "../../../layouts/ManagementPageLayout";
import AdminTableText from "../../../components/common/table/AdminTableText";
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
        <div style={{ minWidth: 0 }}>
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
          <Tag color={color} style={{ fontWeight: "bold" }}>
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
        <div style={{ fontSize: 13 }}>
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
      render: (text) => <AdminTableText copyable>{text}</AdminTableText>,
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Tooltip title="Xem chi tiết bài làm">
          <Button
            icon={<EyeOutlined />}
            onClick={() => openDetailModal(record.userExamId)}
          />
        </Tooltip>
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
    <Space wrap>
      <Input
        placeholder="Tìm đề thi, môn học, user..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        style={{ width: 280 }}
        allowClear
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
        style={{ width: 220 }}
        options={filteredSubjects}
      />
      <DatePicker.RangePicker
        value={advancedFilters.startRange}
        onChange={(value) => updateFilter("startRange", value)}
        format="DD/MM/YYYY"
        placeholder={["Bắt đầu từ", "Bắt đầu đến"]}
        allowClear
        style={{ width: 260 }}
      />
    </Space>
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
          <Button
            className="toolbar-btn"
            icon={<DownloadOutlined />}
            onClick={downloadExamResults}
          >
            Export CSV
          </Button>
        }
        table={
          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={{
              ...pagination,
              onChange: changePage,
              showSizeChanger: false,
            }}
            scroll={{ x: 1200 }}
            tableLayout="fixed"
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
