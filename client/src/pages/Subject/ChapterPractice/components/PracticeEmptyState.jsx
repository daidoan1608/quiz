import React from 'react';
import { PageEmptyState } from 'components/common/PageState';

export const PracticeEmptyState = ({
  emptyText,
  isSubjectPractice,
  onStartPractice,
}) => (
  <PageEmptyState
    action={
      !isSubjectPractice && (
      <button
        onClick={onStartPractice}
        className="aura-button aura-button-primary mt-5 px-6"
        type="button"
      >
        Tải lại câu hỏi
      </button>
      )
    }
    className="rounded-2xl"
    description={emptyText}
  />
);
