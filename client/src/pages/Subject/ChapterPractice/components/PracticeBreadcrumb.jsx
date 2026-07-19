import React from 'react';
import { AppBreadcrumb } from 'components/common/AppBreadcrumb';

export const PracticeBreadcrumb = ({
  className = 'mb-6',
  displaySubjectName,
  displayTitle,
  navigate,
  subjectId,
  texts,
}) => {
  const subjectsLabel = texts.subjects || 'Môn học';
  const subjectCrumbLabel = displaySubjectName || subjectsLabel;

  return (
    <AppBreadcrumb
      className={className}
      items={[
        {
          label: subjectsLabel,
          onClick: () => navigate('/subjects'),
        },
        {
          label: subjectCrumbLabel,
          onClick: () =>
            subjectId
              ? navigate(`/subjects/${subjectId}`, { state: { subjectId } })
              : navigate('/subjects'),
        },
        {
          label: displayTitle,
        },
      ]}
    />
  );
};
