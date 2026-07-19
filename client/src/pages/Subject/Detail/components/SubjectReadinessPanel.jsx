import React from 'react';
import { progressValueStyle } from 'utils/styleVariables';
import { MiniInfo } from './SubjectDetailCards';

const SubjectReadinessPanel = ({ chapters, exams, progress, texts }) => (
  <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/40 lg:border-l lg:border-t-0">
    <h3 className="mb-5 text-lg font-black text-gray-950 dark:text-white">
      {texts.readiness || 'Mức độ sẵn sàng'}
    </h3>
    <div className="flex items-center gap-5">
      <div
        className="aura-readiness-ring relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
        style={progressValueStyle(progress)}
      >
        <div className="absolute h-[70%] w-[70%] rounded-full bg-white dark:bg-gray-800" />
        <div className="relative z-10 text-center">
          <span className="block text-2xl font-black text-gray-950 dark:text-white">
            {progress}%
          </span>
          <span className="text-[10px] font-bold uppercase text-gray-500">
            {texts.ready || 'Sẵn sàng'}
          </span>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <MiniInfo label={texts.chapter || 'Chương'} value={`${chapters.length}`} />
        <MiniInfo label={texts.examLabel || 'Đề thi'} value={`${exams.length}`} />
      </div>
    </div>
  </div>
);

export default SubjectReadinessPanel;
