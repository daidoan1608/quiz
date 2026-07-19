import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExamSubjectHistory from './examHistory/ExamSubjectHistory';
import { getUserExamId } from './examHistory/examHistoryFormatters';

export default function ExamHistoryList({ groupedExams, texts }) {
  const navigate = useNavigate();

  const [expandedSubjects, setExpandedSubjects] = useState({});

  const handleShowDetail = (exam) => {
    const userExamId = getUserExamId(exam);
    navigate(`/account/exam-attempts/${userExamId}?examId=${exam.examId}`, {
      state: {
        examId: exam.examId,
        userExamId,
      },
    });
  };

  const toggleSubject = (subject) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [subject]: prev[subject] === undefined ? true : !prev[subject],
    }));
  };

  if (Object.keys(groupedExams).length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        {texts?.noExamHistory || 'Chưa có lịch sử làm bài.'}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(groupedExams).map(([subject, exams]) => {
        const isExpanded = expandedSubjects[subject] === true;

        return (
          <ExamSubjectHistory
            exams={exams}
            isExpanded={isExpanded}
            key={subject}
            onShowDetail={handleShowDetail}
            onToggle={() => toggleSubject(subject)}
            subject={subject}
            texts={texts}
          />
        );
      })}
    </div>
  );
}
