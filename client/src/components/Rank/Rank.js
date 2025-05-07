import React, { useState, useEffect } from 'react';
import Filter from './Filter';
import Leaderboard from './Leaderboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Rank.css';

// MOCK dữ liệu người dùng đăng nhập (thay vì useAuth)
const mockAuth = {
  isLoggedIn: true,
  user: 'alice',
};

// MOCK dữ liệu bảng xếp hạng với nhiều bài thi và điểm
const mockLeaderboardData = [
  { username: 'alice', scores: [95, 85], badge: 'Vàng', rank: 1, subject: 'Nguyên lý hệ điều hành' },
  { username: 'bob', scores: [80, 90], badge: 'Bạc', rank: 2, subject: 'Mạng máy tính' },
  { username: 'charlie', scores: [70, 75], badge: 'Đồng', rank: 3, subject: 'Nguyên lý hệ điều hành' },
  { username: 'david', scores: [60, 70], badge: 'Thường', rank: 4, subject: 'Khai phá dữ liệu' },
];

const Rank = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('Tất cả');
  const [previousRank, setPreviousRank] = useState(null);

  const { isLoggedIn, user } = mockAuth;

  const getUserRank = (data) => {
    if (!user) return null;
    const userEntry = data.find((item) => item.username === user);
    return userEntry ? userEntry.rank : null;
  };

  // Hàm tính tổng điểm từ tất cả các bài thi
  const calculateTotalScore = (scores) => {
    return scores.reduce((total, score) => total + score, 0);
  };

  const fetchLeaderboardData = async (subject = 'Tất cả') => {
    try {
      // Sử dụng mock thay vì gọi API
      let filteredData = mockLeaderboardData;
      if (subject !== 'Tất cả') {
        filteredData = mockLeaderboardData.filter((item) => item.subject === subject);
      }
      // Tính tổng điểm cho mỗi người dùng
      const updatedData = filteredData.map((item) => ({
        ...item,
        score: calculateTotalScore(item.scores), // Thêm tổng điểm vào dữ liệu
      }));
      setLeaderboardData(updatedData);
    } catch (error) {
      console.error('Lỗi mock:', error);
      toast.error('Không thể tải dữ liệu bảng xếp hạng!', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleFilter = async (subject) => {
    setSelectedSubject(subject);
    const currentRank = getUserRank(leaderboardData);
    await fetchLeaderboardData(subject);
    const newRank = getUserRank(leaderboardData);

    if (previousRank !== null && newRank !== null && currentRank !== newRank) {
      if (newRank < currentRank) {
        toast.success(`🎉 Chúc mừng! Bạn đã tăng hạng từ ${currentRank} lên ${newRank}!`, {
          position: 'top-right',
          autoClose: 3000,
        });
      } else if (newRank > currentRank) {
        toast.warning(`⚠️ Bạn đã bị vượt! Thứ hạng giảm từ ${currentRank} xuống ${newRank}.`, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    }

    if (newRank !== null) {
      setPreviousRank(newRank);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    fetchLeaderboardData();
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const initialRank = getUserRank(leaderboardData);
    setPreviousRank(initialRank);
  }, [leaderboardData, isLoggedIn]);

  if (!isLoggedIn) {
    return <div>Vui lòng đăng nhập để xem bảng xếp hạng.</div>;
  }

  return (
    <div className="Rank">
      <h1>Bảng Xếp Hạng FITA</h1>
      <Filter onFilter={handleFilter} selectedSubject={selectedSubject} />
      <Leaderboard data={leaderboardData} />
      <ToastContainer />
    </div>
  );
};

export default Rank;
