import React from 'react';
import { ChapterCard, EmptyState, ExamCard } from './SubjectDetailCards';

export function ChapterSection({ chapters, handleChapterClick, texts }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-primary">
            {texts.reviewChapters || 'Chương ôn tập'}
          </p>
          <h2 className="text-2xl font-black text-gray-950 dark:text-white">
            {texts.learnByChapter || 'Học theo chương'}
          </h2>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
          {chapters.length} {texts.chapters || 'chương'}
        </span>
      </div>

      {chapters.length > 0 ? (
        chapters.map((chapter, index) => (
          <ChapterCard
            chapter={chapter}
            index={index}
            key={chapter.chapterId}
            onStart={handleChapterClick}
            texts={texts}
          />
        ))
      ) : (
        <EmptyState
          text={texts.noChapters || 'Chưa có chương bài học nào.'}
          texts={texts}
        />
      )}
    </section>
  );
}

export function ExamSidebar({
  exams,
  handleExamClick,
  inProgressExams,
  texts,
}) {
  return (
    <aside className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          {texts.examLabel || 'Đề thi'}
        </p>
        <h2 className="text-2xl font-black text-gray-950 dark:text-white">
          {texts.quickTest || 'Kiểm tra nhanh'}
        </h2>
      </div>

      <div className="space-y-4 xl:sticky xl:top-24">
        {exams.length > 0 ? (
          exams.map((exam, index) => (
            <ExamCard
              exam={exam}
              index={index}
              inProgress={inProgressExams.has(Number(exam.examId))}
              key={exam.examId}
              onStart={handleExamClick}
              texts={texts}
            />
          ))
        ) : (
          <EmptyState
            compact
            text={texts.noExams || 'Chưa có bài kiểm tra nào.'}
            texts={texts}
          />
        )}
      </div>
    </aside>
  );
}
