import React from "react";

export const ExamBreadcrumb = ({
  texts,
  navigate,
  subjectId,
  subjectName,
  title,
}) => (
  <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
    <button
      onClick={() => navigate("/subjects")}
      className="font-bold uppercase tracking-wide hover:text-primary"
    >
      {texts.subjects || "Môn học"}
    </button>
    <span className="material-symbols-outlined text-base">chevron_right</span>
    <button
      onClick={() =>
        subjectId
          ? navigate(`/subjects/${subjectId}`, { state: { subjectId } })
          : navigate("/subjects")
      }
      className="max-w-[220px] truncate font-bold hover:text-primary"
    >
      {subjectName || texts.subjects || "Môn học"}
    </button>
    <span className="material-symbols-outlined text-base">chevron_right</span>
    <span className="max-w-[260px] truncate font-bold text-gray-900 dark:text-white">
      {title || texts.exam || "Bài kiểm tra"}
    </span>
  </nav>
);
