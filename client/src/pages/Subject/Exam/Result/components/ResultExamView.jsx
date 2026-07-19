import React from 'react';
import { PerformanceChart } from './PerformanceChart';
import { QuestionReviewList } from './QuestionReviewList';
import { ResultActions } from './ResultActions';
import { ResultHeader } from './ResultHeader';
import { ResultStats } from './ResultStats';

export const ResultExamView = ({
  examData,
  examId,
  navigate,
  subjectId,
  summary,
}) => (
  <div className="relative flex min-h-screen w-full flex-col font-display bg-background-light dark:bg-background-dark text-[#111418] dark:text-gray-200">
    <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col gap-8">
        <ResultHeader rawScore={summary.rawScore} title={examData.title} />
        <ResultStats
          accuracyOnAnswered={summary.accuracyOnAnswered}
          rawScore={summary.rawScore}
        />
        <PerformanceChart {...summary} />
        <ResultActions
          examData={examData}
          examId={examId}
          navigate={navigate}
          subjectId={subjectId}
        />
        <QuestionReviewList questionResults={summary.questionResults} />
      </div>
    </main>
  </div>
);
