import React, { useEffect, useState } from 'react';
import { Modal, Table, Tag, message } from 'antd';
import { authAxios } from "../../api/axiosConfig";

const recipientColumns = [
  { title: 'Tên sinh viên', dataIndex: 'fullName' },
  { title: 'Email', dataIndex: 'email' },
  { title: 'Trạng thái', dataIndex: 'read', render: (isRead) => isRead ? <Tag color="success">Đã xem</Tag> : <Tag color="default">Chưa xem</Tag> }
];

const RecipientDetailModal = ({ isModalOpen, onCancel, historyId }) => {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- LOGIC LẤY CHI TIẾT NGƯỜI NHẬN ---
  useEffect(() => {
    if (isModalOpen && historyId) {
      const fetchRecipients = async () => {
        setLoading(true);
        try {
          const response = await authAxios.get(`/admin/notifications/history/${historyId}/recipients`);
          setRecipients(response.data.content);
        } catch (error) {
          message.error('Lỗi tải danh sách người nhận');
          setRecipients([]);
        } finally {
          setLoading(false);
        }
      };
      fetchRecipients();
    }
  }, [isModalOpen, historyId]);

  return (
    <Modal
      title="Danh sách người nhận"
      open={isModalOpen}
      onCancel={onCancel}
      footer={null}
      width={700}
      centered
    >
      <Table
        dataSource={recipients}
        columns={recipientColumns}
        rowKey="userId"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />
    </Modal>
  );
};

export default RecipientDetailModal;