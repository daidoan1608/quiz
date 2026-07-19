import React from 'react';
import LoginPrompt from './LoginPrompt';
import SubjectDetailHero from './SubjectDetailHero';
import { ChapterSection, ExamSidebar } from './SubjectDetailSections';

export default function SubjectDetailView({
  chapters,
  closeLoginPrompt,
  estimatedHours,
  exams,
  handleChapterClick,
  handleExamClick,
  handleSmartPracticeClick,
  inProgressExams,
  isFavorited,
  navigate,
  progress,
  showLoginPrompt,
  subjectData,
  subjectId,
  texts,
  toggleFavorite,
}) {
  return (
    <div className="bg-background-light text-gray-900 transition-colors duration-300 dark:bg-background-dark dark:text-gray-100">
      {showLoginPrompt && (
        <LoginPrompt
          onLoginRedirect={() => navigate('/login')}
          onClose={closeLoginPrompt}
        />
      )}

      <main className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          <button
            onClick={() => navigate('/subjects')}
            className="font-bold uppercase tracking-wide hover:text-primary"
            type="button"
          >
            {texts.subjects || 'Môn học'}
          </button>
          <span className="material-symbols-outlined text-base">
            chevron_right
          </span>
          <span className="font-bold text-gray-900 dark:text-white">
            {subjectData.name}
          </span>
        </nav>

        <SubjectDetailHero
          chapters={chapters}
          estimatedHours={estimatedHours}
          exams={exams}
          handleSmartPracticeClick={handleSmartPracticeClick}
          isFavorited={isFavorited}
          progress={progress}
          subjectData={subjectData}
          subjectId={subjectId}
          texts={texts}
          toggleFavorite={toggleFavorite}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <ChapterSection
            chapters={chapters}
            handleChapterClick={handleChapterClick}
            texts={texts}
          />
          <ExamSidebar
            exams={exams}
            handleExamClick={handleExamClick}
            inProgressExams={inProgressExams}
            texts={texts}
          />
        </div>
      </main>
    </div>
  );
}
