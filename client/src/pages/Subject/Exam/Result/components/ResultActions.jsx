import React from 'react';

export const ResultActions = ({ examData, examId, navigate, subjectId }) => (
  <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
    <button
      disabled
      className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-white text-sm font-semibold opacity-50 cursor-not-allowed"
    >
      <span className="material-symbols-outlined text-base">school</span>
      Ôn tập câu sai (Sắp ra mắt)
    </button>
    <button
      onClick={() => {
        const newStartTime = new Date().toISOString();
        const currentSubjectId = subjectId || examData?.subjectId;
        navigate(`/subjects/${currentSubjectId}/exams/${examId}`, {
          state: {
            examId,
            subjectId: currentSubjectId,
            startTime: newStartTime,
          },
        });
      }}
      className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <span className="material-symbols-outlined text-base">refresh</span>
      Làm lại bài kiểm tra
    </button>
    <button
      onClick={() => {
        const currentSubjectId = subjectId || examData?.subjectId;
        navigate(`/subjects/${currentSubjectId}`, {
          state: { subjectId: currentSubjectId },
        });
      }}
      className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <span className="material-symbols-outlined text-base">list_alt</span>
      Quay về danh sách
    </button>
  </div>
);
