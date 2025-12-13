import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, theme } from "antd"; // Import component Antd
import { authAxios } from "../../api/axiosConfig";
import StatisticsChart from "../../components/common/StatisticsChart";

// Import Icon cho sinh động
import {
  ReadOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";

export default function ContentHome() {
  const [loading, setLoading] = useState(true); // Thêm state loading
  const [statistics, setStatistics] = useState({
    totalSubjects: 0,
    totalQuestions: 0,
    totalUsers: 0,
    totalExams: 0,
  });

  // Lấy token màu để trang trí icon nếu thích (không bắt buộc)
  const { token } = theme.useToken();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await authAxios.get("/admin/statistics");
        setStatistics(response.data.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
        // Antd notification sẽ tốt hơn alert, nhưng giữ alert tạm cũng được
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <div style={{ paddingBottom: 24 }}>
      {" "}
      {/* Padding dưới cùng để chart không sát đáy */}
      {/* KHỐI 1: 4 CARD THỐNG KÊ */}
      <Row gutter={[16, 16]}>
        {" "}
        {/* Gutter: Khoảng cách giữa các ô [ngang, dọc] */}
        {/* Card 1: Môn học */}
        <Col xs={24} sm={12} md={6}>
          <Card bordered={true} loading={loading}>
            <Statistic
              title="Số môn học"
              value={statistics.totalSubjects}
              prefix={<ReadOutlined style={{ color: token.colorPrimary }} />}
            />
          </Card>
        </Col>
        {/* Card 2: Câu hỏi */}
        <Col xs={24} sm={12} md={6}>
          <Card bordered={true} loading={loading}>
            <Statistic
              title="Số câu hỏi"
              value={statistics.totalQuestions}
              prefix={
                <QuestionCircleOutlined style={{ color: token.colorWarning }} />
              }
            />
          </Card>
        </Col>
        {/* Card 3: Đề thi */}
        <Col xs={24} sm={12} md={6}>
          <Card bordered={true} loading={loading}>
            <Statistic
              title="Số đề thi"
              value={statistics.totalExams}
              prefix={
                <FileTextOutlined style={{ color: token.colorSuccess }} />
              }
            />
          </Card>
        </Col>
        {/* Card 4: Người dùng */}
        <Col xs={24} sm={12} md={6}>
          <Card bordered={true} loading={loading}>
            <Statistic
              title="Số người dùng"
              value={statistics.totalUsers}
              prefix={<UserOutlined style={{ color: token.colorError }} />}
            />
          </Card>
        </Col>
      </Row>
      {/* KHỐI 2: BIỂU ĐỒ */}
      <div style={{ marginTop: 24 }}>
        <Card title="Thống kê tổng quan" bordered={false} loading={loading}>
          {/* Truyền dữ liệu vào Chart như cũ */}
          <StatisticsChart statistics={statistics} />
        </Card>
      </div>
    </div>
  );
}
