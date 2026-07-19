import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Row, Col, theme } from 'antd';

function useChartTheme() {
  const { token } = theme.useToken();

  const tooltipStyle = {
    backgroundColor: token.colorBgElevated,
    border: `1px solid ${token.colorBorderSecondary}`,
    color: token.colorText,
    borderRadius: token.borderRadius,
    boxShadow: token.boxShadowSecondary,
  };

  return { token, tooltipStyle };
}

export function OverviewBarChart({ statistics }) {
  const { token, tooltipStyle } = useChartTheme();
  const barData = [
    { name: 'Câu hỏi', value: statistics.totalQuestions },
    { name: 'Đề thi', value: statistics.totalExams },
    { name: 'Người dùng', value: statistics.totalUsers },
    { name: 'Môn học', value: statistics.totalSubjects },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={barData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={token.colorBorderSecondary}
          vertical={false}
        />
        <XAxis
          dataKey="name"
          stroke={token.colorTextSecondary}
          tick={{ fill: token.colorTextSecondary }}
        />
        <YAxis
          stroke={token.colorTextSecondary}
          tick={{ fill: token.colorTextSecondary }}
        />
        <Tooltip
          cursor={{ fill: token.colorFillTertiary }}
          contentStyle={tooltipStyle}
          itemStyle={{ color: token.colorText }}
        />
        <Legend wrapperStyle={{ color: token.colorText }} />
        <Bar
          dataKey="value"
          name="Số lượng"
          fill={token.colorPrimary}
          radius={[4, 4, 0, 0]}
          barSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DifficultyPieChart({ statistics }) {
  const { token, tooltipStyle } = useChartTheme();
  const pieData = [
    {
      name: 'MEDIUM',
      value: statistics.questionCountByMedium,
      color: token.colorWarning,
    },
    {
      name: 'EASY',
      value: statistics.questionCountByEasy,
      color: token.colorSuccess,
    },
    {
      name: 'HARD',
      value: statistics.questionCountByHard,
      color: token.colorError,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          label={{ fill: token.colorTextSecondary }}
        >
          {pieData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              stroke={token.colorBgContainer}
            />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: token.colorText }} />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function StatisticsChart({ statistics }) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={14}>
        <OverviewBarChart statistics={statistics} />
      </Col>
      <Col xs={24} lg={10}>
        <DifficultyPieChart statistics={statistics} />
      </Col>
    </Row>
  );
}
