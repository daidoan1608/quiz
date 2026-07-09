import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, theme, Typography } from "antd";
import { authAxios } from "../../api/axiosConfig";
import StatisticsChart from "../../components/common/StatisticsChart";
import { ReadOutlined, QuestionCircleOutlined, FileTextOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function ContentHome() {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalSubjects: 0,
    totalQuestions: 0,
    totalUsers: 0,
    totalExams: 0,
  });
  const { token } = theme.useToken();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await authAxios.get("/admin/statistics");
        setStatistics(response.data.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const cards = [
    { title: "Môn học", value: statistics.totalSubjects, icon: <ReadOutlined />, color: token.colorPrimary },
    { title: "Câu hỏi", value: statistics.totalQuestions, icon: <QuestionCircleOutlined />, color: token.colorWarning },
    { title: "Đề thi", value: statistics.totalExams, icon: <FileTextOutlined />, color: token.colorSuccess },
    { title: "Người dùng", value: statistics.totalUsers, icon: <UserOutlined />, color: token.colorError },
  ];

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <Title level={2} style={{ margin: 0, letterSpacing: "-0.04em" }}>Dashboard</Title>
        <Text type="secondary">Tổng quan nhanh về dữ liệu và hoạt động của hệ thống.</Text>
      </div>

      <Row gutter={[18, 18]}>
        {cards.map((item) => (
          <Col xs={24} sm={12} lg={6} key={item.title}>
            <Card bordered={false} loading={loading} className="modern-card">
              <Statistic
                title={item.title}
                value={item.value}
                prefix={
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 14,
                      display: "inline-grid",
                      placeItems: "center",
                      marginRight: 6,
                      color: item.color,
                      background: `${item.color}18`,
                    }}
                  >
                    {item.icon}
                  </span>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Thống kê tổng quan" bordered={false} loading={loading} className="modern-card" style={{ marginTop: 22 }}>
        <StatisticsChart statistics={statistics} />
      </Card>
    </div>
  );
}
