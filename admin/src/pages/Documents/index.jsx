import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Space, Switch, Table, Tag, Upload, message } from 'antd';
import { DeleteOutlined, DownloadOutlined, EditOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons';
import { documentApi } from '../../api/services/documentApi';

const { Dragger } = Upload;

const formatFileSize = (size = 0) => {
  if (!size) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  return `${(size / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

export default function DocumentsManager() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [form] = Form.useForm();

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await documentApi.getAll();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Không thể tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const openCreateModal = () => {
    setEditing(null);
    setSelectedFile(null);
    form.resetFields();
    form.setFieldsValue({ active: true });
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditing(record);
    setSelectedFile(null);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      active: record.active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSaving(true);

    try {
      if (editing) {
        await documentApi.update(editing.id, values);
        message.success('Đã cập nhật tài liệu');
      } else {
        if (!selectedFile) {
          message.error('Vui lòng chọn file tài liệu');
          return;
        }
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description || '');
        formData.append('active', values.active ?? true);
        formData.append('file', selectedFile);
        await documentApi.create(formData);
        message.success('Đã tải tài liệu lên');
      }

      setModalOpen(false);
      loadDocuments();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Không thể lưu tài liệu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await documentApi.delete(id);
      message.success('Đã xóa tài liệu');
      loadDocuments();
    } catch (error) {
      message.error('Không thể xóa tài liệu');
    }
  };

  const columns = [
    {
      title: 'Tài liệu',
      dataIndex: 'title',
      render: (title, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{title}</div>
          <div style={{ color: '#64748b', fontSize: 13 }}>{record.originalFilename}</div>
        </div>
      ),
    },
    { title: 'Dung lượng', dataIndex: 'fileSize', width: 120, render: formatFileSize },
    {
      title: 'Hiển thị',
      dataIndex: 'active',
      width: 110,
      render: (active, record) => (
        <Switch
          checked={active}
          onChange={(checked) =>
            documentApi
              .update(record.id, { active: checked })
              .then(loadDocuments)
              .catch(() => message.error('Không thể cập nhật trạng thái'))
          }
        />
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      width: 130,
      render: (active) => <Tag color={active ? 'green' : 'default'}>{active ? 'Đang chia sẻ' : 'Đã ẩn'}</Tag>,
    },
    {
      title: 'Thao tác',
      width: 190,
      render: (_, record) => (
        <Space>
          <Button icon={<DownloadOutlined />} href={record.downloadUrl} target="_blank" />
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm title="Xóa tài liệu này?" okText="Xóa" cancelText="Hủy" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Quản lý tài liệu</h1>
          <p style={{ margin: '8px 0 0', color: '#64748b' }}>
            Đăng và quản lý tài liệu chia sẻ cho phía client.
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Thêm tài liệu
        </Button>
      </div>

      <Table rowKey="id" columns={columns} dataSource={documents} loading={loading} pagination={{ pageSize: 10 }} />

      <Modal
        title={editing ? 'Cập nhật tài liệu' : 'Thêm tài liệu'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={saving}
        okText={editing ? 'Cập nhật' : 'Tải lên'}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ active: true }}>
          <Form.Item label="Tiêu đề" name="title" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
            <Input placeholder="Nhập tiêu đề tài liệu" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn về tài liệu" />
          </Form.Item>
          <Form.Item label="Hiển thị trên client" name="active" valuePropName="checked">
            <Switch />
          </Form.Item>

          {!editing && (
            <Form.Item label="File tài liệu" required>
              <Dragger
                maxCount={1}
                beforeUpload={(file) => {
                  setSelectedFile(file);
                  return false;
                }}
                onRemove={() => setSelectedFile(null)}
              >
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">Kéo thả hoặc nhấn để chọn file</p>
                <p className="ant-upload-hint">Hỗ trợ doc, docx, ppt, pptx, xls, xlsx, pdf, csv, zip, rar.</p>
              </Dragger>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
