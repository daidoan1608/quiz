import React from 'react';
import { Modal, Table } from 'antd';
import { RECIPIENT_COLUMNS } from "../constants";
import { useNotificationRecipients } from "../hooks/useNotificationRecipients";

const RecipientDetailModal = ({ isModalOpen, onCancel, historyId }) => {
  const { loading, recipients } = useNotificationRecipients({ isModalOpen, historyId });

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
        columns={RECIPIENT_COLUMNS}
        rowKey="userId"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />
    </Modal>
  );
};

export default RecipientDetailModal;
