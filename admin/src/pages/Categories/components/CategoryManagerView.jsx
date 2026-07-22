import React from "react";
import { Space } from "antd";
import {
  AppstoreOutlined,
  DeleteOutlined,
  EditOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import ManagementPageLayout from "../../../layouts/ManagementPageLayout";
import {
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
import { CategoryFormModal } from "./CategoryFormModal";

export const CategoryManagerView = ({
  categories,
  loading,
  searchText,
  setSearchText,
  viewMode,
  setViewMode,
  isAdmin,
  isAddModalOpen,
  isUpdateModalOpen,
  selectedCategoryId,
  getSortOrder,
  handleTableChange,
  fetchCategories,
  deleteCategory,
  restoreCategory,
  openAddModal,
  openUpdateModal,
  closeModal,
  refreshAndCloseModal,
}) => {
  const columns = [
    {
      title: "ID",
      dataIndex: "categoryId",
      key: "categoryId",
      width: 90,
      sorter: true,
      sortOrder: getSortOrder("categoryId"),
    },
    {
      title: "Tên khoa",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 260,
      ellipsis: true,
      sorter: true,
      sortOrder: getSortOrder("categoryName"),
      render: (text) => <AdminTableText strong>{text}</AdminTableText>,
    },
    {
      title: "Mô tả",
      dataIndex: "categoryDescription",
      key: "categoryDescription",
      width: 380,
      ellipsis: true,
      sorter: true,
      sortOrder: getSortOrder("categoryDescription"),
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
              title={!isAdmin ? "Chỉ Admin mới được sửa" : "Sửa khoa"}
              variant="warning"
              icon={<EditOutlined />}
              disabled={!isAdmin}
              onClick={() => openUpdateModal(record.categoryId)}
            />
            <AdminConfirmAction
              buttonTitle="Chuyển vào thùng rác"
              confirmTitle="Chuyển khoa vào thùng rác?"
              description="Các môn, chương, đề và câu hỏi đang hoạt động bên dưới sẽ bị xóa mềm theo cascade."
              onConfirm={() => deleteCategory(record.categoryId)}
              okText="Chuyển vào thùng rác"
              danger
              disabled={!isAdmin}
              icon={<DeleteOutlined />}
            />
          </AdminTableActions>
        ) : (
          <AdminConfirmAction
            buttonTitle="Khôi phục"
            confirmTitle="Khôi phục khoa?"
            description="Các bản ghi con có cùng cascade id sẽ được khôi phục theo."
            onConfirm={() => restoreCategory(record.categoryId)}
            okText="Khôi phục"
            variant="success"
            icon={<UndoOutlined />}
            disabled={!isAdmin}
          />
        ),
    },
  ];

  const filters = (
    <AdminFilterBar
      filters={
        <AdminSearchInput
          placeholder="Tìm tên khoa..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      }
      statusSwitch={
        <AdminStatusSegmented
          value={viewMode}
          onChange={setViewMode}
        />
      }
    />
  );

  return (
    <>
      <ManagementPageLayout
        title={
          <Space>
            <AppstoreOutlined /> Quản lý khoa
          </Space>
        }
        filters={filters}
        table={
          <AdminTable
            columns={columns}
            dataSource={categories}
            rowKey="categoryId"
            loading={loading}
            pagination={{ pageSize: 7 }}
            scroll={{ x: viewMode === "active" ? 860 : 1030 }}
            onChange={handleTableChange}
          />
        }
        onReload={() => fetchCategories(searchText)}
        onAdd={isAdmin && viewMode === "active" ? openAddModal : undefined}
      />

      <CategoryFormModal
        mode="create"
        open={isAddModalOpen}
        onCancel={closeModal}
        onSuccess={refreshAndCloseModal}
      />

      <CategoryFormModal
        mode="edit"
        categoryId={selectedCategoryId}
        open={isUpdateModalOpen && Boolean(selectedCategoryId)}
        onCancel={closeModal}
        onSuccess={refreshAndCloseModal}
      />
    </>
  );
};
