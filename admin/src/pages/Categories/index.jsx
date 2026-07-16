import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Input,
  Popconfirm,
  Segmented,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  AppstoreOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { categoryApi } from '../../api/services';
import ManagementPageLayout from '../../layouts/ManagementPageLayout';
import AddCategoryModal from '../../components/Modal/AddCategoryModal';
import UpdateCategoryModal from '../../components/Modal/UpdateCategoryModal';
import SubjectListModal from '../../components/Modal/SubjectListModal';

const { Text } = Typography;

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState('active');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isSubjectListModalOpen, setIsSubjectListModalOpen] = useState(false);
  const [categoryIdToViewSubjects, setCategoryIdToViewSubjects] =
    useState(null);
  const [categoryNameToViewSubjects, setCategoryNameToViewSubjects] =
    useState(null);

  const isAdmin = localStorage.getItem('role') === 'ADMIN';

  const fetchCategories = useCallback(
    async (keyword = searchText) => {
      setLoading(true);
      try {
        const trimmedKeyword = keyword.trim();
        const data =
          viewMode === 'deleted'
            ? await categoryApi.getDeleted()
            : trimmedKeyword
              ? await categoryApi.search(trimmedKeyword)
              : await categoryApi.getAll();
        setCategories(data);
      } catch (error) {
        message.error(
          error.response?.data?.message || 'Không thể tải danh sách khoa.'
        );
      } finally {
        setLoading(false);
      }
    },
    [searchText, viewMode]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchCategories(searchText), 400);
    return () => clearTimeout(timeoutId);
  }, [searchText, viewMode, fetchCategories]);

  const handleDelete = async (categoryId) => {
    if (!isAdmin) return message.warning('Chỉ Admin mới được xóa khoa.');
    try {
      await categoryApi.remove(categoryId);
      message.success('Đã chuyển khoa vào thùng rác.');
      fetchCategories();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể xóa khoa.');
    }
  };

  const handleRestore = async (categoryId) => {
    try {
      await categoryApi.restore(categoryId);
      message.success('Khôi phục khoa thành công.');
      fetchCategories();
    } catch (error) {
      message.error(
        error.response?.data?.message || 'Không thể khôi phục khoa.'
      );
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsUpdateModalOpen(false);
    setSelectedCategoryId(null);
    setIsSubjectListModalOpen(false);
    setCategoryIdToViewSubjects(null);
    setCategoryNameToViewSubjects(null);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 90,
      sorter: (a, b) => a.categoryId - b.categoryId,
    },
    {
      title: 'Tên khoa',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'categoryDescription',
      key: 'categoryDescription',
      render: (text) => text || <Text type="secondary">Không có mô tả</Text>,
    },
    ...(viewMode === 'deleted'
      ? [
          {
            title: 'Xóa lúc',
            dataIndex: 'deletedAt',
            key: 'deletedAt',
            width: 180,
            render: (value) => value || '-',
          },
          {
            title: 'Nguồn xóa',
            dataIndex: 'deleteOriginType',
            key: 'deleteOriginType',
            width: 120,
            render: (value) => value || '-',
          },
        ]
      : []),
    {
      title: 'Hành động',
      key: 'action',
      width: viewMode === 'active' ? 180 : 90,
      fixed: 'right',
      render: (_, record) =>
        viewMode === 'active' ? (
          <Space>
            <Tooltip title="Xem môn học">
              <Button
                className="action-btn"
                icon={<UnorderedListOutlined />}
                onClick={() => {
                  setCategoryIdToViewSubjects(record.categoryId);
                  setCategoryNameToViewSubjects(record.categoryName);
                  setIsSubjectListModalOpen(true);
                }}
              />
            </Tooltip>
            <Tooltip title={!isAdmin ? 'Chỉ Admin mới được sửa' : 'Sửa khoa'}>
              <Button
                className="action-btn is-primary"
                icon={<EditOutlined />}
                disabled={!isAdmin}
                onClick={() => {
                  setSelectedCategoryId(record.categoryId);
                  setIsUpdateModalOpen(true);
                }}
              />
            </Tooltip>
            <Popconfirm
              title="Chuyển khoa vào thùng rác?"
              description="Các môn, chương, đề và câu hỏi đang hoạt động bên dưới sẽ bị xóa mềm theo cascade."
              onConfirm={() => handleDelete(record.categoryId)}
              okText="Chuyển vào thùng rác"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              disabled={!isAdmin}
            >
              <Button
                className="action-btn is-danger"
                icon={<DeleteOutlined />}
                disabled={!isAdmin}
              />
            </Popconfirm>
          </Space>
        ) : (
          <Popconfirm
            title="Khôi phục khoa?"
            description="Các bản ghi con có cùng cascade id sẽ được khôi phục theo."
            onConfirm={() => handleRestore(record.categoryId)}
            okText="Khôi phục"
            cancelText="Hủy"
          >
            <Button
              className="action-btn is-success"
              icon={<UndoOutlined />}
              disabled={!isAdmin}
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
        options={[
          { label: 'Đang hoạt động', value: 'active' },
          { label: 'Thùng rác', value: 'deleted' },
        ]}
      />
      <Input
        placeholder="Tìm tên khoa..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        disabled={viewMode === 'deleted'}
        allowClear
        style={{ width: 300 }}
      />
    </Space>
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
          <Table
            columns={columns}
            dataSource={categories}
            rowKey="categoryId"
            loading={loading}
            pagination={{ pageSize: 7 }}
            scroll={{ x: 760 }}
          />
        }
        onReload={() => fetchCategories(searchText)}
        onAdd={
          isAdmin && viewMode === 'active'
            ? () => setIsAddModalOpen(true)
            : undefined
        }
      />

      <AddCategoryModal
        isModalOpen={isAddModalOpen}
        onCancel={handleCloseModal}
        onSuccess={() => {
          fetchCategories();
          handleCloseModal();
        }}
      />

      {selectedCategoryId && (
        <UpdateCategoryModal
          isModalOpen={isUpdateModalOpen}
          onCancel={handleCloseModal}
          onSuccess={() => {
            fetchCategories();
            handleCloseModal();
          }}
          categoryId={selectedCategoryId}
        />
      )}

      {categoryIdToViewSubjects && (
        <SubjectListModal
          isModalOpen={isSubjectListModalOpen}
          onCancel={handleCloseModal}
          categoryId={categoryIdToViewSubjects}
          categoryName={categoryNameToViewSubjects}
          selectionMode={false}
        />
      )}
    </>
  );
}
