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
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import ManagementPageLayout from "../../../layouts/ManagementPageLayout";
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
      render: (text) => (
        <AdminTableText type="secondary">{text}</AdminTableText>
      ),
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
      render: (text) => <AdminTableText code>{text}</AdminTableText>,
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
          <Space>
            <Button
              className="action-btn is-primary"
              icon={<EditOutlined />}
              disabled={!canOnSubject(record.subjectId, "CHAPTER", "UPDATE")}
              onClick={() => openUpdateModal(record.chapterId)}
            />
            <Popconfirm
              title="Chuyển chương vào thùng rác?"
              description="Các câu hỏi đang hoạt động thuộc chương này sẽ bị xóa mềm theo cascade."
              onConfirm={() => deleteChapter(record.chapterId)}
              okText="Chuyển vào thùng rác"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              disabled={!canOnSubject(record.subjectId, "CHAPTER", "DELETE")}
            >
              <Button
                className="action-btn is-danger"
                icon={<DeleteOutlined />}
                disabled={!canOnSubject(record.subjectId, "CHAPTER", "DELETE")}
              />
            </Popconfirm>
          </Space>
        ) : (
          <Popconfirm
            title="Khôi phục chương?"
            description="Chỉ khôi phục được khi môn cha đang hoạt động."
            onConfirm={() => restoreChapter(record.chapterId)}
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
        onChange={setViewMode}
        disabled={isMod}
        options={[
          { label: "Đang hoạt động", value: "active" },
          { label: "Thùng rác", value: "deleted" },
        ]}
      />
      <Input
        placeholder="Tìm tên chương..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        allowClear
        style={{ width: 300 }}
      />
      <Select
        placeholder="Khoa"
        value={categoryFilter}
        onChange={changeCategoryFilter}
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
        value={subjectFilter}
        onChange={setSubjectFilter}
        allowClear
        showSearch
        optionFilterProp="label"
        style={{ width: 200 }}
        options={subjects.map((subject) => ({
          value: subject.subjectId,
          label: subject.name,
        }))}
      />
    </Space>
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
          <Table
            columns={columns}
            dataSource={chapters}
            rowKey="chapterId"
            loading={loading}
            pagination={{ pageSize: 7 }}
            scroll={{ x: viewMode === "active" ? 830 : 1000 }}
            tableLayout="fixed"
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
