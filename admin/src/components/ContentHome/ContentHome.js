import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css';

export default function ContentHome() {
  const [statistics, setStatistics] = useState({
    totalQuestions: 0,
    totalUsers: 0,
    totalExams: 0,
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem('token'); // Lấy token từ localStorage
        const response = await axios.get('http://localhost:8080/admin/statistics', {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm Bearer Token vào header
          },
        });
        setStatistics(response.data); // Cập nhật dữ liệu thống kê
      } catch (error) {
        console.error('Error fetching statistics:', error);
        alert('Không thể tải dữ liệu thống kê!');
      }
    };

    fetchStatistics();
  }, []);

  return (
    <div className="content-container">
      <ul className="content-list">
        <li className="content-block">
          <h3 className="content-number">{statistics.totalQuestions}</h3>
          <p className="content-description">Số câu hỏi</p>
        </li>
        <li className="content-block">
          <h3 className="content-number">{statistics.totalExams}</h3>
          <p className="content-description">Số đề thi</p>
        </li>
        <li className="content-block">
          <h3 className="content-number">{statistics.totalUsers}</h3>
          <p className="content-description">Số người dùng</p>
        </li>
      </ul>
    </div>
  );
}
