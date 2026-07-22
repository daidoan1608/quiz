import React from 'react';
import { PageContainer } from 'components/common/PageContainer';
import { PageErrorState, PageLoadingState } from 'components/common/PageState';
import { ResultExamView } from './components/ResultExamView';
import { useExamResult } from './hooks/useExamResult';

const ResultErrorState = ({ error, navigate, subjectId, examId }) => (
  <div className="min-h-screen bg-background-light text-[#111418] dark:bg-background-dark dark:text-gray-200">
    <PageContainer>
      <PageErrorState
        actions={
          <>
            {subjectId && examId ? (
              <button
                className="aura-button aura-button-primary px-5 text-sm"
                onClick={() => navigate(`/subjects/${subjectId}/exams/${examId}`)}
                type="button"
              >
                <span className="material-symbols-outlined text-base">
                  play_arrow
                </span>
                Làm bài
              </button>
            ) : null}
            <button
              className="aura-button aura-button-subtle px-5 text-sm"
              onClick={() => navigate('/account')}
              type="button"
            >
              <span className="material-symbols-outlined text-base">person</span>
              Về tài khoản
            </button>
          </>
        }
        description={error}
        title="Không thể mở kết quả"
      />
    </PageContainer>
  </div>
);

export default function ResultExam() {
  const result = useExamResult();

  if (result.loading) {
    return <PageLoadingState minHeightClassName="h-screen" />;
  }

  if (result.error) {
    return (
      <ResultErrorState
        error={result.error}
        examId={result.examId}
        navigate={result.navigate}
        subjectId={result.subjectId}
      />
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
