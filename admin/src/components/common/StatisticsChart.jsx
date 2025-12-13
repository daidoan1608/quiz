import React from "react";
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
} from "recharts";
import { Card, Row, Col, theme } from "antd";
import { BarChartOutlined, PieChartOutlined } from "@ant-design/icons";


export default function StatisticsChart({ statistics }) {
  // 1. Lấy bộ màu từ Theme hiện tại (Sáng/Tối)
  const { token } = theme.useToken();

  const barData = [
    { name: "Câu hỏi", value: statistics.totalQuestions },
    { name: "Đề thi", value: statistics.totalExams },
    { name: "Người dùng", value: statistics.totalUsers },
    { name: "Môn học", value: statistics.totalSubjects },
  ];

  // 2. Map màu từ Token vào dữ liệu biểu đồ
  // Thay vì dùng var(--color...), ta dùng mã màu trực tiếp từ Antd
  const pieData = [
    {
      name: "MEDIUM",
      value: statistics.questionCountByMedium,
      color: token.colorWarning, // Màu vàng cam
    },
    {
      name: "EASY",
      value: statistics.questionCountByEasy,
      color: token.colorSuccess, // Màu xanh lá
    },
    {
      name: "HARD",
      value: statistics.questionCountByHard,
      color: token.colorError, // Màu đỏ
    },
  ];

  // Style chung cho Tooltip để đồng bộ Dark mode
  const tooltipStyle = {
    backgroundColor: token.colorBgElevated, // Nền tooltip (đen nhẹ ở dark mode)
    border: `1px solid ${token.colorBorderSecondary}`,
    color: token.colorText,
    borderRadius: token.borderRadius,
    boxShadow: token.boxShadowSecondary,
  };

  return (
    // Dùng Row/Col để chia cột Responsive
    <Row gutter={[16, 16]}>
      {/* --- BIỂU ĐỒ CỘT --- */}
      <Col xs={24} lg={14}>
        <Card
          bordered={false}
          className="c-shadow"
          title={
            <>
              <BarChartOutlined /> Thống kê tổng quan
            </>
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={barData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={token.colorBorderSecondary} // Màu lưới mờ
                vertical={false} // Chỉ hiện lưới ngang cho thoáng
              />
              <XAxis
                dataKey="name"
                stroke={token.colorTextSecondary} // Màu chữ trục X
                tick={{ fill: token.colorTextSecondary }}
              />
              <YAxis
                stroke={token.colorTextSecondary}
                tick={{ fill: token.colorTextSecondary }}
              />
              <Tooltip
                cursor={{ fill: token.colorFillTertiary }} // Màu hover cột
                contentStyle={tooltipStyle}
                itemStyle={{ color: token.colorText }}
              />
              <Legend wrapperStyle={{ color: token.colorText }} />
              <Bar
                dataKey="value"
                name="Số lượng"
                fill={token.colorPrimary} // Màu chủ đạo của App
                radius={[4, 4, 0, 0]} // Bo góc cột
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Col>

      {/* --- BIỂU ĐỒ TRÒN --- */}
      <Col xs={24} lg={10}>
        <Card
          bordered={false}
          className="c-shadow"
          title={
            <>
              <PieChartOutlined /> Tỷ lệ độ khó
            </>
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60} // Tạo biểu đồ Donut cho hiện đại
                outerRadius={100}
                paddingAngle={5} // Khoảng cách giữa các miếng
                label={{ fill: token.colorTextSecondary }} // Màu nhãn
              >
                {/* Loop để gán màu cho từng miếng */}
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={token.colorBgContainer}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={{ color: token.colorText }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </Col>
    </Row>
  );
}
