import React from "react";
import { Button, Popconfirm, Space, Table, Tag } from "antd";
import {
  DeleteOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import ManagementPageLayout from "../../../layouts/ManagementPageLayout";
import { AdminGroupModal } from "./AdminGroupModal";

export const AdminGroupsView = ({
  groups,
  subjects,
  loading,
  loadingSubjects,
  editingGroup,
  selectedSubjectIds,
  selectedPresetKeys,
  setSelectedPresetKeys,
  modalOpen,
  form,
  subjectMap,
  previewRows,
  summary,
  fetchGroups,
  openModal,
  closeModal,
  saveGroup,
  removeGroup,
  setPermission,
  isChecked,
  applySelectedPresets,
  clearSubjectPermissions,
  handleSubjectSelection,
}) => {
  const columns = [
    { title: "Mã", dataIndex: "code", width: 220 },
    { title: "Tên nhóm", dataIndex: "name", width: 260 },
    { title: "Mô tả", dataIndex: "description", ellipsis: true },
    {
      title: "Trạng thái",
      dataIndex: "active",
      width: 120,
      render: (active) => (
        <Tag color={active ? "green" : "default"}>{active ? "ACTIVE" : "OFF"}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            className="action-btn"
            icon={<SettingOutlined />}
            onClick={() => openModal(record)}
          />
          <Popconfirm
            title="Xóa nhóm quyền?"
            onConfirm={() => removeGroup(record.id)}
            disabled={record.systemManaged}
          >
            <Button
              className="action-btn is-danger"
              icon={<DeleteOutlined />}
              disabled={record.systemManaged}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ManagementPageLayout
        title={
          <Space>
            <SafetyCertificateOutlined /> Nhóm quyền
          </Space>
        }
        table={
          <Table
            rowKey="id"
            columns={columns}
            dataSource={groups}
            loading={loading}
            pagination={{ pageSize: 8 }}
          />
        }
        onReload={fetchGroups}
        onAdd={() => openModal()}
      />

      <AdminGroupModal
        editingGroup={editingGroup}
        modalOpen={modalOpen}
        closeModal={closeModal}
        form={form}
        saveGroup={saveGroup}
        loadingSubjects={loadingSubjects}
        subjects={subjects}
        selectedSubjectIds={selectedSubjectIds}
        handleSubjectSelection={handleSubjectSelection}
        selectedPresetKeys={selectedPresetKeys}
        setSelectedPresetKeys={setSelectedPresetKeys}
        applySelectedPresets={applySelectedPresets}
        previewRows={previewRows}
        summary={summary}
        subjectMap={subjectMap}
        clearSubjectPermissions={clearSubjectPermissions}
        isChecked={isChecked}
        setPermission={setPermission}
      />
    </>
  );
};
