import React from 'react';
import { Checkbox, Collapse, List, Modal, Space, Table, Tag, Typography } from 'antd';
import { SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons';
import { useUserGroupAssignment } from '../hooks/useUserGroupAssignment';
import { buildAdminModalFooter } from '../../../components/common/forms/AdminFormActions';
import AdminEmptyState from '../../../components/common/states/AdminEmptyState';
import AdminLoadingState from '../../../components/common/states/AdminLoadingState';
import { PermissionSummaryCards } from '../../AdminGroups/components/PermissionSummaryCards';
import { UserGroupOptionCard } from './UserGroupOptionCard';

const { Text } = Typography;

export default function UserGroupAssignmentModal({ isModalOpen, onCancel, user, onSuccess }) {
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
      className="user-group-assignment-modal"
      footer={buildAdminModalFooter({
        cancelText: "Đóng",
        loading: saving,
        onCancel,
        onSubmit: save,
      })}
    >
      {loading ? (
        <AdminLoadingState skeleton rows={5} />
      ) : (
        <Space className="user-group-assignment-stack" direction="vertical" size={18}>
          <Space wrap>
            <Tag color="blue">{selectedGroups.length} nhóm đã chọn</Tag>
            <Tag color="green">{selectedPermissions.length} quyền hiệu lực</Tag>
            <Tag>{selectedSubjectCount} môn có quyền</Tag>
            <Tag>{selectedMenuCount} menu</Tag>
          </Space>

          <div className="user-group-assignment-grid">
            <section>
              <Space className="user-group-assignment-section-title">
                <SafetyCertificateOutlined />
                <Text strong>Chọn nhóm quyền</Text>
              </Space>
              {groups.length === 0 ? (
                <AdminEmptyState description="Chưa có nhóm quyền đang kích hoạt" />
              ) : (
                <Checkbox.Group
                  value={selectedGroupIds}
                  onChange={setSelectedGroupIds}
                  className="user-group-assignment-checkbox-group"
                >
                  <List
                    dataSource={groups}
                    renderItem={(group) => {
                      const permissionCount = groupPermissions[group.id]?.length || 0;
                      return (
                        <List.Item className="user-group-assignment-list-item">
                          <UserGroupOptionCard
                            group={group}
                            permissionCount={permissionCount}
                            selected={selectedGroupIds.includes(group.id)}
                          />
                        </List.Item>
                      );
                    }}
                  />
                </Checkbox.Group>
              )}
            </section>

            <section>
              <Space className="user-group-assignment-summary-stack" direction="vertical" size={10}>
                <PermissionSummaryCards
                  summary={summary}
                  title="Người dùng sẽ có quyền"
                />
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
      )}
    </Modal>
  );
}
