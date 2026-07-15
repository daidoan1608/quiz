import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  Space,
  Spin,
  Table,
  Typography,
  message,
  theme,
} from "antd";
import { BookOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { subjectApi } from "../../api/services";

const { Title, Text } = Typography;

const SubjectListModal = ({
  isModalOpen,
  onCancel,
  onSelect,
  categoryId,
  categoryName,
  selectionMode = false,
}) => {
  const { token } = theme.useToken();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const fetchSubjects = useCallback(async () => {
    if (!categoryId) {
      setSubjects([]);
      return;
    }

    setLoading(true);
    try {
      const data = await subjectApi.getByCategory(categoryId);
      setSubjects(data);
    } catch (error) {
      console.error("Lỗi tải môn học:", error);
      message.error("Không thể tải danh sách môn học.");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (isModalOpen) {
      fetchSubjects();
    } else {
      setSearchText("");
      setSelectedRowKeys([]);
      setSubjects([]);
    }
  }, [isModalOpen, fetchSubjects]);

  const getFilteredData = () => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return subjects;
    return subjects.filter((item) =>
      `${item.subjectId || ""} ${item.name || ""} ${item.description || ""}`
        .toLowerCase()
        .includes(keyword)
    );
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "subjectId",
      key: "subjectId",
      width: 100,
      sorter: (a, b) => a.subjectId - b.subjectId,
      render: (text) => <Text strong style={{ color: token.colorPrimary }}>{text || "N/A"}</Text>,
    },
    {
      title: "Tên môn học",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Space>
          <BookOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      responsive: ["md"],
      render: (text) => text || <Text type="secondary" italic>Không có mô tả</Text>,
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    type: "radio",
  };

  const handleConfirmSelection = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một môn học.");
      return;
    }

    const selectedSubject = subjects.find((subject) => subject.subjectId === selectedRowKeys[0]);
    if (onSelect && selectedSubject) {
      onSelect(selectedSubject);
    }
    onCancel();
  };

  const modalFooter = selectionMode ? [
    <Button key="back" onClick={onCancel}>
      Hủy
    </Button>,
    <Button
      key="submit"
      type="default"
      loading={loading}
      onClick={handleConfirmSelection}
      disabled={selectedRowKeys.length === 0}
    >
      Xác nhận chọn ({selectedRowKeys.length})
    </Button>,
  ] : null;

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <BookOutlined style={{ marginRight: 8 }} />
          {selectionMode ? "Chọn môn học" : `Danh sách môn học${categoryName ? ` - ${categoryName}` : ""}`}
        </Title>
      }
      open={isModalOpen}
      onCancel={onCancel}
      footer={modalFooter}
      width={800}
      centered
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Input
            placeholder="Tìm kiếm theo ID, tên hoặc mô tả"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={fetchSubjects} loading={loading}>
            Tải lại
          </Button>
        </Space>

        <Spin spinning={loading} tip="Đang tải môn học...">
          <Table
            columns={columns}
            dataSource={getFilteredData()}
            rowKey="subjectId"
            loading={loading}
            rowSelection={selectionMode ? rowSelection : undefined}
            pagination={{ pageSize: 5 }}
            scroll={{ y: 350 }}
            size="middle"
          />
        </Spin>
      </Space>
    </Modal>
  );
};

export default SubjectListModal;
