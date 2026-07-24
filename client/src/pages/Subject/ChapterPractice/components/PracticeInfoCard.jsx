import React from 'react';
import { SessionInfoCard } from 'pages/Subject/components/SessionInfoCard';

export const PracticeInfoCard = ({
  displaySubjectName,
  displayTitle,
  markedCount,
  questionCount,
}) => (
  <aside className="col-span-12 space-y-6 lg:col-span-3">
    <SessionInfoCard
      rows={[
        { label: 'Môn', value: displaySubjectName },
        { label: 'Số câu', value: questionCount },
        { label: 'Đã đánh dấu', value: markedCount },
      ]}
      title={displayTitle}
    />
  </aside>
);
