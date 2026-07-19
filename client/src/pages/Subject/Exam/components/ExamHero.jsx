import React from "react";
import { progressValueStyle } from 'utils/styleVariables';

export const ExamHero = ({
  texts,
  title,
  answeredCount,
  questionCount,
  progressPercent,
}) => (
  <section className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="p-6 md:p-8">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
        <span className="material-symbols-outlined text-base">quiz</span>
        {texts.takeExam || "Làm bài kiểm tra"}
      </div>
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-4xl">
            {title || texts.exam || "Bài kiểm tra"}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
            {texts.examDescription ||
              "Hoàn thành các câu hỏi trong thời gian quy định. Bạn có thể chuyển nhanh giữa các câu bằng bảng bên phải."}
          </p>
        </div>
        <div className="rounded-2xl bg-primary/10 px-5 py-4 text-right text-primary">
          <p className="text-xs font-bold uppercase tracking-wide">
            {texts.progress || "Tiến độ"}
          </p>
          <p className="text-3xl font-black">
            {answeredCount}/{questionCount}
          </p>
        </div>
      </div>
      <div className="aura-progress mt-6 h-2.5 w-full">
        <div
          className="aura-progress__bar aura-progress__bar--primary"
          style={progressValueStyle(progressPercent)}
        />
      </div>
    </div>
  </section>
);
