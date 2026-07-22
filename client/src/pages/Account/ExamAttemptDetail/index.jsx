import React from 'react';
import { PageErrorState, PageLoadingState } from 'components/common/PageState';
import { AttemptDetailView } from './components/AttemptDetailView';
import { useExamAttemptDetail } from './hooks/useExamAttemptDetail';

export default function ResultExam() {
  const detail = useExamAttemptDetail();

  if (detail.loading) {
    return (
      <PageLoadingState label="Đang tải kết quả..." minHeightClassName="h-screen" />
    );
  }

  if (detail.error) {
    return (
      <PageErrorState className="m-6" description={detail.error} title="Không thể tải kết quả" />
    );
  }

  if (!detail.examData || !detail.userAnswers?.userExamDto) {
    return (
      <PageErrorState
        className="m-6"
        description="Không tìm thấy dữ liệu bài thi chi tiết."
        title="Thiếu dữ liệu"
      />
    );
  }

  return <AttemptDetailView {...detail} />;
}
