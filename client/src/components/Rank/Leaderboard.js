import React from 'react';
import LeaderboardItem from './LeaderboardItem';

const Leaderboard = ({ data }) => {
  return (
    <div className="leaderboard">
      <table>
        <thead>
          <tr>
            <th>Hạng</th>
            <th>Tên người dùng</th>
            <th>Điểm số</th>
            <th>Huy hiệu</th>
            <th>Thời gian nhanh nhất</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <LeaderboardItem key={item.rank} item={item} />
            ))
          ) : (
            <tr>
              <td colSpan="5">Không có dữ liệu cho môn học này.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;