import React, { useMemo } from 'react';
import { Table } from 'antd';
import { useLanguage } from '../Context/LanguageProvider';
import './Leaderboard.css';
import subjectTranslations from '../../Languages/subjectTranslations';

export const getTitle = (averageScore, texts) => {
  if (averageScore >= 30) return texts.master;
  if (averageScore >= 20) return texts.expert;
  if (averageScore >= 10) return texts.scholar;
  return texts.novice;
};

const translateSubject = (subject, language = 'vi') => {
  return subjectTranslations[subject]?.[language] || subjectTranslations[subject]?.vi || 'Không rõ';
};

const Leaderboard = ({ data = [], currentUserId }) => {
  const { texts, language } = useLanguage();

  // Kiểm tra nếu currentUserId không hợp lệ
  if (!currentUserId) {
    console.warn('currentUserId không được cung cấp hoặc không hợp lệ:', currentUserId);
  }

  const columns = useMemo(
    () => [
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
        render: (score) => (typeof score === 'number' ? score.toFixed(1) : score || '0.0'),
        sorter: (a, b) => (Number(a.averageScore) || 0) - (Number(b.averageScore) || 0),
      },
      {
        title: texts.totalScore,
        dataIndex: 'score',
        key: 'score',
        render: (score) => (typeof score === 'number' ? score.toFixed(1) : score || '0.0'),
        sorter: (a, b) => (Number(a.score) || 0) - (Number(b.score) || 0),
      },
      {
        title: texts.totalTime,
        dataIndex: 'totalTime',
        key: 'totalTime',
        render: (time) => time || `0 ${texts.minutes} 0 ${texts.seconds}`,
        sorter: (a, b) => {
          const parseTime = (timeStr) => {
            if (!timeStr || timeStr === `0 ${texts.minutes} 0 ${texts.seconds}`) return 0;
            const parts = timeStr.split(' ').filter((part) => !isNaN(parseInt(part)));
            const minutes = parts[0] ? parseInt(parts[0]) : 0;
            const seconds = parts[1] ? parseInt(parts[1]) : 0;
            return minutes * 60 + seconds;
          };
          return parseTime(a.totalTime) - parseTime(b.totalTime);
        },
      },
      {
        title: texts.badge,
        dataIndex: 'badge',
        key: 'badge',
        render: (badge, record) => badge || getTitle(Number(record.averageScore) || 0, texts),
      },
      {
        title: texts.subject,
        dataIndex: 'subject',
        key: 'subject',
        render: (subject) => translateSubject(subject, language) || texts.unknown || 'Không rõ',
      },
    ],
    [texts, language],
  );

  if (!Array.isArray(data)) {
    console.warn('Dữ liệu bảng xếp hạng không phải là mảng:', data);
    return <div>{texts.noData}</div>;
  }

  return (
    <Table
      dataSource={data.slice(0, 10)}
      columns={columns}
      rowKey="username"
      pagination={false}
      className="leaderboard-table"
      locale={{ emptyText: texts.noData }}
      rowClassName={(record) =>
        record.userId === currentUserId ? 'highlight-row' : ''
      }
      scroll={{ x: 'max-content' }} // Cho phép cuộn ngang nếu không đủ chỗ
    />

  );
};

export default Leaderboard;