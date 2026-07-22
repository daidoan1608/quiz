import React from "react";
import { Card, Space, Tag, Typography } from "antd";

const { Text } = Typography;

export function PermissionSummaryCards({
  badges,
  emptyGlobalText = "Chưa có quyền toàn hệ thống",
  emptyMenuText = "Chưa có menu nào",
  emptySubjectText = "Chưa có quyền theo môn",
  summary,
  title,
  titleIcon,
}) {
  const renderTags = (items, emptyText) =>
    items.length ? (
      items.map((item) => <Tag key={item}>{item}</Tag>)
    ) : (
      <Text type="secondary">{emptyText}</Text>
    );

  return (
    <Space className="permission-summary-cards" direction="vertical" size={8}>
      {title && (
        <Space className="permission-summary-cards__header" wrap>
          {titleIcon}
          <Text strong>{title}</Text>
          {badges}
        </Space>
      )}
      <Card size="small" title="Menu được thấy">
        {renderTags(summary.menus, emptyMenuText)}
      </Card>
      <Card size="small" title="Quyền toàn hệ thống">
        {renderTags(summary.globalResources, emptyGlobalText)}
      </Card>
      <Card size="small" title="Quyền theo môn">
        {summary.subjectResources.length ? (
          <Space className="permission-summary-cards__subjects" direction="vertical" size={8}>
            {summary.subjectResources.map((item) => (
              <div key={item.subject}>
                <Text strong>{item.subject}</Text>
                <div className="permission-summary-cards__tag-row">
                  {item.values.map((value) => (
                    <Tag key={value}>{value}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </Space>
        ) : (
          <Text type="secondary">{emptySubjectText}</Text>
        )}
      </Card>
    </Space>
  );
}
