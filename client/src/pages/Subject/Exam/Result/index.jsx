import React from 'react';
import { PageContainer } from 'components/common/PageContainer';
import { ResultExamView } from './components/ResultExamView';
import { useExamResult } from './hooks/useExamResult';

const ResultErrorState = ({ error, navigate, subjectId, examId }) => (
  <div className="min-h-screen bg-background-light text-[#111418] dark:bg-background-dark dark:text-gray-200">
    <PageContainer>
      <section className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10">
          <span className="material-symbols-outlined">error</span>
        </div>
        <h1 className="mt-4 text-2xl font-black text-gray-950 dark:text-white">
          Không thể mở kết quả
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
          {error}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {subjectId && examId ? (
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md"
              onClick={() => navigate(`/subjects/${subjectId}/exams/${examId}`)}
              type="button"
            >
              <span className="material-symbols-outlined text-base">play_arrow</span>
              Làm bài
            </button>
          ) : null}
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 text-sm font-bold text-gray-800 shadow-sm transition-colors hover:border-primary/40 hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            onClick={() => navigate('/account')}
            type="button"
          >
            <span className="material-symbols-outlined text-base">person</span>
            Về tài khoản
          </button>
        </div>
      </section>
    </PageContainer>
  </div>
);

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
