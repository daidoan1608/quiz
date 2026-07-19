import React from 'react';
import { ResultExamView } from './components/ResultExamView';
import { useExamResult } from './hooks/useExamResult';

export default function ResultExam() {
  const result = useExamResult();

  if (result.loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500 bg-background-light dark:bg-background-dark">
        {result.error}
      </div>
    );
  }

  if (!result.examData || !result.userAnswers?.userExamDto) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Lỗi: Không tìm thấy dữ liệu bài thi chi tiết.
      </div>
    );
  }

  return <ResultExamView {...result} />;
}
