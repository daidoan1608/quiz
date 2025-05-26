import React, { useState, useEffect } from 'react';
import Filter from './Filter';
import Leaderboard, { getTitle } from './Leaderboard';
import './Rank.css';
import { useLanguage } from '../Context/LanguageProvider';
import { useAuth } from '../Context/AuthProvider';
import subjectTranslations from '../../Languages/subjectTranslations';

const translateSubject = (subject, language = 'vi') => {
  return subjectTranslations[subject]?.[language] || subjectTranslations[subject]?.vi || 'Không rõ';
};

const Rank = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('Tất cả');
  const [userRank, setUserRank] = useState(null);
  const { isLoggedIn, user } = useAuth();
  const { texts, language } = useLanguage();

  const formatTime = (seconds) => {
    if (!seconds) return `0 ${texts.minutes} 0 ${texts.seconds}`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} ${texts.minutes} ${remainingSeconds} ${texts.seconds}`;
  };

  const rankData = (data) => {
    const sorted = [...data].sort((a, b) => (Number(b.averageScore) || 0) - (Number(a.averageScore) || 0));
    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  };

  const fetchLeaderboardData = async (subject = 'Tất cả') => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/public/summaries');
      if (!response.ok) throw new Error('Lỗi khi lấy dữ liệu bảng xếp hạng');
      const result = await response.json();
      let filtered = result.data || [];
      if (subject !== 'Tất cả') {
        filtered = result.data.filter((item) => item.subjectName === subject);
      }

      const updated = filtered.map((item) => ({
        userId: item.userId,
        username: item.username,
        score: Number(item.totalScore).toFixed(1),
        averageScore: Number(item.avgScore).toFixed(1),
        totalTime: formatTime(item.totalDurationSeconds || 0),
        attempts: item.attemptCount,
        subject: item.subjectName,
        badge: getTitle(Number(item.avgScore) || 0, texts),
      }));

      const ranked = rankData(updated);
      setLeaderboardData(ranked);

      if (user) {
        const foundRank = ranked.find((item) => item.userId === user);
        setUserRank(foundRank ? foundRank.rank : null);
      } else {
        console.warn('Không tìm thấy userId trong thông tin người dùng:', user);
        setUserRank(null);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu bảng xếp hạng:', error);
      setLeaderboardData([]);
      setUserRank(null);
    }
  };

  const handleFilter = (subject) => {
    setSelectedSubject(subject);
    fetchLeaderboardData(subject);
  };

  useEffect(() => {
    if (isLoggedIn && user) {
      console.log('Thông tin người dùng đăng nhập:', user);
      fetchLeaderboardData(selectedSubject);
    } else {
      setUserRank(null);
    }
  }, [isLoggedIn, user, selectedSubject, texts, language]);

  if (!isLoggedIn) {
    return <div>{texts.plsLogin}</div>;
  }

  return (
    <div className="Rank">
      <h1 className="rank-title">{texts.rankings}</h1>
      <Filter onFilter={handleFilter} selectedSubject={selectedSubject} />
      <Leaderboard data={leaderboardData} currentUserId={user || ''} texts={texts} />
      {userRank !== null ? (
        <div className="user-rank">
          <strong>
            {userRank <= 10
              ? `${texts.yourRank} : ${userRank}`
              : texts.noRank}
          </strong>
        </div>
      ) : (
        <div className="user-rank">
          <strong>{texts.noResultMessage}</strong>
        </div>
      )}
    </div>
  );
};

export default React.memo(Rank);