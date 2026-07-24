import React from 'react';
import { ExamAttemptMetaGrid } from 'pages/Subject/components/ExamAttemptMetaGrid';

export const ResultHeader = ({ examData, rawScore, userExam }) => (
  <section className="aura-surface-panel p-6">
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

      <ExamAttemptMetaGrid examData={examData} userExam={userExam} />
    </div>
  </section>
);
