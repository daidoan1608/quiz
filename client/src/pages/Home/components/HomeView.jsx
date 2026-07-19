import React from 'react';
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
  t,
}) => (
  <div className="flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
    <main className="flex flex-1 justify-center py-6 sm:py-8 lg:py-12">
      <div className="flex flex-col w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 gap-12">
        <HeroSection t={t} onStart={handleStartLearning} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 flex flex-col gap-10">
            <LearningPathSection t={t} />
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
      </div>
    </main>
  </div>
);
