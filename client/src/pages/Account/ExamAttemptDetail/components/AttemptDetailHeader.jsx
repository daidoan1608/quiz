import React from 'react';
import { ExamAttemptMetaGrid } from 'pages/Subject/components/ExamAttemptMetaGrid';

export const AttemptDetailHeader = ({ examData, userExam }) => (
  <section className="aura-surface-panel p-6">
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-4xl">
          {examData.title}
        </h1>
      </div>

      <ExamAttemptMetaGrid examData={examData} userExam={userExam} />
    </div>
  </section>
);
