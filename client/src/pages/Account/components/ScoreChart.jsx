import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Label,
} from 'recharts';

const ScoreChart = ({ data }) => {
  const formattedData = data.map((exam, index) => ({
    name: exam.title || `Bài ${index + 1}`,
    score: parseFloat(exam.userExamDto?.score?.toFixed(2)) || 0,
  }));

  return (
    <div className="aura-chart">
      <ResponsiveContainer>
        <LineChart data={formattedData}>
          <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />

          <XAxis dataKey="name" tick={false} />

          <YAxis domain={[0, 10]}>
            <Label
              value="Điểm số"
              angle={-90}
              position="insideLeft"
              className="aura-chart-label"
              offset={10}
            />
          </YAxis>

          <Tooltip />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#1890ff"
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreChart;
