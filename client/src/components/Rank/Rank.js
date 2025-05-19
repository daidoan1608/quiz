import React, { useState, useEffect } from 'react';
import Filter from './Filter';
import Leaderboard from './Leaderboard';
import './Rank.css';
import { useLanguage } from '../Context/LanguageProvider';

// MOCK dữ liệu người dùng đăng nhập
const mockAuth = {
  isLoggedIn: true,
  user: 'alice',
};

// MOCK dữ liệu bảng xếp hạng
const mockLeaderboardData = [
  {
    username: 'alice',
    scores: [95, 85],
    times: [30, 40],
    badge: 'Vàng',
    subject: 'Nguyên lý hệ điều hành',
  },
  {
    username: 'bob',
    scores: [80, 90],
    times: [25, 35],
    badge: 'Bạc',
    subject: 'Mạng máy tính',
  },
  {
    username: 'charlie',
    scores: [70, 75],
    times: [20, 30],
    badge: 'Đồng',
    subject: 'Nguyên lý hệ điều hành',
  },
  {
    username: 'david',
    scores: [60, 70],
    times: [15, 25],
    badge: 'Thường',
    subject: 'Khai phá dữ liệu',
  },
];

// Hàm tính tổng điểm, thời gian, trung bình
const calculateTotalScore = (scores) => scores.reduce((a, b) => a + b, 0);
const calculateTotalTime = (times) => times.reduce((a, b) => a + b, 0);
const calculateAverageScore = (scores) => scores.length ? calculateTotalScore(scores) / scores.length : 0;

const Rank = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('Tất cả');

  const { isLoggedIn, user } = mockAuth;
  const { texts } = useLanguage();

  const rankData = (data) => {
    const sorted = [...data].sort((a, b) => b.score - a.score);
    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  };

  const fetchLeaderboardData = async (subject = 'Tất cả') => {
    let filtered = mockLeaderboardData;
    if (subject !== 'Tất cả') {
      filtered = mockLeaderboardData.filter((item) => item.subject === subject);
    }

    const updated = filtered.map((item) => ({
      ...item,
      score: calculateTotalScore(item.scores),
      averageScore: calculateAverageScore(item.scores),
      totalTime: calculateTotalTime(item.times),
      attempts: item.scores.length,
    }));

    const ranked = rankData(updated);
    setLeaderboardData(ranked);
  };

  const handleFilter = (subject) => {
    setSelectedSubject(subject);
    fetchLeaderboardData(subject);
  };

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchLeaderboardData(selectedSubject);
    }
  }, [isLoggedIn, user]);

  if (!isLoggedIn) {
    return <div>{texts.plsLogin}</div>;
  }

  return (
    <div className="Rank">
      <h1>{texts.rankings}</h1>
      <Filter onFilter={handleFilter} selectedSubject={selectedSubject} />
      <Leaderboard data={leaderboardData} />
    </div>
  );
};

export default Rank;
