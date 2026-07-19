import React from 'react';
import SubjectDetailView from './components/SubjectDetailView';
import { useSubjectDetail } from './hooks/useSubjectDetail';

export default function SubjectDetail() {
  const detail = useSubjectDetail();
  const { error, isLoading, navigate, subjectData, texts } = detail;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error || !subjectData) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center text-red-500">
        <p>{error || texts.noData}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-primary hover:underline"
        >
          {texts.back || 'Quay lại'}
        </button>
      </div>
    );
  }

  return <SubjectDetailView {...detail} />;
}
