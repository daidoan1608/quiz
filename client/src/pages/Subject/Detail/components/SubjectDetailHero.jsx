import React from 'react';
import { StatsCard } from './SubjectDetailCards';
import SubjectFavoriteButton from './SubjectFavoriteButton';
import SubjectReadinessPanel from './SubjectReadinessPanel';

export default function SubjectDetailHero({
  chapters,
  estimatedHours,
  exams,
  handleSmartPracticeClick,
  isFavorited,
  subjectData,
  subjectId,
  texts,
  toggleFavorite,
  progress,
}) {
  return (
    <section className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="p-6 md:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            <span className="material-symbols-outlined text-base">school</span>
            {texts.overview || 'Tổng quan'}
          </div>
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-4xl">
                {subjectData.name}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
                {subjectData.description ||
                  texts.subjectHubDescription ||
                  'Tổng quan môn học, chương ôn tập và đề kiểm tra được gom chung trong một màn hình để bạn bắt đầu nhanh hơn.'}
              </p>
            </div>

            <SubjectFavoriteButton
              isFavorited={isFavorited}
              subjectData={subjectData}
              subjectId={subjectId}
              texts={texts}
              toggleFavorite={toggleFavorite}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleSmartPracticeClick}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 active:scale-[0.98]"
              type="button"
            >
              <span className="material-symbols-outlined text-base">
                psychology
              </span>
              Ôn tập thông minh
            </button>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatsCard
              title={texts.chapterCount || 'Số chương'}
              value={subjectData.totalChapters || chapters.length}
            />
            <StatsCard
              title={texts.questions || 'Câu hỏi'}
              value={subjectData.totalQuestions || 0}
            />
            <StatsCard
              title={texts.examCount || 'Đề kiểm tra'}
              value={subjectData.totalExams || exams.length}
            />
            <StatsCard
              title={texts.duration || 'Thời lượng'}
              value={`~${estimatedHours}h`}
            />
          </div>
        </div>

        <SubjectReadinessPanel
          chapters={chapters}
          exams={exams}
          progress={progress}
          texts={texts}
        />
      </div>
    </section>
  );
}
