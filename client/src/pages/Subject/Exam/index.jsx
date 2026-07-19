import React from 'react';
import { ExamAttemptView } from './components/ExamAttemptView';
import { useExamAttempt } from './hooks/useExamAttempt';

export default function Exam() {
  const examAttempt = useExamAttempt();

  if (examAttempt.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        {examAttempt.texts.loadingExam || 'Đang tải đề thi...'}
      </div>
    );
  }

  return <ExamAttemptView {...examAttempt} />;
}
