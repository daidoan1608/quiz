import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Label,
} from "recharts";

const ScoreChart = ({ data }) => {
  const formattedData = data.map((exam, index) => ({
    name: exam.title || `Bài ${index + 1}`,
    score: parseFloat(exam.userExamDto?.score?.toFixed(2)) || 0,
  }));

  return (
    <div style={{ width: "100%", height: 300, marginBottom: 20 }}>
      <ResponsiveContainer className="">
        <LineChart data={formattedData}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="name">
            <Label className="xAxisLabel" />
          </XAxis>
          <YAxis domain={[0, 10]}>
            <Label
              value="Điểm số"
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: "middle" }}
              className="yAxisLabel"
              offset={10}
            />
          </YAxis>
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="#1890ff" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreChart;
