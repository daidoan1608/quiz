import React from 'react';

const formatDateTime = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleString('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

const formatDuration = ({ endTime, startTime }) => {
  if (!endTime || !startTime) return '--';
  const durationMinutes = Math.max(
    0,
    Math.round((new Date(endTime) - new Date(startTime)) / 60000)
  );
  return `${durationMinutes} phút`;
};

const ResultMetaItem = ({ label, value }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {label}
    </p>
    <p className="mt-1 text-base font-black text-gray-950 dark:text-white">
      {value}
    </p>
  </div>
);

export const ResultHeader = ({ examData, rawScore, userExam }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-4xl">
          Kết quả: {examData.title}
        </h1>
        <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
          {rawScore >= 50
            ? 'Chúc mừng! Bạn đã hoàn thành bài kiểm tra.'
            : 'Kết quả chưa tốt, hãy cố gắng hơn lần sau nhé!'}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ResultMetaItem
          label="Môn"
          value={examData.subjectName || userExam?.subjectName || '--'}
        />
        <ResultMetaItem
          label="Thời gian làm"
          value={formatDuration({
            endTime: userExam?.endTime,
            startTime: userExam?.startTime,
          })}
        />
        <ResultMetaItem
          label="Bắt đầu"
          value={formatDateTime(userExam?.startTime)}
        />
        <ResultMetaItem label="Nộp lúc" value={formatDateTime(userExam?.endTime)} />
      </div>
    </div>
  </section>
);
