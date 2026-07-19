import React from 'react';
import { AppBreadcrumb } from 'components/common/AppBreadcrumb';
import { PageContainer } from 'components/common/PageContainer';
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

      <PageContainer>
        <AppBreadcrumb
          items={[
            {
              label: texts.subjects || 'Môn học',
              onClick: () => navigate('/subjects'),
            },
            {
              label: subjectData.name,
            },
          ]}
        />

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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
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
      </PageContainer>
    </div>
  );
}
