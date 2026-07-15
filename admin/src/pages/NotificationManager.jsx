import React, { useEffect, useState } from 'react';
import {
  Table, Button, Tag, Form, message, Space, Tooltip, Popconfirm, Input, Select, DatePicker,
} from 'antd';
import {
  DeleteOutlined,
  EyeOutlined,
  MessageOutlined,
  SearchOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { authAxios } from "../api/axiosConfig";
import moment from 'moment';

import ManagementPageLayout from '../layouts/ManagementPageLayout';
import CreateNotificationModal from '../components/Modal/CreateNotificationModal';
import RecipientDetailModal from '../components/Modal/RecipientDetailModal';

const { RangePicker } = DatePicker;

const NotificationManager = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({});

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [notificationType, setNotificationType] = useState('GLOBAL');

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  const fetchCampaigns = async (page = 1, nextFilters = filters) => {
    setLoading(true);
    try {
      const params = {
        page: page - 1,
        size: pagination.pageSize,
        keyword: nextFilters.keyword || undefined,
        sendType: nextFilters.sendType || undefined,
        createdBy: nextFilters.createdBy || undefined,
        fromDate: nextFilters.fromDate,
        toDate: nextFilters.toDate,
      };
      const response = await authAxios.get('/admin/notifications/campaigns', { params });
      setCampaigns(response.data.content);
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: response.data.totalElements,
      }));
    } catch (error) {
      message.error('Không thể tải danh sách thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns(1, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (values) => {
    const nextFilters = {
      keyword: values.keyword?.trim(),
      sendType: values.sendType,
      createdBy: values.createdBy?.trim(),
      fromDate: values.dateRange?.[0]?.startOf('day').toISOString(),
      toDate: values.dateRange?.[1]?.endOf('day').toISOString(),
    };
    setFilters(nextFilters);
    fetchCampaigns(1, nextFilters);
  };

  const handleClearFilters = () => {
    filterForm.resetFields();
    setFilters({});
    fetchCampaigns(1, {});
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
    fetchCampaigns(1);
  };

  const handleRecall = async (id) => {
    try {
      await authAxios.delete(`/admin/notifications/history/${id}`);
      message.success('Đã thu hồi chiến dịch thông báo');
      fetchCampaigns(pagination.current);
    } catch (error) {
      message.error('Không thể thu hồi');
    }
  };

  const handleViewRecipients = (historyId) => {
    setSelectedHistoryId(historyId);
    setIsDetailModalOpen(true);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Tiêu đề', dataIndex: 'title', render: (text) => <span style={{ fontWeight: 500 }}>{text}</span> },
    {
      title: 'Loại gửi',
      dataIndex: 'sendType',
      render: (type) => {
        let color = 'blue';
        if (type === 'GLOBAL') color = 'red';
        if (type && type.includes('SUBJECT')) color = 'green';
        if (type === 'PERSONAL') color = 'purple';
        if (type === 'BATCH') color = 'cyan';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    { title: 'Người tạo', dataIndex: 'createdBy', render: (value) => value || '-' },
    { title: 'Thời gian gửi', dataIndex: 'createdAt', render: (date) => moment(date).format('HH:mm DD/MM/YYYY') },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.sendType !== 'GLOBAL' && (
            <Tooltip title="Xem người nhận">
              <Button className="action-btn" icon={<EyeOutlined />} onClick={() => handleViewRecipients(record.id)} />
            </Tooltip>
          )}
          <Popconfirm
            title="Thu hồi thông báo này?"
            description="Hành động này sẽ xóa thông báo khỏi máy người dùng."
            onConfirm={() => handleRecall(record.id)}
            okText="Thu hồi"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button className="action-btn is-danger" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const notificationFilters = (
    <Form form={filterForm} layout="inline" onFinish={handleFilter}>
      <Form.Item name="keyword">
        <Input allowClear placeholder="Tìm tiêu đề/nội dung" prefix={<SearchOutlined />} />
      </Form.Item>
      <Form.Item name="sendType">
        <Select allowClear placeholder="Loại gửi" style={{ width: 180 }}>
          <Select.Option value="GLOBAL">Toàn hệ thống</Select.Option>
          <Select.Option value="PERSONAL">Cá nhân</Select.Option>
          <Select.Option value="BATCH">Danh sách</Select.Option>
          <Select.Option value="SUBJECT_ID">Theo môn học</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="createdBy">
        <Input allowClear placeholder="User ID người tạo" style={{ width: 240 }} />
      </Form.Item>
      <Form.Item name="dateRange">
        <RangePicker format="DD/MM/YYYY" />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button htmlType="submit" icon={<SearchOutlined />}>Lọc</Button>
          <Button icon={<ClearOutlined />} onClick={handleClearFilters}>Xóa lọc</Button>
        </Space>
      </Form.Item>
    </Form>
  );

  const notificationTable = (
    <Table
      columns={columns}
      dataSource={campaigns}
      rowKey="id"
      loading={loading}
      pagination={{
        ...pagination,
        onChange: (page) => fetchCampaigns(page),
      }}
      scroll={{ x: 1000 }}
    />
  );

  const pageTitle = (
    <Space>
      <MessageOutlined /> Quản lý thông báo
    </Space>
  );

  return (
    <>
      <ManagementPageLayout
        title={pageTitle}
        filters={notificationFilters}
        table={notificationTable}
        onReload={() => fetchCampaigns(1)}
        onAdd={() => setIsCreateModalOpen(true)}
      />

      <CreateNotificationModal
        isModalOpen={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        createForm={createForm}
        notificationType={notificationType}
        setNotificationType={setNotificationType}
      />

      <RecipientDetailModal
        isModalOpen={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setSelectedHistoryId(null);
        }}
        historyId={selectedHistoryId}
      />
    </>
  );
};

export default NotificationManager;
