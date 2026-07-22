import React, { useCallback, useEffect, useMemo, useState } from "react";
import { appMessage as message } from "../../utils/ui/messageService";
import { Card, Checkbox, Col, Collapse, Form, Input, Row, Select, Skeleton, Space, Table, Tag, Typography } from "antd";
import {
  EyeOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/axiosConfig";
import { adminGroupApi, subjectApi } from "../../api/services";
import {
  AdminToolbarButton,
} from "../../components/common/buttons/AdminButtons";
import { AdminFormActions } from "../../components/common/forms/AdminFormActions";
import AdminFormPageLayout from "../../components/common/layout/AdminFormPageLayout";
import AdminTableSwitch from "../../components/common/table/AdminTableSwitch";
import {
  GLOBAL_ACTIONS,
  GLOBAL_MATRIX,
  PRESETS,
  SUBJECT_ACTIONS,
  SUBJECT_MATRIX,
} from "./constants";
import { PermissionMatrix } from "./components/PermissionMatrix";
import { PermissionPresetGrid } from "./components/PermissionPresetGrid";
import { PermissionSummaryCards } from "./components/PermissionSummaryCards";
import {
  buildPermissionSummary,
  keyOf,
  keyToPermission,
  permissionToKey,
  subjectLabel,
} from "./utils/permissionUtils";

const { Text } = Typography;

const AdminGroupFormPage = () => {
  const [form] = Form.useForm();
  const { groupId } = useParams();
  const navigate = useNavigate();
  const goBack = useCallback(() => navigate("/groups"), [navigate]);
  const isEdit = Boolean(groupId);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [permissionKeys, setPermissionKeys] = useState(new Set());
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [selectedPresetKeys, setSelectedPresetKeys] = useState([]);

  const permissions = useMemo(
    () => Array.from(permissionKeys).map(keyToPermission),
    [permissionKeys]
  );

  const subjectMap = useMemo(
    () => new Map(subjects.map((subject) => [subject.subjectId, subject])),
    [subjects]
  );

  const fetchSubjects = useCallback(async () => {
    setLoadingSubjects(true);
    try {
      setSubjects(await subjectApi.getAll());
    } catch (error) {
      message.warning(getApiErrorMessage(error, "Không thể tải danh sách môn học."));
    } finally {
      setLoadingSubjects(false);
    }
  }, []);

  const fetchGroup = useCallback(async () => {
    if (!groupId) {
      form.setFieldsValue({ active: true });
      return;
    }

    setLoading(true);
    try {
      const groups = await adminGroupApi.getAll();
      const group = groups.find((item) => String(item.id) === String(groupId));
      if (!group) {
        message.error("Không tìm thấy nhóm quyền.");
        goBack();
        return;
      }

      setEditingGroup(group);
      form.setFieldsValue(group);

      const nextPermissions = await adminGroupApi.getPermissions(group.id);
      setPermissionKeys(new Set(nextPermissions.map(permissionToKey)));
      setSelectedSubjectIds(
        Array.from(
          new Set(
            nextPermissions
              .filter((permission) => permission.scopeType === "SUBJECT" && permission.scopeId)
              .map((permission) => permission.scopeId)
          )
        )
      );
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể tải nhóm quyền."));
    } finally {
      setLoading(false);
    }
  }, [form, goBack, groupId]);

  useEffect(() => {
    fetchSubjects();
    fetchGroup();
  }, [fetchGroup, fetchSubjects]);

  const setPermission = (scopeType, scopeId, resource, action, checked) => {
    const key = keyOf(scopeType, scopeId, resource, action);
    setPermissionKeys((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const isChecked = (scopeType, scopeId, resource, action) =>
    permissionKeys.has(keyOf(scopeType, scopeId, resource, action));

  const applyPreset = (presetKey) => {
    const preset = PRESETS.find((item) => item.key === presetKey);
    if (!preset) return;
    if (selectedSubjectIds.length === 0) {
      message.warning("Chọn ít nhất một môn trước khi áp dụng preset theo môn.");
      return;
    }

    setPermissionKeys((prev) => {
      const next = new Set(prev);
      preset.permissions.forEach(([resource, action, scopeType]) => {
        if (scopeType === "SUBJECT") {
          selectedSubjectIds.forEach((subjectId) =>
            next.add(keyOf("SUBJECT", subjectId, resource, action))
          );
        } else {
          next.add(keyOf("GLOBAL", null, resource, action));
        }
      });
      return next;
    });
  };

  const applySelectedPresets = () => {
    if (selectedPresetKeys.length === 0) {
      message.warning("Chọn ít nhất một mẫu quyền.");
      return;
    }
    selectedPresetKeys.forEach(applyPreset);
  };

  const clearSubjectPermissions = (subjectId) => {
    setPermissionKeys((prev) => {
      const next = new Set(prev);
      Array.from(next)
        .filter((key) => key.startsWith(`SUBJECT:${subjectId}:`))
        .forEach((key) => next.delete(key));
      return next;
    });
  };

  const handleSubjectSelection = (nextSubjectIds) => {
    const removedSubjectIds = selectedSubjectIds.filter(
      (subjectId) => !nextSubjectIds.includes(subjectId)
    );
    removedSubjectIds.forEach(clearSubjectPermissions);
    setSelectedSubjectIds(nextSubjectIds);
  };

  const previewRows = useMemo(
    () =>
      permissions
        .sort((a, b) => permissionToKey(a).localeCompare(permissionToKey(b)))
        .map((permission, index) => ({
          ...permission,
          key: index,
          scope:
            permission.scopeType === "GLOBAL"
              ? "Toàn hệ thống"
              : subjectMap.has(permission.scopeId)
                ? subjectLabel(subjectMap.get(permission.scopeId))
                : `Môn #${permission.scopeId}`,
        })),
    [permissions, subjectMap]
  );

  const summary = useMemo(
    () => buildPermissionSummary(permissions, subjectMap),
    [permissions, subjectMap]
  );

  const saveGroup = async (values) => {
    setSaving(true);
    try {
      const saved = await adminGroupApi.save({ ...editingGroup, ...values });
      await adminGroupApi.savePermissions(saved.id, permissions);
      message.success("Đã lưu nhóm quyền.");
      goBack();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể lưu nhóm quyền."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminFormPageLayout
      onBack={goBack}
      title={
        <>
          <SafetyCertificateOutlined /> {isEdit ? "Sửa nhóm quyền" : "Thêm nhóm quyền"}
        </>
      }
    >
      {loading ? (
        <Card variant="borderless">
          <Skeleton active paragraph={{ rows: 12 }} />
        </Card>
      ) : (
        <Form form={form} layout="vertical" onFinish={saveGroup} size="middle">
          <Space className="admin-group-form-stack" direction="vertical" size={16}>
            <Card variant="borderless" size="small">
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="code"
                    label="Mã nhóm"
                    rules={[{ required: true, message: "Nhập mã nhóm" }]}
                  >
                    <Input placeholder="MOD_QUESTION_MATH" disabled={editingGroup?.systemManaged} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="name"
                    label="Tên nhóm"
                    rules={[{ required: true, message: "Nhập tên nhóm" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={4}>
                  <Form.Item name="active" label="Kích hoạt" valuePropName="checked">
                    <AdminTableSwitch />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="description" label="Mô tả">
                    <Input.TextArea rows={2} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card variant="borderless" size="small" title="Phạm vi và mẫu quyền">
              <Space className="admin-group-form-stack" direction="vertical" size={12}>
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  loading={loadingSubjects}
                  value={selectedSubjectIds}
                  placeholder="Chọn một hoặc nhiều môn"
                  optionFilterProp="label"
                  className="admin-group-form-full-control"
                  dropdownStyle={{ minWidth: 420 }}
                  onChange={handleSubjectSelection}
                  options={subjects.map((subject) => ({
                    value: subject.subjectId,
                    label: subjectLabel(subject),
                  }))}
                />

                <Checkbox.Group
                  value={selectedPresetKeys}
                  onChange={setSelectedPresetKeys}
                  className="admin-group-form-full-control"
                >
                  <PermissionPresetGrid presets={PRESETS} />
                </Checkbox.Group>
                <AdminToolbarButton type="primary" onClick={applySelectedPresets}>
                  Áp dụng mẫu quyền
                </AdminToolbarButton>
              </Space>
            </Card>

            <Card variant="borderless" size="small">
              <PermissionSummaryCards
                badges={
                  <>
                    <Tag>{previewRows.length} quyền</Tag>
                    <Tag>{summary.menus.length} menu</Tag>
                    <Tag>{summary.subjectResources.length} môn</Tag>
                  </>
                }
                summary={summary}
                title="Tóm tắt quyền sẽ lưu"
                titleIcon={<EyeOutlined />}
              />
            </Card>

            <Collapse
              items={[
                {
                  key: "advanced",
                  label: "Tùy chỉnh nâng cao",
                  children: (
                    <Space className="admin-group-form-stack" direction="vertical" size={18}>
                      <section>
                        <Space className="admin-group-form-section-title">
                          <SettingOutlined />
                          <Text strong>Quyền toàn hệ thống</Text>
                        </Space>
                        <PermissionMatrix
                          rows={GLOBAL_MATRIX}
                          actions={GLOBAL_ACTIONS}
                          scopeType="GLOBAL"
                          isChecked={isChecked}
                          setPermission={setPermission}
                        />
                      </section>
                      <section>
                        <Text strong>Quyền chi tiết theo môn</Text>
                        <Space className="admin-group-form-subject-stack" direction="vertical" size={12}>
                          {selectedSubjectIds.map((subjectId) => (
                            <div key={subjectId}>
                              <Space className="admin-group-form-subject-actions">
                                <Tag color="blue">
                                  {subjectMap.has(subjectId)
                                    ? subjectLabel(subjectMap.get(subjectId))
                                    : `Môn #${subjectId}`}
                                </Tag>
                                <AdminToolbarButton
                                  size="small"
                                  danger
                                  onClick={() => clearSubjectPermissions(subjectId)}
                                >
                                  Xóa quyền môn này
                                </AdminToolbarButton>
                              </Space>
                              <PermissionMatrix
                                rows={SUBJECT_MATRIX}
                                actions={SUBJECT_ACTIONS}
                                scopeType="SUBJECT"
                                scopeId={subjectId}
                                isChecked={isChecked}
                                setPermission={setPermission}
                              />
                            </div>
                          ))}
                        </Space>
                      </section>
                      <section>
                        <Text strong>Danh sách kỹ thuật</Text>
                        <Table
                          size="small"
                          rowKey="key"
                          dataSource={previewRows}
                          pagination={{ pageSize: 8 }}
                          columns={[
                            { title: "Phạm vi", dataIndex: "scope", width: 260 },
                            { title: "Resource", dataIndex: "resource", width: 180 },
                            { title: "Action", dataIndex: "action", width: 160 },
                          ]}
                        />
                      </section>
                    </Space>
                  ),
                },
              ]}
            />

            <AdminFormActions
              loading={saving}
              onCancel={goBack}
              onSubmit={() => form.submit()}
            />
          </Space>
        </Form>
      )}
    </AdminFormPageLayout>
  );
};

export default AdminGroupFormPage;
