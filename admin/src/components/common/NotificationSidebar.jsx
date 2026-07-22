import React from "react";
import { Alert, Badge, Button, Drawer, List, Space, Tag, Typography } from "antd";
import {
  AuditOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useAdminAlerts } from "../../hooks/useAdminAlerts";
import AdminEmptyState from "./states/AdminEmptyState";
import AdminLoadingState from "./states/AdminLoadingState";
import { formatAlertTime, getBadgeStatus } from "../../utils/adminAlerts/adminAlertBuilders";

const { Text, Title } = Typography;

const alertIcons = {
  database: <DatabaseOutlined />,
  exception: <ExclamationCircleOutlined />,
  fileExcel: <FileExcelOutlined />,
  fileText: <FileTextOutlined />,
  user: <UserOutlined />,
  warning: <WarningOutlined />,
};

export const NotificationSidebar = ({ isOpen, onClose, onCountChange }) => {
  const {
    dismissAlert,
    dismissAllVisibleAlerts,
    groupedAlerts,
    loading,
    visibleAlerts,
  } = useAdminAlerts({ isOpen, onCountChange });

  return (
    <Drawer
      title={
        <Space>
          <SafetyCertificateOutlined />
          <span>Cảnh báo quản trị</span>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={isOpen}
      width={430}
      className="admin-notification-drawer"
      styles={{ body: { padding: 0 } }}
      extra={
        visibleAlerts.length > 0 ? (
          <Space>
            <Tag color="red">{visibleAlerts.length} cảnh báo</Tag>
            <Button size="small" icon={<CheckOutlined />} onClick={dismissAllVisibleAlerts}>
              Đã xử lý
            </Button>
          </Space>
        ) : (
          <Tag color="success">Ổn định</Tag>
        )
      }
    >
      <div className="admin-notification-drawer__body">
        <Alert
          className="admin-notification-drawer__intro"
          type="info"
          showIcon
          icon={<AuditOutlined />}
          message="Tổng hợp từ dữ liệu quản trị hiện có"
          description="Bao gồm audit log, câu hỏi, đề thi và trạng thái người dùng. Không hiển thị thông báo giả."
        />

        {loading ? (
          <AdminLoadingState skeleton rows={4} />
        ) : visibleAlerts.length === 0 ? (
          <AdminEmptyState description="Chưa có cảnh báo cần xử lý" />
        ) : (
          Object.entries(groupedAlerts).map(([group, items]) => (
            <div className="admin-notification-group" key={group}>
              <Title className="admin-notification-group__title" level={5}>
                {group}
              </Title>
              <List
                itemLayout="horizontal"
                dataSource={items}
                renderItem={(item) => (
                  <List.Item
                    className="admin-notification-item"
                    onClick={() => dismissAlert(item.id)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge status={getBadgeStatus(item.level)}>
                          <span
                            className={`admin-notification-item__icon admin-notification-item__icon--${item.level}`}
                          >
                            {alertIcons[item.iconType] || <WarningOutlined />}
                          </span>
                        </Badge>
                      }
                      title={<Text strong>{item.title}</Text>}
                      description={
                        <Space direction="vertical" size={4}>
                          <Text type="secondary">{item.description}</Text>
                          <Text className="admin-notification-item__meta" type="secondary">
                            <ClockCircleOutlined /> {formatAlertTime(item.time)}
                          </Text>
                          <Text className="admin-notification-item__meta" type="secondary">
                            Bấm để đánh dấu đã xử lý
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          ))
        )}
      </div>
    </Drawer>
  );
};
