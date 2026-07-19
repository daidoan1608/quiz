import React from 'react';
import { AttemptDetailView } from './components/AttemptDetailView';
import { useExamAttemptDetail } from './hooks/useExamAttemptDetail';

export default function ResultExam() {
  const detail = useExamAttemptDetail();

  if (detail.loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Đang tải kết quả...
      </div>
    );
  }

  if (detail.error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        {detail.error}
      </div>
    );
  }

  if (!detail.examData || !detail.userAnswers?.userExamDto) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Lỗi: Không tìm thấy dữ liệu bài thi chi tiết.
      </div>
    );
  }

  return <AttemptDetailView {...detail} />;
}
