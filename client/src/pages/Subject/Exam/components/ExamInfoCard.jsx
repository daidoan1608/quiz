import React from "react";
import { SessionInfoCard } from 'pages/Subject/components/SessionInfoCard';

export const ExamInfoCard = ({ texts, title, subjectName, questionCount }) => (
  <SessionInfoCard
    rows={[
      { label: texts.subject || "Môn", value: subjectName },
      { label: texts.questionCountLabel || "Số câu", value: questionCount },
    ]}
    title={title}
  />
);
