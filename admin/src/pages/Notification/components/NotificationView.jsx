import React from "react";
import { Button, Space, Tag } from "antd";
import { DeleteOutlined, EyeOutlined, MessageOutlined } from "@ant-design/icons";
import moment from "moment";
import ManagementPageLayout from "../../../layouts/ManagementPageLayout";
import AdminTable from "../../../components/common/table/AdminTable";
import {
  AdminActionButton,
  AdminConfirmAction,
  AdminTableActions,
} from "../../../components/common/table/AdminTableActions";
import AdminTableText from "../../../components/common/table/AdminTableText";
import { ADMIN_DATE_TIME_FORMAT } from "../../../utils/dateFormatters";
import CreateNotificationModal from "./CreateNotificationModal";
import { NotificationFilters } from "./NotificationFilters";
import RecipientDetailModal from "./RecipientDetailModal";

const sendTypeColor = (type) => {
  if (type === "GLOBAL") return "red";
  if (type && type.includes("SUBJECT")) return "green";
  if (type === "PERSONAL") return "purple";
  if (type === "BATCH") return "cyan";
  return "blue";
};

export const NotificationView = ({
  campaigns,
  loading,
  pagination,
  isMod,
  canSendGlobal,
  canSendSubject,
  canSendPersonal,
  canViewRecipients,
  canRecall,
  isCreateModalOpen,
  setIsCreateModalOpen,
  createForm,
  filterForm,
  notificationType,
  setNotificationType,
  isDetailModalOpen,
  selectedHistoryId,
  fetchCampaigns,
  handleFilter,
  clearFilters,
  createSuccess,
  recallCampaign,
  viewRecipients,
  closeRecipients,
  openCreateModal,
  handleTableChange,
  getSortOrder,
}) => {
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: true,
      sortOrder: getSortOrder("id"),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 280,
      ellipsis: true,
      sorter: true,
      sortOrder: getSortOrder("title"),
      render: (text) => <AdminTableText strong>{text}</AdminTableText>,
    },
    {
      title: "Loại gửi",
      dataIndex: "sendType",
      key: "sendType",
      width: 150,
      sorter: true,
      sortOrder: getSortOrder("sendType"),
      render: (type) => <Tag color={sendTypeColor(type)}>{type}</Tag>,
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 240,
      ellipsis: true,
      sorter: true,
      sortOrder: getSortOrder("createdBy"),
      render: (value) => <AdminTableText>{value}</AdminTableText>,
    },
    {
      title: "Thời gian gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      sorter: true,
      sortOrder: getSortOrder("createdAt"),
      render: (date) => moment(date).format(ADMIN_DATE_TIME_FORMAT),
    },
    {
      title: "Hành động",
      key: "action",
      width: 130,
      fixed: "right",
      render: (_, record) => (
        <AdminTableActions>
          {record.sendType !== "GLOBAL" && canViewRecipients && (
            <AdminActionButton
              title="Xem người nhận"
              icon={<EyeOutlined />}
              onClick={() => viewRecipients(record.id)}
            />
          )}
          {canRecall && (
            <AdminConfirmAction
              buttonTitle="Thu hồi"
              confirmTitle="Thu hồi thông báo này?"
              description="Hành động này sẽ xóa thông báo khỏi máy người dùng."
              onConfirm={() => recallCampaign(record.id)}
              okText="Thu hồi"
              danger
              icon={<DeleteOutlined />}
            />
          )}
        </AdminTableActions>
      ),
    },
  ];

  return (
    <>
      <ManagementPageLayout
        title={
          <Space>
            <MessageOutlined /> Quản lý thông báo
          </Space>
        }
        filters={
          <NotificationFilters
            filterForm={filterForm}
            isMod={isMod}
            canSendGlobal={canSendGlobal}
            canSendSubject={canSendSubject}
            canSendPersonal={canSendPersonal}
            handleFilter={handleFilter}
            clearFilters={clearFilters}
          />
        }
        table={
          <AdminTable
            columns={columns}
            dataSource={campaigns}
            rowKey="id"
            loading={loading}
            pagination={{ ...pagination }}
            scroll={{ x: 1060 }}
            onChange={handleTableChange}
          />
        }
        onReload={() => fetchCampaigns(1)}
        onAdd={openCreateModal}
      />

      <CreateNotificationModal
        isModalOpen={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={createSuccess}
        createForm={createForm}
        notificationType={notificationType}
        setNotificationType={setNotificationType}
      />

      <RecipientDetailModal
        isModalOpen={isDetailModalOpen}
        onCancel={closeRecipients}
        historyId={selectedHistoryId}
      />
    </>
  );
};
