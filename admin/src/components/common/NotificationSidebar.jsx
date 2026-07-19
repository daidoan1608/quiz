import React from "react";
import { Alert, Badge, Button, Drawer, Empty, List, Space, Spin, Tag, Typography, theme } from "antd";
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
  const { token } = theme.useToken();
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
      styles={{ body: { padding: 0, background: token.colorBgLayout } }}
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
      <Spin spinning={loading}>
        <div style={{ padding: 18 }}>
          <Alert
            type="info"
            showIcon
            icon={<AuditOutlined />}
            message="Tổng hợp từ dữ liệu quản trị hiện có"
            description="Bao gồm audit log, câu hỏi, đề thi và trạng thái người dùng. Không hiển thị thông báo giả."
            style={{ marginBottom: 16 }}
          />

          {!loading && visibleAlerts.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có cảnh báo cần xử lý" />
          ) : (
            Object.entries(groupedAlerts).map(([group, items]) => (
              <div key={group} style={{ marginBottom: 18 }}>
                <Title level={5} style={{ margin: "0 0 10px" }}>
                  {group}
                </Title>
                <List
                  itemLayout="horizontal"
                  dataSource={items}
                  renderItem={(item) => (
                    <List.Item
                      onClick={() => dismissAlert(item.id)}
                      style={{
                        padding: "12px 14px",
                        marginBottom: 10,
                        borderRadius: 12,
                        border: `1px solid ${token.colorBorderSecondary}`,
                        background: token.colorBgContainer,
                        cursor: "pointer",
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge status={getBadgeStatus(item.level)}>
                            <span
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 12,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color:
                                  item.level === "error"
                                    ? token.colorError
                                    : item.level === "warning"
                                      ? token.colorWarning
                                      : token.colorPrimary,
                                background:
                                  item.level === "error"
                                    ? token.colorErrorBg
                                    : item.level === "warning"
                                      ? token.colorWarningBg
                                      : token.colorPrimaryBg,
                              }}
                            >
                              {alertIcons[item.iconType] || <WarningOutlined />}
                            </span>
                          </Badge>
                        }
                        title={<Text strong>{item.title}</Text>}
                        description={
                          <Space direction="vertical" size={4}>
                            <Text type="secondary">{item.description}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              <ClockCircleOutlined /> {formatAlertTime(item.time)}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
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
      </Spin>
    </Drawer>
  );
};
