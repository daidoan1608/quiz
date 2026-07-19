import React from 'react';
import { SubjectView } from './components/SubjectView';
import { useSubjects } from './hooks/useSubjects';

export default function Subject() {
  const subjectPage = useSubjects();

  if (subjectPage.loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
          <p className="text-gray-500 font-medium">
            {subjectPage.texts.loadingSubjects ||
              'Đang tải danh sách môn học...'}
          </p>
        </div>
      </div>
    );
  }

  return <SubjectView {...subjectPage} />;
}
