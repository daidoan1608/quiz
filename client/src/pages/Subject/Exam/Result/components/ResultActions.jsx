import React from 'react';

export const ResultActions = ({ examData, examId, navigate, subjectId }) => (
  <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
    <button
      onClick={() => {
        const currentSubjectId = subjectId || examData?.subjectId;
        navigate(`/subjects/${currentSubjectId}/practice`, {
          state: {
            subjectId: currentSubjectId,
            subjectName: examData?.subjectName,
            practiceMode: 'wrongRecent',
          },
        });
      }}
      className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 active:scale-[0.98]"
    >
      <span className="material-symbols-outlined text-base">school</span>
      Ôn tập câu sai
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
      className="flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 text-sm font-bold text-gray-800 shadow-sm transition-colors hover:border-primary/40 hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
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
      className="flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 text-sm font-bold text-gray-800 shadow-sm transition-colors hover:border-primary/40 hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
    >
      <span className="material-symbols-outlined text-base">list_alt</span>
      Quay về danh sách
    </button>
  </div>
);
