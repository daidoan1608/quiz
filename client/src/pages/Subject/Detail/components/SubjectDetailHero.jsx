import React from 'react';
import {
  getSubjectChapterCount,
  getSubjectExamCount,
  getSubjectQuestionCount,
} from 'pages/Subject/utils/subjectPresentation';
import { StatsCard } from './SubjectDetailCards';
import SubjectFavoriteButton from './SubjectFavoriteButton';
import SubjectReadinessPanel from './SubjectReadinessPanel';

export default function SubjectDetailHero({
  chapters,
  canToggleFavorite,
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
  const chapterCount = getSubjectChapterCount(subjectData);
  const examCount = getSubjectExamCount(subjectData);
  const questionCount = getSubjectQuestionCount(subjectData);

  return (
    <section className="aura-surface-panel mb-8 overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="p-6 md:p-8">
          <div className="aura-kicker-pill mb-4">
            <span className="material-symbols-outlined">school</span>
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
              canToggleFavorite={canToggleFavorite}
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
              className="aura-button aura-button-primary px-5 text-sm"
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
              value={chapterCount || chapters.length}
            />
            <StatsCard
              title={texts.questions || 'Câu hỏi'}
              value={questionCount}
            />
            <StatsCard
              title={texts.examCount || 'Đề kiểm tra'}
              value={examCount || exams.length}
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
