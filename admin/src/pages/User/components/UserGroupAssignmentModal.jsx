import React from 'react';
import { Button, Card, Checkbox, Collapse, Empty, List, Modal, Space, Spin, Table, Tag, Typography, theme } from 'antd';
import { SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons';
import { useUserGroupAssignment } from '../hooks/useUserGroupAssignment';

const { Text } = Typography;

export default function UserGroupAssignmentModal({ isModalOpen, onCancel, user, onSuccess }) {
  const { token } = theme.useToken();
  const {
    groups,
    groupPermissions,
    selectedGroupIds,
    setSelectedGroupIds,
    loading,
    saving,
    selectedPermissions,
    previewRows,
    selectedGroups,
    selectedSubjectCount,
    selectedMenuCount,
    summary,
    save,
  } = useUserGroupAssignment({ isModalOpen, user, onCancel, onSuccess });

  return (
    <Modal
      title={
        <Space>
          <TeamOutlined />
          <span>Gán nhóm quyền{user ? ` - ${user.fullName || user.username}` : ''}</span>
        </Space>
      }
      open={isModalOpen}
      onCancel={onCancel}
      width={1120}
      style={{ top: 32 }}
      footer={[
        <Button key="cancel" onClick={onCancel}>Đóng</Button>,
        <Button key="save" type="primary" loading={saving} onClick={save}>Lưu nhóm quyền</Button>,
      ]}
    >
      <Spin spinning={loading}>
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <Space wrap>
            <Tag color="blue">{selectedGroups.length} nhóm đã chọn</Tag>
            <Tag color="green">{selectedPermissions.length} quyền hiệu lực</Tag>
            <Tag>{selectedSubjectCount} môn có quyền</Tag>
            <Tag>{selectedMenuCount} menu</Tag>
          </Space>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 0.95fr) minmax(420px, 1.05fr)', gap: 16, alignItems: 'start' }}>
            <section>
              <Space style={{ marginBottom: 10 }}>
                <SafetyCertificateOutlined />
                <Text strong>Chọn nhóm quyền</Text>
              </Space>
              {groups.length === 0 ? (
                <Empty description="Chưa có nhóm quyền đang kích hoạt" />
              ) : (
                <Checkbox.Group
                  value={selectedGroupIds}
                  onChange={setSelectedGroupIds}
                  style={{ width: '100%' }}
                >
                  <List
                    dataSource={groups}
                    renderItem={(group) => {
                      const permissionCount = groupPermissions[group.id]?.length || 0;
                      return (
                        <List.Item style={{ padding: '6px 0' }}>
                          <div
                            style={{
                              border: `1px solid ${selectedGroupIds.includes(group.id) ? token.colorPrimaryBorder : token.colorBorder}`,
                              borderRadius: 8,
                              padding: 12,
                              width: '100%',
                              background: selectedGroupIds.includes(group.id) ? token.colorPrimaryBg : token.colorBgContainer,
                              color: token.colorText,
                            }}
                          >
                            <Checkbox value={group.id}>
                              <Space direction="vertical" size={2}>
                                <Space wrap>
                                  <Text strong>{group.name}</Text>
                                  <Tag>{group.code}</Tag>
                                  {group.systemManaged && <Tag color="gold">SYSTEM</Tag>}
                                </Space>
                                <Text type="secondary">{group.description || 'Không có mô tả'}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {permissionCount} quyền trong nhóm
                                </Text>
                              </Space>
                            </Checkbox>
                          </div>
                        </List.Item>
                      );
                    }}
                  />
                </Checkbox.Group>
              )}
            </section>

            <section>
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <Text strong>Người dùng sẽ có quyền</Text>
                <Card size="small" title="Menu được thấy">
                  {summary.menus.length ? summary.menus.map((item) => <Tag key={item}>{item}</Tag>) : <Text type="secondary">Chưa có menu nào</Text>}
                </Card>
                <Card size="small" title="Quyền toàn hệ thống">
                  {summary.globalResources.length ? summary.globalResources.map((item) => <Tag key={item}>{item}</Tag>) : <Text type="secondary">Chưa có quyền toàn hệ thống</Text>}
                </Card>
                <Card size="small" title="Quyền theo môn">
                  {summary.subjectResources.length ? (
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      {summary.subjectResources.map((item) => (
                        <div key={item.subject}>
                          <Text strong>{item.subject}</Text>
                          <div style={{ marginTop: 4 }}>
                            {item.values.map((value) => <Tag key={value}>{value}</Tag>)}
                          </div>
                        </div>
                      ))}
                    </Space>
                  ) : (
                    <Text type="secondary">Chưa có quyền theo môn</Text>
                  )}
                </Card>
                <Collapse
                  items={[
                    {
                      key: 'technical',
                      label: 'Chi tiết kỹ thuật',
                      children: (
                        <Table
                          size="small"
                          rowKey="key"
                          dataSource={previewRows}
                          pagination={{ pageSize: 6 }}
                          columns={[
                            { title: 'Phạm vi', dataIndex: 'scope', width: 240 },
                            { title: 'Chức năng', dataIndex: 'resource', width: 190 },
                            { title: 'Quyền', dataIndex: 'action', width: 160 },
                          ]}
                        />
                      ),
                    },
                  ]}
                />
              </Space>
            </section>
          </div>
        </Space>
      </Spin>
    </Modal>
  );
}
