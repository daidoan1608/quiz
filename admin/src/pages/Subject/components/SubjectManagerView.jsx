import React from "react";
import {
  Button,
  Input,
  Popconfirm,
  Segmented,
  Select,
  Space,
  Table,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ReadOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import ManagementPageLayout from "../../../layouts/ManagementPageLayout";
import AdminTableText from "../../../components/common/table/AdminTableText";
import { buildSoftDeleteColumns } from "../../../components/common/table/softDeleteColumns";
import { SubjectFormModal } from "./SubjectFormModal";

export const SubjectManagerView = ({
  subjects,
  categories,
  loading,
  searchText,
  setSearchText,
  viewMode,
  setViewMode,
  categoryFilter,
  setCategoryFilter,
  isAdmin,
  isMod,
  isAddModalOpen,
  isUpdateModalOpen,
  subjectIdToUpdate,
  canOnSubject,
  canAnySubject,
  getSortOrder,
  handleTableChange,
  fetchSubjects,
  deleteSubject,
  restoreSubject,
  openAddModal,
  openUpdateModal,
  closeModal,
  refreshAndCloseModal,
}) => {
  const columns = [
    {
      title: "ID",
      dataIndex: "subjectId",
      key: "subjectId",
      width: 90,
      sorter: true,
      sortOrder: getSortOrder("subjectId"),
      render: (text) => <AdminTableText strong>{text}</AdminTableText>,
    },
    {
      title: "Tên môn học",
      dataIndex: "name",
      key: "name",
      width: 260,
      ellipsis: true,
      sorter: true,
      sortOrder: getSortOrder("name"),
      render: (text) => <AdminTableText strong>{text}</AdminTableText>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 360,
      ellipsis: true,
      responsive: ["md"],
      sorter: true,
      sortOrder: getSortOrder("description"),
      render: (text) => (
        <AdminTableText empty="Không có mô tả">{text}</AdminTableText>
      ),
    },
    ...(viewMode === "deleted" ? buildSoftDeleteColumns(getSortOrder) : []),
    {
      title: "Hành động",
      key: "action",
      width: viewMode === "active" ? 130 : 90,
      fixed: "right",
      render: (_, record) =>
        viewMode === "active" ? (
          <Space>
            <Button
              className="action-btn is-primary"
              icon={<EditOutlined />}
              disabled={!canOnSubject(record.subjectId, "SUBJECT", "UPDATE")}
              onClick={() => openUpdateModal(record.subjectId)}
            />
            <Popconfirm
              title="Chuyển môn học vào thùng rác?"
              description="Các chương, bài và câu hỏi thuộc môn này sẽ bị xóa theo cascade."
              onConfirm={() => deleteSubject(record.subjectId)}
              okText="Chuyển vào thùng rác"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              disabled={!canOnSubject(record.subjectId, "SUBJECT", "DELETE")}
            >
              <Button
                className="action-btn is-danger"
                icon={<DeleteOutlined />}
                disabled={!canOnSubject(record.subjectId, "SUBJECT", "DELETE")}
              />
            </Popconfirm>
          </Space>
        ) : (
          <Popconfirm
            title="Khôi phục môn học?"
            description="Chỉ khôi phục được khi khoa cha đang hoạt động."
            onConfirm={() => restoreSubject(record.subjectId)}
            okText="Khôi phục"
            cancelText="Hủy"
          >
            <Button
              className="action-btn is-success"
              icon={<UndoOutlined />}
              disabled={!canOnSubject(record.subjectId, "SUBJECT", "UPDATE")}
            />
          </Popconfirm>
        ),
    },
  ];

  const filters = (
    <Space wrap>
      <Segmented
        value={viewMode}
        onChange={setViewMode}
        disabled={isMod}
        options={[
          { label: "Đang hoạt động", value: "active" },
          { label: "Thùng rác", value: "deleted" },
        ]}
      />
      <Input
        placeholder="Tìm tên môn..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        allowClear
        style={{ width: 300 }}
      />
      <Select
        placeholder="Khoa"
        value={categoryFilter}
        onChange={setCategoryFilter}
        allowClear
        showSearch
        optionFilterProp="label"
        style={{ width: 200 }}
        options={categories.map((category) => ({
          value: category.categoryId,
          label: category.categoryName,
        }))}
      />
    </Space>
  );

  return (
    <>
      <ManagementPageLayout
        title={
          <Space>
            <ReadOutlined /> Quản lý môn học
          </Space>
        }
        filters={filters}
        table={
          <Table
            columns={columns}
            dataSource={subjects}
            rowKey="subjectId"
            loading={loading}
            pagination={{ pageSize: 7 }}
            scroll={{ x: viewMode === "active" ? 840 : 1010 }}
            tableLayout="fixed"
            onChange={handleTableChange}
          />
        }
        onReload={() => fetchSubjects(searchText)}
        onAdd={
          (isAdmin || canAnySubject("SUBJECT", "CREATE")) &&
          viewMode === "active"
            ? openAddModal
            : undefined
        }
      />

      <SubjectFormModal
        mode="create"
        open={isAddModalOpen}
        onCancel={closeModal}
        onSuccess={refreshAndCloseModal}
      />

      <SubjectFormModal
        mode="edit"
        subjectId={subjectIdToUpdate}
        open={isUpdateModalOpen && Boolean(subjectIdToUpdate)}
        onCancel={closeModal}
        onSuccess={refreshAndCloseModal}
      />
    </>
  );
};
