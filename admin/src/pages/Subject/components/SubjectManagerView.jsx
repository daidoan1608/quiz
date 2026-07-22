import React from "react";
import {
  Segmented,
  Space,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ReadOutlined,
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
      render: (text) => <AdminTableText>{text}</AdminTableText>,
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
          <AdminTableActions>
            <AdminActionButton
              title="Sửa môn học"
              variant="warning"
              icon={<EditOutlined />}
              disabled={!canOnSubject(record.subjectId, "SUBJECT", "UPDATE")}
              onClick={() => openUpdateModal(record.subjectId)}
            />
            <AdminConfirmAction
              buttonTitle="Chuyển vào thùng rác"
              confirmTitle="Chuyển môn học vào thùng rác?"
              description="Các chương, bài và câu hỏi thuộc môn này sẽ bị xóa theo cascade."
              onConfirm={() => deleteSubject(record.subjectId)}
              okText="Chuyển vào thùng rác"
              danger
              disabled={!canOnSubject(record.subjectId, "SUBJECT", "DELETE")}
              icon={<DeleteOutlined />}
            />
          </AdminTableActions>
        ) : (
          <AdminConfirmAction
            buttonTitle="Khôi phục"
            confirmTitle="Khôi phục môn học?"
            description="Chỉ khôi phục được khi khoa cha đang hoạt động."
            onConfirm={() => restoreSubject(record.subjectId)}
            okText="Khôi phục"
            variant="success"
            icon={<UndoOutlined />}
            disabled={!canOnSubject(record.subjectId, "SUBJECT", "UPDATE")}
          />
        ),
    },
  ];

  const filters = (
    <AdminFilterBar
      filters={
        <>
          <AdminSearchInput
            placeholder="Tìm tên môn..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <AdminFilterSelect
            placeholder="Khoa"
            value={categoryFilter}
            onChange={setCategoryFilter}
            showSearch
            optionFilterProp="label"
            options={categories.map((category) => ({
              value: category.categoryId,
              label: category.categoryName,
            }))}
          />
        </>
      }
      statusSwitch={
        <Segmented
          value={viewMode}
          onChange={setViewMode}
          disabled={isMod}
          options={[
            { label: "Đang hoạt động", value: "active" },
            { label: "Thùng rác", value: "deleted" },
          ]}
        />
      }
    />
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
          <AdminTable
            columns={columns}
            dataSource={subjects}
            rowKey="subjectId"
            loading={loading}
            pagination={{ pageSize: 7 }}
            scroll={{ x: viewMode === "active" ? 840 : 1010 }}
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
