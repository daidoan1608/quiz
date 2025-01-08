import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function StatisticsChart({ statistics }) {
  const data = [
    { name: "Câu hỏi", value: statistics.totalQuestions },
    { name: "Đề thi", value: statistics.totalExams },
    { name: "Người dùng", value: statistics.totalUsers },
    { name: "Môn học", value: statistics.totalSubjects },
  ];

  return (
    <BarChart width={600} height={300} data={data} style={{ margin: "20px auto" }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="value" fill="#4c79ff" />
    </BarChart>
  );
}
