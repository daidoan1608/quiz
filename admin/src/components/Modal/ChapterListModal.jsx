import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Input, Modal, Row, Space, Spin, Table, Typography, message } from "antd";
import { BookOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { authAxios } from "../../api/axiosConfig";

const { Title, Text } = Typography;

const ChapterListModal = ({ isModalOpen, onCancel, subjectId, subjectName }) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const fetchChapters = useCallback(
    async (id) => {
      if (!id || !isModalOpen) return;

      setLoading(true);
      try {
        const response = await authAxios.get(`/public/subjects/${id}`);
        if (response.data.status === "success") {
          const data = response.data.data;
          setChapters(data.chapters || []);
        } else {
          setChapters([]);
          message.warning("Không tìm thấy dữ liệu chương.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách chương:", error);
        message.error("Không thể lấy danh sách chương.");
      } finally {
        setLoading(false);
      }
    },
    [isModalOpen]
  );

  useEffect(() => {
    if (subjectId && isModalOpen) {
      fetchChapters(subjectId);
    }
    if (!isModalOpen) {
      setSearchText("");
    }
  }, [subjectId, isModalOpen, fetchChapters]);

  const getFilteredData = () => {
    if (!searchText) return chapters;
    const lowerSearch = searchText.toLowerCase();
    return chapters.filter(
      (item) =>
        item.name?.toLowerCase().includes(lowerSearch) ||
        item.chapterId?.toString().includes(lowerSearch) ||
        item.chapterNumber?.toString().includes(lowerSearch)
    );
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "chapterId",
      key: "chapterId",
      width: 100,
    },
    {
      title: "Chương",
      dataIndex: "chapterNumber",
      key: "chapterNumber",
      width: 130,
      sorter: (a, b) => a.chapterNumber - b.chapterNumber,
      render: (num) => <Text strong style={{ whiteSpace: "nowrap" }}>{num}</Text>,
    },
    {
      title: "Tên chương",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text style={{ fontSize: 15 }}>{text}</Text>,
    },
  ];

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <BookOutlined style={{ marginRight: 8 }} /> Chương học của môn: {subjectName || "..."}
        </Title>
      }
      open={isModalOpen}
      onCancel={onCancel}
      footer={null}
      width={800}
      centered
    >
      <Card bordered={false} style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <Text type="secondary">Tổng số {chapters.length} chương được tìm thấy.</Text>
            </Col>
            <Col>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={() => fetchChapters(subjectId)}>
                  Làm mới
                </Button>
                <Input
                  placeholder="Tìm tên chương, mã chương..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  style={{ width: 220 }}
                />
              </Space>
            </Col>
          </Row>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Spin tip="Đang tải danh sách chương..." />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={getFilteredData()}
            rowKey="chapterId"
            pagination={{ pageSize: 5 }}
          />
        )}
      </Card>
    </Modal>
  );
};

export default ChapterListModal;
