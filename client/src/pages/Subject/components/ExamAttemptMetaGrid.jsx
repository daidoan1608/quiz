import React from 'react';
import { formatDateTime, formatDuration } from '../utils/examAttemptFormatters';

export const ExamAttemptMetaItem = ({ label, value }) => (
  <div className="aura-surface-panel p-4">
    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {label}
    </p>
    <p className="mt-1 text-base font-black text-gray-950 dark:text-white">
      {value}
    </p>
  </div>
);

export const ExamAttemptMetaGrid = ({
  examData,
  labels = {},
  locale,
  userExam,
}) => (
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <ExamAttemptMetaItem
      label={labels.subject || 'Môn'}
      value={examData.subjectName || userExam?.subjectName || '--'}
    />
    <ExamAttemptMetaItem
      label={labels.duration || 'Thời gian làm'}
      value={formatDuration(
        {
          endTime: userExam?.endTime,
          startTime: userExam?.startTime,
        },
        labels.minuteUnit || 'phút'
      )}
    />
    <ExamAttemptMetaItem
      label={labels.startedAt || 'Bắt đầu'}
      value={formatDateTime(userExam?.startTime, locale)}
    />
    <ExamAttemptMetaItem
      label={labels.submittedAt || 'Nộp lúc'}
      value={formatDateTime(userExam?.endTime, locale)}
    />
  </div>
);
