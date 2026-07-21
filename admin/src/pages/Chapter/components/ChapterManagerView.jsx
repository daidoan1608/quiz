import React from "react";
import {
  Button,
  Segmented,
  Space,
} from "antd";
import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
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
import { ChapterFormModal } from "./ChapterFormModal";

export const ChapterManagerView = ({
  chapters,
  categories,
  subjects,
  loading,
  searchText,
  setSearchText,
  viewMode,
  setViewMode,
  categoryFilter,
  changeCategoryFilter,
  subjectFilter,
  setSubjectFilter,
  isMod,
  isAddModalOpen,
  isUpdateModalOpen,
  chapterIdToUpdate,
  canCreateChapter,
  canOnSubject,
  getSortOrder,
  handleTableChange,
  fetchChapters,
  deleteChapter,
  restoreChapter,
  openAddModal,
  openUpdateModal,
  closeModal,
  refreshAndCloseModal,
}) => {
  const columns = [
    {
      title: "ID",
      dataIndex: "chapterId",
      key: "chapterId",
      width: 90,
      sorter: true,
      sortOrder: getSortOrder("chapterId"),
      render: (text) => <AdminTableText>{text}</AdminTableText>,
    },
    {
      title: "Tên chương",
      dataIndex: "name",
      key: "name",
      width: 360,
      ellipsis: true,
      sorter: true,
      sortOrder: getSortOrder("name"),
      render: (text) => <AdminTableText strong>{text}</AdminTableText>,
    },
    {
      title: "Mã môn",
      dataIndex: "subjectId",
      key: "subjectId",
      width: 120,
      sorter: true,
      sortOrder: getSortOrder("subjectId"),
      render: (text) => <AdminTableText>{text}</AdminTableText>,
    },
    {
      title: "Chương",
      dataIndex: "chapterNumber",
      key: "chapterNumber",
      width: 130,
      sorter: true,
      sortOrder: getSortOrder("chapterNumber"),
      render: (text) => <AdminTableText>{text}</AdminTableText>,
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
              title="Sửa chương"
              variant="warning"
              icon={<EditOutlined />}
              disabled={!canOnSubject(record.subjectId, "CHAPTER", "UPDATE")}
              onClick={() => openUpdateModal(record.chapterId)}
            />
            <AdminConfirmAction
              buttonTitle="Chuyển vào thùng rác"
              confirmTitle="Chuyển chương vào thùng rác?"
              description="Các câu hỏi đang hoạt động thuộc chương này sẽ bị xóa mềm theo cascade."
              onConfirm={() => deleteChapter(record.chapterId)}
              okText="Chuyển vào thùng rác"
              danger
              disabled={!canOnSubject(record.subjectId, "CHAPTER", "DELETE")}
              icon={<DeleteOutlined />}
            />
          </AdminTableActions>
        ) : (
          <AdminConfirmAction
            buttonTitle="Khôi phục"
            confirmTitle="Khôi phục chương?"
            description="Chỉ khôi phục được khi môn cha đang hoạt động."
            onConfirm={() => restoreChapter(record.chapterId)}
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
        placeholder="Tìm tên chương..."
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
      />
      <AdminFilterSelect
        placeholder="Khoa"
        value={categoryFilter}
        onChange={changeCategoryFilter}
        showSearch
        optionFilterProp="label"
        options={categories.map((category) => ({
          value: category.categoryId,
          label: category.categoryName,
        }))}
      />
      <AdminFilterSelect
        placeholder="Môn học"
        value={subjectFilter}
        onChange={setSubjectFilter}
        showSearch
        optionFilterProp="label"
        options={subjects.map((subject) => ({
          value: subject.subjectId,
          label: subject.name,
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
            <BookOutlined /> Quản lý chương
          </Space>
        }
        filters={filters}
        table={
          <AdminTable
            columns={columns}
            dataSource={chapters}
            rowKey="chapterId"
            loading={loading}
            pagination={{ pageSize: 7 }}
            scroll={{ x: viewMode === "active" ? 830 : 1000 }}
            onChange={handleTableChange}
          />
        }
        onReload={() => fetchChapters(searchText)}
        onAdd={canCreateChapter ? openAddModal : undefined}
      />

      <ChapterFormModal
        mode="create"
        open={isAddModalOpen}
        onCancel={closeModal}
        onSuccess={refreshAndCloseModal}
      />

      <ChapterFormModal
        mode="edit"
        chapterId={chapterIdToUpdate}
        open={isUpdateModalOpen && Boolean(chapterIdToUpdate)}
        onCancel={closeModal}
        onSuccess={refreshAndCloseModal}
      />
    </>
  );
};
