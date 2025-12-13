import React, { useState, useEffect } from 'react';
import {
  Table, Button, Tag, Form, message, Space, Tooltip, Popconfirm,
} from 'antd';
import {
  DeleteOutlined,
  EyeOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { authAxios } from "../api/axiosConfig"; // Giả định đường dẫn này là đúng
import moment from 'moment';

// --- IMPORT CÁC COMPONENTS TÁCH RỜI ---
import ManagementPageLayout from '../layouts/ManagementPageLayout'; // <-- COMPONENT LAYOUT CHUNG
import CreateNotificationModal from '../components/modal/CreateNotificationModal';
import RecipientDetailModal from '../components/modal/RecipientDetailModal';

const NotificationManager = () => {

  // --- STATES DỮ LIỆU ---
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  // Sử dụng object để dễ dàng quản lý phân trang và thay đổi
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // States cho Modal Tạo mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [notificationType, setNotificationType] = useState('GLOBAL');

  // States cho Modal Chi tiết
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);



  // --- 1. LẤY DỮ LIỆU LỊCH SỬ ---
  const fetchCampaigns = async (page = 1) => {
    setLoading(true);
    try {
      const response = await authAxios.get(`/admin/notifications/campaigns`, {
        params: {
            page: page - 1,
            size: 10,
        }
      });
      setCampaigns(response.data.content);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: response.data.totalElements
      }));
    } catch (error) {
      message.error('Không thể tải danh sách thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // --- XỬ LÝ KHI GỬI THÔNG BÁO THÀNH CÔNG ---
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
    fetchCampaigns(1); // Làm mới trang đầu tiên
  };

  // --- 3. XỬ LÝ THU HỒI (XÓA) ---
  const handleRecall = async (id) => {
    try {
      await authAxios.delete(`/admin/notifications/history/${id}`);
      message.success('Đã thu hồi chiến dịch thông báo');
      fetchCampaigns(pagination.current);
    } catch (error) {
      message.error('Không thể thu hồi');
    }
  };

  // --- 4. XEM CHI TIẾT NGƯỜI NHẬN ---
  const handleViewRecipients = (historyId) => {
    setSelectedHistoryId(historyId);
    setIsDetailModalOpen(true);
  };

  // --- CẤU HÌNH CỘT CHO BẢNG (Giữ nguyên) ---
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
        return <Tag color={color}>{type}</Tag>;
      }
    },
    { title: 'Thời gian gửi', dataIndex: 'createdAt', render: (date) => moment(date).format('HH:mm DD/MM/YYYY') },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.sendType !== 'GLOBAL' && (
            <Tooltip title="Xem người nhận">
              <Button icon={<EyeOutlined /> } onClick={() => handleViewRecipients(record.id)} />
            </Tooltip>
          )}
          <Popconfirm
            title="Thu hồi thông báo này?"
            description="Hành động này sẽ xóa thông báo khỏi máy người dùng."
            onConfirm={() => handleRecall(record.id)}
            okText="Thu hồi" cancelText="Hủy" okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // --- ĐỊNH NGHĨA COMPONENTS CON CHO LAYOUT ---

  const notificationTable = (
    <Table
      columns={columns}
      dataSource={campaigns}
      rowKey="id"
      loading={loading}
      pagination={{
          ...pagination,
          onChange: (page) => {
              setPagination(prev => ({ ...prev, current: page }));
              fetchCampaigns(page);
          }
      }}
      scroll={{ x: 800 }}
    />
  );

  const pageTitle = (
    <Space>
      <MessageOutlined /> Quản lý thông báo
    </Space>
  );

  // --- RETURN SỬ DỤNG MANAGEMENTPAGELAYOUT ---
  return (
    <>
      <ManagementPageLayout
        title={pageTitle}
        table={notificationTable}
        onReload={() => fetchCampaigns(1)}
        onAdd={() => setIsCreateModalOpen(true)}
      />

      {/* --- MODALs VẪN ĐƯỢC GIỮ NGUYÊN BÊN NGOÀI LAYOUT --- */}
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