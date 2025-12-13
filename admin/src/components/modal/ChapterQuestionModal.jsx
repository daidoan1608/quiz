import React, { useEffect, useState, useCallback } from "react";
import {
  Table, Card, Button, Typography, Space, Tooltip,
  message, Row, Col, Tag, Modal, Input, Spin
} from "antd";
import {
  QuestionCircleOutlined, SearchOutlined, ReloadOutlined
} from "@ant-design/icons";
import { authAxios } from "../../api/axiosConfig";

const { Title, Text } = Typography;

export default function ChapterQuestionModal({ isModalOpen, onCancel, chapterId }) {
  // Loại bỏ các state và logic không dùng trong chế độ Read Only
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [chapterInfo, setChapterInfo] = useState({ name: 'Đang tải...', subjectName: '' });

  // --- HÀM 1: FETCH THÔNG TIN CHƯƠNG ---
  const fetchChapterInfo = useCallback(async (id) => {
    try {
      const response = await authAxios.get(`/public/chapters/${id}`);
      const data = response.data.data;
      setChapterInfo({
        name: data.name || `Chương ${data.chapterNumber}`,
        subjectName: data.subjectName || `Môn ID: ${data.subjectId}`,
      });
    } catch (error) {
      setChapterInfo({ name: `Chương ID ${id}`, subjectName: 'Lỗi tải' });
    }
  }, []);

  // --- HÀM 2: FETCH DANH SÁCH CÂU HỎI ---
  const fetchQuestions = useCallback(async (id) => {
    if (!id || !isModalOpen) return;
    setLoading(true);
    try {
      const response = await authAxios.get(`/public/questions/chapter/${id}`);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setQuestions(data);
    } catch (error) {
      console.error("Lỗi:", error);
      message.error("Không thể lấy danh sách câu hỏi!");
    } finally {
      setLoading(false);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (chapterId && isModalOpen) {
      fetchChapterInfo(chapterId);
      fetchQuestions(chapterId);
    }
  }, [chapterId, isModalOpen, fetchQuestions, fetchChapterInfo]);


  // --- CÁC HÀM RENDER/LỌC GIỮ NGUYÊN ---
  const renderAnswerCell = (answers, index) => {
    const answer = answers && answers[index];
    if (!answer) return <Text type="secondary">-</Text>;
    const color = answer.isCorrect ? "success" : "default";
    return (
      <Tooltip title={answer.content}>
        <Text type={color} style={{ width: 150 }} ellipsis>
          {answer.content}
        </Text>
      </Tooltip>
    );
  };

  const getFilteredData = () => {
    if (!searchText) return questions;
    const lowerSearch = searchText.toLowerCase();
    return questions.filter(
      (item) =>
        item.content?.toLowerCase().includes(lowerSearch) ||
        item.questionId?.toString().includes(lowerSearch)
    );
  };

  // --- CẤU HÌNH CỘT ---
  const columns = [
    { title: "ID", dataIndex: "questionId", key: "questionId", width: 60, fixed: "left" },
    {
      title: "Nội dung câu hỏi",
      dataIndex: "content",
      key: "content",
      width: 250,
      render: (text) => (
        <Tooltip title={text}>
          <Text style={{ width: 230 }} ellipsis strong>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Mức độ",
      dataIndex: "difficulty",
      key: "difficulty",
      width: 100,
      render: (diff) => {
        let color = "blue";
        if (diff === "EASY" || diff === 1) color = "green";
        if (diff === "HARD" || diff === 3) color = "red";
        return <Tag color={color}>{diff}</Tag>;
      },
    },
    { title: "Đáp án A", key: "ansA", width: 150, render: (_, record) => renderAnswerCell(record.answers, 0) },
    { title: "Đáp án B", key: "ansB", width: 150, render: (_, record) => renderAnswerCell(record.answers, 1) },
    { title: "Đáp án C", key: "ansC", width: 150, render: (_, record) => renderAnswerCell(record.answers, 2) },
    { title: "Đáp án D", key: "ansD", width: 150, render: (_, record) => renderAnswerCell(record.answers, 3) },
  ];

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <QuestionCircleOutlined style={{ marginRight: 8 }} /> {chapterInfo.name} ({chapterInfo.subjectName})
        </Title>
      }
      open={isModalOpen}
      onCancel={onCancel} // Nút [X] góc phải sẽ gọi onCancel
      footer={null} // LOẠI BỎ FOOTER
      width={1300}
      style={{ top: 20 }}
    >
      <Card bordered={false}>
        {/* Thanh Header/Tìm kiếm/Làm mới */}
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                    Chapter ID: {chapterId}
                </Text>
              <Text type="secondary">
                Tổng số {questions.length} câu hỏi được tìm thấy.
              </Text>
            </Col>
            <Col>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={() => fetchQuestions(chapterId)}>Làm mới</Button>
                <Input
                  placeholder="Tìm nội dung câu hỏi..."
                  prefix={<SearchOutlined />}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  style={{ width: 200 }}
                />
              </Space>
            </Col>
          </Row>
        </div>

        {/* Bảng dữ liệu */}
        {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin tip="Đang tải câu hỏi..." />
            </div>
        ) : (
            <Table
                columns={columns}
                dataSource={getFilteredData()}
                rowKey="questionId"
                pagination={{
                    pageSize: 5,
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "20"],
                }}
                scroll={{ x: 1250 }}
            />
        )}
      </Card>
    </Modal>
  );
}