import React from "react";
import { AppBreadcrumb } from "components/common/AppBreadcrumb";

export const ExamBreadcrumb = ({
  texts,
  navigate,
  subjectId,
  subjectName,
  title,
}) => (
  <AppBreadcrumb
    items={[
      {
        label: texts.subjects || "Môn học",
        onClick: () => navigate("/subjects"),
      },
      {
        label: subjectName || texts.subjects || "Môn học",
        onClick: () =>
          subjectId
            ? navigate(`/subjects/${subjectId}`, { state: { subjectId } })
            : navigate("/subjects"),
      },
      {
        label: title || texts.exam || "Bài kiểm tra",
      },
    ]}
  />
);
