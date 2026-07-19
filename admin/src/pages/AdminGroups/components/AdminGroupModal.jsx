import React from "react";
import {
  Button,
  Card,
  Checkbox,
  Collapse,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  EyeOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  GLOBAL_ACTIONS,
  GLOBAL_MATRIX,
  PRESETS,
  SUBJECT_ACTIONS,
  SUBJECT_MATRIX,
} from "../constants";
import { subjectLabel } from "../utils/permissionUtils";
import { PermissionMatrix } from "./PermissionMatrix";

const { Text } = Typography;

export const AdminGroupModal = ({
  editingGroup,
  modalOpen,
  closeModal,
  form,
  saveGroup,
  loadingSubjects,
  subjects,
  selectedSubjectIds,
  handleSubjectSelection,
  selectedPresetKeys,
  setSelectedPresetKeys,
  applySelectedPresets,
  previewRows,
  summary,
  subjectMap,
  clearSubjectPermissions,
  isChecked,
  setPermission,
}) => (
  <Modal
    title={editingGroup ? "Sửa nhóm quyền" : "Thêm nhóm quyền"}
    open={modalOpen}
    onCancel={closeModal}
    width={1180}
    style={{ top: 24 }}
    footer={null}
    destroyOnClose
  >
    <Form form={form} layout="vertical" onFinish={saveGroup}>
      <Form.Item
        name="code"
        label="Mã nhóm"
        rules={[{ required: true, message: "Nhập mã nhóm" }]}
      >
        <Input placeholder="MOD_QUESTION_MATH" disabled={editingGroup?.systemManaged} />
      </Form.Item>
      <Form.Item
        name="name"
        label="Tên nhóm"
        rules={[{ required: true, message: "Nhập tên nhóm" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Mô tả">
        <Input.TextArea rows={2} />
      </Form.Item>
      <Form.Item name="active" label="Kích hoạt" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <section>
          <Space direction="vertical" size={10} style={{ width: "100%" }}>
            <Space>
              <SafetyCertificateOutlined />
              <Text strong>Chọn phạm vi môn học</Text>
            </Space>
            <Select
              mode="multiple"
              allowClear
              showSearch
              loading={loadingSubjects}
              value={selectedSubjectIds}
              placeholder="Chọn một hoặc nhiều môn"
              optionFilterProp="label"
              style={{ width: "100%", minHeight: 44 }}
              dropdownStyle={{ minWidth: 420 }}
              notFoundContent={
                <div style={{ minHeight: 72, display: "grid", placeItems: "center" }}>
                  <Text type="secondary">Không tìm thấy môn học phù hợp</Text>
                </div>
              }
              onChange={handleSubjectSelection}
              options={subjects.map((subject) => ({
                value: subject.subjectId,
                label: subjectLabel(subject),
              }))}
            />
          </Space>
        </section>

        <section>
          <Space direction="vertical" size={10} style={{ width: "100%" }}>
            <Text strong>Chọn mục đích quyền</Text>
            <Checkbox.Group
              value={selectedPresetKeys}
              onChange={setSelectedPresetKeys}
              style={{ width: "100%" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
                {PRESETS.map((preset) => (
                  <Card key={preset.key} size="small" style={{ minHeight: 82 }}>
                    <Checkbox value={preset.key}>
                      <Space direction="vertical" size={2}>
                        <Text strong>{preset.label}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Tự sinh menu và quyền dữ liệu phù hợp
                        </Text>
                      </Space>
                    </Checkbox>
                  </Card>
                ))}
              </div>
            </Checkbox.Group>
            <Button type="primary" onClick={applySelectedPresets}>
              Áp dụng mẫu quyền
            </Button>
          </Space>
        </section>

        <section>
          <Space style={{ marginBottom: 10 }} wrap>
            <EyeOutlined />
            <Text strong>Tóm tắt quyền sẽ lưu</Text>
            <Tag>{previewRows.length} quyền</Tag>
            <Tag>{summary.menus.length} menu</Tag>
            <Tag>{summary.subjectResources.length} môn</Tag>
          </Space>
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Card size="small" title="Menu được thấy">
              {summary.menus.length ? (
                summary.menus.map((item) => <Tag key={item}>{item}</Tag>)
              ) : (
                <Text type="secondary">Chưa có menu nào</Text>
              )}
            </Card>
            <Card size="small" title="Quyền toàn hệ thống">
              {summary.globalResources.length ? (
                summary.globalResources.map((item) => <Tag key={item}>{item}</Tag>)
              ) : (
                <Text type="secondary">Chưa có quyền toàn hệ thống</Text>
              )}
            </Card>
            <Card size="small" title="Quyền theo môn">
              {summary.subjectResources.length ? (
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  {summary.subjectResources.map((item) => (
                    <div key={item.subject}>
                      <Text strong>{item.subject}</Text>
                      <div style={{ marginTop: 4 }}>
                        {item.values.map((value) => (
                          <Tag key={value}>{value}</Tag>
                        ))}
                      </div>
                    </div>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">Chưa có quyền theo môn</Text>
              )}
            </Card>
          </Space>
        </section>

        <Collapse
          items={[
            {
              key: "advanced",
              label: "Tùy chỉnh nâng cao",
              children: (
                <Space direction="vertical" size={18} style={{ width: "100%" }}>
                  <section>
                    <Space style={{ marginBottom: 10 }}>
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
                    <Space direction="vertical" size={12} style={{ width: "100%", marginTop: 10 }}>
                      {selectedSubjectIds.map((subjectId) => (
                        <div key={subjectId}>
                          <Space style={{ marginBottom: 8 }}>
                            <Tag color="blue">
                              {subjectMap.has(subjectId)
                                ? subjectLabel(subjectMap.get(subjectId))
                                : `Môn #${subjectId}`}
                            </Tag>
                            <Button size="small" danger onClick={() => clearSubjectPermissions(subjectId)}>
                              Xóa quyền môn này
                            </Button>
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
      </Space>

      <Space style={{ marginTop: 18 }}>
        <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
          Lưu
        </Button>
        <Button onClick={closeModal}>Đóng</Button>
      </Space>
    </Form>
  </Modal>
);
