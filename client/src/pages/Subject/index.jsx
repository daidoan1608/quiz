import React from 'react';
import { PageLoadingState } from 'components/common/PageState';
import { SubjectView } from './components/SubjectView';
import { useSubjects } from './hooks/useSubjects';

export default function Subject() {
  const subjectPage = useSubjects();

  if (subjectPage.loading) {
    return (
      <PageLoadingState
        label={
          subjectPage.texts.loadingSubjects || 'Đang tải danh sách môn học...'
        }
        minHeightClassName="flex-1"
      />
    );
  }

  return <SubjectView {...subjectPage} />;
}
