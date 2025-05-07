import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Filter from './Filter';
import Leaderboard from './Leaderboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Rank.css';
import { useAuth } from '../Context/AuthProvider';

const Rank = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('Tất cả');
  const [previousRank, setPreviousRank] = useState(null);

  const { isLoggedIn, user } = useAuth();

  const getUserRank = (data) => {
    if (!user) return null;
    const userEntry = data.find((item) => item.username === user);
    return userEntry ? userEntry.rank : null;
  };

  const fetchLeaderboardData = async (subject = 'Tất cả') => {
    try {
      const response = await axios.get('/api/leaderboard', {
        params: { subject: subject === 'Tất cả' ? undefined : subject },
      });
      setLeaderboardData(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu bảng xếp hạng:', error);
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
        toast.warning(`⚠️ Bạn đã bị vượt! Thứ hạng giảm từ ${currentRank} xuống ${newRank}. Cố gắng lên nhé!`, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    }

    if (newRank !== null) {
      setPreviousRank(newRank);
    }
  };

  const updateLeaderboard = async () => {
    if (!user) return;

    try {
      const currentUser = leaderboardData.find((item) => item.username === user);
      const updatedScore = (currentUser?.score || 0) + 10;

      const response = await axios.post('/api/update-score', {
        username: user,
        score: updatedScore,
      });

      const updatedData = response.data.updatedData;
      updatedData.sort((a, b) => b.score - a.score);
      updatedData.forEach((item, index) => (item.rank = index + 1));

      const currentRank = getUserRank(leaderboardData);
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

      setLeaderboardData(updatedData);
      if (newRank !== null) {
        setPreviousRank(newRank);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật điểm:', error);
      toast.error('Không thể cập nhật bảng xếp hạng!', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !user) return;

    fetchLeaderboardData();

    const interval = setInterval(() => {
      updateLeaderboard();
    }, 10000);

    return () => clearInterval(interval);
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
