import React from "react";
import { SessionHero } from 'pages/Subject/components/QuestionPanelShared/SessionHero';

export const ExamHero = ({
  texts,
  title,
  answeredCount,
  questionCount,
  progressPercent,
}) => (
  <SessionHero
    action={
      <div className="rounded-xl bg-primary/10 px-5 py-4 text-right text-primary">
        <p className="text-xs font-bold uppercase tracking-wide">
          {texts.progress || "Tiến độ"}
        </p>
        <p className="text-3xl font-black">
          {answeredCount}/{questionCount}
        </p>
      </div>
    }
    badgeIcon="quiz"
    badgeText={texts.takeExam || "Làm bài kiểm tra"}
    description={
      texts.examDescription ||
      "Hoàn thành các câu hỏi trong thời gian quy định. Bạn có thể chuyển nhanh giữa các câu bằng bảng bên phải."
    }
    progress={{
      isVisible: true,
      label: texts.progress || "Tiến độ",
      percent: progressPercent,
      value: `${answeredCount}/${questionCount}`,
    }}
    title={title || texts.exam || "Bài kiểm tra"}
  />
);
