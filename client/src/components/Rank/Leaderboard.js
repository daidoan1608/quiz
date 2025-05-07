import React from 'react';

const getTitle = (score) => {
  if (score >= 1000) return '🏆 Cao thủ';
  if (score >= 500) return '⭐ Chuyên gia';
  if (score >= 200) return '📘 Học giả';
  return '🔰 Tân binh';
};

const Leaderboard = ({ data }) => {
  const hasData = data && data.length > 0;

  return (
    <div className="leaderboard">
      <table>
        <thead>
          <tr>
            <th>Hạng</th>
            <th>Người dùng</th>
            <th>Điểm</th>
            <th>Danh hiệu</th>
            <th>Môn học</th>
          </tr>
        </thead>
        <tbody>
          {hasData ? (
            data.map((user, index) => (
              <tr key={user.username}>
                <td>{user.rank || index + 1}</td>
                <td>{user.username}</td>
                <td>{user.score}</td>
                <td>{getTitle(user.score)}</td>
                <td>{user.subject || 'Không rõ'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>
                Không có dữ liệu.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
