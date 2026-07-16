import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  theme,
  Typography,
  Table,
  Select,
  Space,
} from 'antd';
import { authAxios } from '../../api/axiosConfig';
import StatisticsChart from '../../components/common/StatisticsChart';
import {
  ReadOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const LIMIT_OPTIONS = [5, 10, 20, 30].map((value) => ({
  value,
  label: `${value} dòng`,
}));

export default function ContentHome() {
  const [loading, setLoading] = useState(true);
  const [tableLimits, setTableLimits] = useState({
    hotSubjectsLimit: 5,
    wrongQuestionsLimit: 5,
    activeUsersLimit: 5,
  });
  const [statistics, setStatistics] = useState({
    totalSubjects: 0,
    totalQuestions: 0,
    totalUsers: 0,
    totalExams: 0,
    attemptsByDay: [],
    hotSubjects: [],
    mostWrongQuestions: [],
    activeUsers: [],
  });
  const { token } = theme.useToken();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await authAxios.get('/admin/statistics', {
          params: {
            ...tableLimits,
            attemptsDays: 14,
          },
        });
        setStatistics((prev) => ({ ...prev, ...response.data.data }));
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [tableLimits]);

  const updateLimit = (key) => (value) => {
    setTableLimits((prev) => ({ ...prev, [key]: value }));
  };

  const renderLimitSelect = (key) => (
    <Space size={8}>
      <Text type="secondary">Hiển thị</Text>
      <Select
        size="small"
        value={tableLimits[key]}
        options={LIMIT_OPTIONS}
        onChange={updateLimit(key)}
        style={{ width: 96 }}
      />
    </Space>
  );

  const cards = [
    {
      title: 'Môn học',
      value: statistics.totalSubjects,
      icon: <ReadOutlined />,
      color: token.colorPrimary,
    },
    {
      title: 'Câu hỏi',
      value: statistics.totalQuestions,
      icon: <QuestionCircleOutlined />,
      color: token.colorWarning,
    },
    {
      title: 'Đề thi',
      value: statistics.totalExams,
      icon: <FileTextOutlined />,
      color: token.colorSuccess,
    },
    {
      title: 'Người dùng',
      value: statistics.totalUsers,
      icon: <UserOutlined />,
      color: token.colorError,
    },
  ];

  const tableProps = {
    size: 'small',
    pagination: false,
    scroll: { x: true },
  };

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <Title level={2} style={{ margin: 0 }}>
          Dashboard
        </Title>
        <Text type="secondary">Tổng quan vận hành hệ thống quiz.</Text>
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
                      borderRadius: 8,
                      display: 'inline-grid',
                      placeItems: 'center',
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

      <Card
        title="Thống kê tổng quan"
        bordered={false}
        loading={loading}
        className="modern-card"
        style={{ marginTop: 22 }}
      >
        <StatisticsChart statistics={statistics} />
      </Card>

      <Row gutter={[18, 18]} style={{ marginTop: 22 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Lượt thi theo ngày"
            bordered={false}
            loading={loading}
            className="modern-card"
          >
            <Table
              {...tableProps}
              columns={[
                { title: 'Ngày', dataIndex: 'date' },
                { title: 'Lượt thi', dataIndex: 'attempts', width: 120 },
              ]}
              dataSource={statistics.attemptsByDay || []}
              rowKey="date"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Môn hot"
            extra={renderLimitSelect('hotSubjectsLimit')}
            bordered={false}
            loading={loading}
            className="modern-card"
          >
            <Table
              {...tableProps}
              columns={[
                { title: 'Môn học', dataIndex: 'subjectName' },
                { title: 'Lượt thi', dataIndex: 'attempts', width: 120 },
              ]}
              dataSource={statistics.hotSubjects || []}
              rowKey="subjectName"
            />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card
            title="Câu sai nhiều nhất"
            extra={renderLimitSelect('wrongQuestionsLimit')}
            bordered={false}
            loading={loading}
            className="modern-card"
          >
            <Table
              {...tableProps}
              columns={[
                { title: 'ID', dataIndex: 'questionId', width: 80 },
                { title: 'Câu hỏi', dataIndex: 'content', ellipsis: true },
                { title: 'Sai', dataIndex: 'wrongCount', width: 90 },
              ]}
              dataSource={statistics.mostWrongQuestions || []}
              rowKey="questionId"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title="User hoạt động"
            extra={renderLimitSelect('activeUsersLimit')}
            bordered={false}
            loading={loading}
            className="modern-card"
          >
            <Table
              {...tableProps}
              columns={[
                { title: 'User', dataIndex: 'username' },
                { title: 'Họ tên', dataIndex: 'fullName', ellipsis: true },
                { title: 'Lượt thi', dataIndex: 'attempts', width: 120 },
              ]}
              dataSource={statistics.activeUsers || []}
              rowKey="userId"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
