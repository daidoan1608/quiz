import React from "react";

export const ExamInfoCard = ({ texts, title, subjectName, questionCount }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <h4 className="mb-2 line-clamp-2 text-lg font-bold">{title}</h4>
    <p className="text-sm text-gray-500 dark:text-gray-400">
      {texts.subject || "Môn"}: {subjectName}
    </p>
    <p className="text-sm text-gray-500 dark:text-gray-400">
      {texts.questionCountLabel || "Số câu"}: {questionCount}
    </p>
  </div>
);
