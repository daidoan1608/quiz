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
} from "recharts";

export default function StatisticsChart({ statistics }) {
 const barData = [
   { name: "Câu hỏi", value: statistics.totalQuestions },
   { name: "Đề thi", value: statistics.totalExams }, 
   { name: "Người dùng", value: statistics.totalUsers },
   { name: "Môn học", value: statistics.totalSubjects },
 ];

 const pieData = [
   { name: "MEDIUM", value: statistics.questionCountByMedium, fill: "#82ca9d" },
   { name: "EASY", value: statistics.questionCountByEasy, fill: "#ffc658" },
   { name: "HARD", value: statistics.questionCountByHard, fill: "#ff7f7f" },
 ];

 return (
   <div style={{ display: "flex", justifyContent: "space-around" , marginTop: "20px"}}>
     <BarChart width={600} height={300} data={barData}>
       <CartesianGrid strokeDasharray="3 3" />
       <XAxis dataKey="name" />
       <YAxis />
       <Tooltip />
       <Legend />
       <Bar dataKey="value" fill="#4c79ff" />
     </BarChart>

     <PieChart width={400} height={300}>
       <Pie
         data={pieData}
         dataKey="value"
         nameKey="name"
         cx="50%"
         cy="50%"
         outerRadius={100}
         label
       />
       <Tooltip />
       <Legend />
     </PieChart>
   </div>
 );
}