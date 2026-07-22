import React from 'react';
import { PageLoadingState } from 'components/common/PageState';
import { ExamAttemptView } from './components/ExamAttemptView';
import { useExamAttempt } from './hooks/useExamAttempt';

export default function Exam() {
  const examAttempt = useExamAttempt();

  if (examAttempt.isLoading) {
    return (
      <PageLoadingState
        label={examAttempt.texts.loadingExam || 'Đang tải đề thi...'}
      />
    );
  }

  return <ExamAttemptView {...examAttempt} />;
}
