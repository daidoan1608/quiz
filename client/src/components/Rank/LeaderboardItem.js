import React from 'react';

const LeaderboardItem = ({ item }) => {
  return (
    <tr className={item.rank <= 3 ? 'top-rank' : ''}>
      <td>{item.rank}</td>
      <td>{item.username}</td>
      <td>{item.score}</td>
      <td>{item.badge}</td>
      <td>{item.time} phút</td>
    </tr>
  );
};

export default LeaderboardItem;