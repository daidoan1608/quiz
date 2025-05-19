import React from 'react';
import { Table } from 'antd';
import { useLanguage } from '../Context/LanguageProvider';
import './Leaderboard.css';

// Hàm tính danh hiệu dựa trên điểm
const getTitle = (score) => {
  if (score >= 1000) return '🏆 Cao thủ';
  if (score >= 500) return '⭐ Chuyên gia';
  if (score >= 200) return '📘 Học giả';
  return '🔰 Tân binh';
};

const Leaderboard = ({ data = [] }) => {
  const { texts } = useLanguage();

  // Kiểm tra dữ liệu đầu vào
  if (!Array.isArray(data)) {
    return <div>Không có dữ liệu bảng xếp hạng.</div>;
  }

  const columns = [
    {
      title: texts.id,
      dataIndex: 'rank',
      key: 'rank',
      render: (text, record) => (
        <span style={record.rank <= 3 ? { fontWeight: 'bold', color: '#d48806' } : {}}>
          {record.rank}
        </span>
      ),
      sorter: (a, b) => a.rank - b.rank,
    },
    {
      title: texts.user,
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: texts.attempts,
      dataIndex: 'attempts',
      key: 'attempts',
      render: (text, record) => record.attempts ?? record.scores?.length ?? 0,
      sorter: (a, b) => (a.attempts ?? 0) - (b.attempts ?? 0),
    },
    {
      title: texts.averageScore,
      dataIndex: 'averageScore',
      key: 'averageScore',
      render: (score) => (typeof score === 'number' ? score.toFixed(1) : '0.0'),
      sorter: (a, b) => (a.averageScore ?? 0) - (b.averageScore ?? 0),
    },
    {
      title: texts.totalScore || 'Tổng điểm',
      dataIndex: 'score',
      key: 'score',
      sorter: (a, b) => (a.score ?? 0) - (b.score ?? 0),
    },
    {
      title: texts.totalTime,
      dataIndex: 'totalTime',
      key: 'totalTime',
      render: (time) => `${time ?? 0} ${texts.minutes || 'phút'}`,
      sorter: (a, b) => (a.totalTime ?? 0) - (b.totalTime ?? 0),
    },
    {
      title: texts.badge,
      dataIndex: 'badge',
      key: 'badge',
      render: (badge, record) => badge || getTitle(record.score ?? 0),
    },
    {
      title: texts.subject,
      dataIndex: 'subject',
      key: 'subject',
      render: (subject) => subject || texts.unknown || 'Không rõ',
    },
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey="username"
      pagination={{ pageSize: 10, showSizeChanger: true }}
      className="leaderboard-table"
      locale={{ emptyText: texts.noData || 'Không có dữ liệu' }}
    />
  );
};

export default Leaderboard;