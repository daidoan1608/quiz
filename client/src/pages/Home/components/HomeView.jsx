import React from 'react';
import { PageContainer } from 'components/common/PageContainer';
import HeroSection from './HeroSection';
import InProgressSidebar from './InProgressSidebar';
import LearningPathSection from './LearningPathSection';
import SubjectsSection from './SubjectsSection';
import TeamSection from './TeamSection';

export const HomeView = ({
  displayedAttempts,
  displayedSubjects,
  handleContinueAttempt,
  handleSelectSubject,
  handleStartLearning,
  isLoggedIn,
  learningStats,
  t,
}) => (
  <div className="flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
    <PageContainer className="flex flex-1 flex-col gap-12 py-6 sm:py-8 lg:py-12">
        <HeroSection t={t} onStart={handleStartLearning} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 flex flex-col gap-10">
            <LearningPathSection learningStats={learningStats} />
            <SubjectsSection
              subjects={displayedSubjects}
              t={t}
              onSelectSubject={handleSelectSubject}
            />
          </div>

          <InProgressSidebar
            attempts={displayedAttempts}
            isLoggedIn={isLoggedIn}
            t={t}
            onContinueAttempt={handleContinueAttempt}
          />
        </div>

        <TeamSection t={t} />
    </PageContainer>
  </div>
);
