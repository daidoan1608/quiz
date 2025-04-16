import React, { useState, useEffect } from 'react';
import Filter from './Filter';
import Leaderboard from './Leaderboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Rank/Rank.css'

// Dữ liệu giả lập (mock data)
const initialData = [
  { rank: 1, username: 'CodeMaster', score: 950, badge: '🏆 Chuyên gia C', subject: 'Trí tuệ nhân tạo', time: '12:30' },
  { rank: 2, username: 'DataWizard', score: 920, badge: '🌟 Vua thi thử', subject: 'Thiết kế mạng máy tính', time: '13:15' },
  { rank: 3, username: 'NetworkNinja', score: 890, badge: '💡 Người mới', subject: 'Mạng máy tính', time: '14:00' },
  { rank: 4, username: 'AlgoPro', score: 850, badge: '💡 Người mới', subject: 'Lập trình C', time: '15:10' },
  { rank: 5, username: 'CodeRiser', score: 820, badge: '💡 Người mới', subject: 'Cơ sở dữ liệu', time: '16:20' },
];

const Rank = () => {
  const [leaderboardData, setLeaderboardData] = useState(initialData);
  const [selectedSubject, setSelectedSubject] = useState('Tất cả');
  const [previousRank, setPreviousRank] = useState(null);

  // Giả định người dùng hiện tại (current user)
  const currentUser = 'CodeRiser'; // Thay bằng dữ liệu thực từ hệ thống đăng nhập

  // Tìm thứ hạng của người dùng hiện tại
  const getUserRank = (data) => {
    const user = data.find((item) => item.username === currentUser);
    return user ? user.rank : null;
  };

  // Lọc dữ liệu theo môn học
  const handleFilter = (subject) => {
    setSelectedSubject(subject);
    let filteredData = initialData;
    if (subject !== 'Tất cả') {
      filteredData = initialData.filter((item) => item.subject === subject);
    }

    // Lấy thứ hạng hiện tại trước khi cập nhật
    const currentRank = getUserRank(leaderboardData);

    // Cập nhật dữ liệu bảng xếp hạng
    setLeaderboardData(filteredData);

    // Lấy thứ hạng mới sau khi cập nhật
    const newRank = getUserRank(filteredData);

    // So sánh và hiển thị thông báo
    if (previousRank !== null && newRank !== null && currentRank !== newRank) {
      if (newRank < currentRank) {
        toast.success(`🎉 Chúc mừng! Bạn đã tăng hạng từ ${currentRank} lên ${newRank}!`, {
          position: 'top-right',
          autoClose: 3000,
        });
      } else if (newRank > currentRank) {
        toast.warning(`⚠️ Bạn đã bị vượt! Thứ hạng giảm từ ${currentRank} xuống ${newRank}. Cố gắng lên nhé!`, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    }

    // Cập nhật thứ hạng trước đó
    if (newRank !== null) {
      setPreviousRank(newRank);
    }
  };

  // Giả lập cập nhật dữ liệu định kỳ
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedData = [...initialData];
      updatedData[4] = { ...updatedData[4], score: updatedData[4].score + 10 };
      updatedData.sort((a, b) => b.score - a.score);
      updatedData.forEach((item, index) => (item.rank = index + 1));

      const currentRank = getUserRank(leaderboardData);
      setLeaderboardData(updatedData);
      const newRank = getUserRank(updatedData);

      if (previousRank !== null && newRank !== null && currentRank !== newRank) {
        if (newRank < currentRank) {
          toast.success(`🎉 Chúc mừng! Bạn đã tăng hạng từ ${currentRank} lên ${newRank}!`, {
            position: 'top-right',
            autoClose: 3000,
          });
        } else if (newRank > currentRank) {
          toast.warning(`⚠️ Bạn đã bị vượt! Thứ hạng giảm từ ${currentRank} xuống ${newRank}. Cố gắng lên nhé!`, {
            position: 'top-right',
            autoClose: 3000,
          });
        }
      }

      if (newRank !== null) {
        setPreviousRank(newRank);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [leaderboardData, previousRank]);

  // Khởi tạo thứ hạng ban đầu
  useEffect(() => {
    const initialRank = getUserRank(leaderboardData);
    setPreviousRank(initialRank);
  }, []);

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