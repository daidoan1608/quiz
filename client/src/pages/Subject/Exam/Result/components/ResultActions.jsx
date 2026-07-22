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
      className="aura-button aura-button-primary px-5 text-sm"
      type="button"
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
      className="aura-button aura-button-subtle px-5 text-sm"
      type="button"
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
      className="aura-button aura-button-subtle px-5 text-sm"
      type="button"
    >
      <span className="material-symbols-outlined text-base">list_alt</span>
      Quay về danh sách
    </button>
  </div>
);
