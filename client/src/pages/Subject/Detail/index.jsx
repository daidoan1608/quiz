import React from 'react';
import { PageLoadingState } from 'components/common/PageState';
import SubjectDetailView from './components/SubjectDetailView';
import { useSubjectDetail } from './hooks/useSubjectDetail';

export default function SubjectDetail() {
  const detail = useSubjectDetail();
  const { error, isLoading, navigate, subjectData, texts } = detail;

  if (isLoading) {
    return <PageLoadingState />;
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
