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
} from "recharts";

export default function StatisticsChart({ statistics }) {
  const barData = [
    { name: "Câu hỏi", value: statistics.totalQuestions },
    { name: "Đề thi", value: statistics.totalExams },
    { name: "Người dùng", value: statistics.totalUsers },
    { name: "Môn học", value: statistics.totalSubjects },
  ];

  const pieData = [
    {
      name: "MEDIUM",
      value: statistics.questionCountByMedium,
      fill: "var(--color-success)",
    },
    {
      name: "EASY",
      value: statistics.questionCountByEasy,
      fill: "var(--color-primary)",
    },
    {
      name: "HARD",
      value: statistics.questionCountByHard,
      fill: "var(--color-danger)",
    },
  ];

  return (
    <div className="chart-wrapper">
      <div className="chart-card">
        {" "}
        {/* Container cho Bar Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} className="bar-chart-theme">
            <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
            <XAxis dataKey="name" stroke="var(--color-text-primary)" />
            <YAxis stroke="var(--color-text-primary)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-background-card)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            />
            <Legend wrapperStyle={{ color: "var(--color-text-primary)" }} />
            <Bar
              dataKey="value"
              fill="var(--color-primary)"
              className="chart-bar-primary"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-card">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart className="pie-chart-theme">
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-background-card)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            />
            <Legend wrapperStyle={{ color: "var(--color-text-primary)" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
