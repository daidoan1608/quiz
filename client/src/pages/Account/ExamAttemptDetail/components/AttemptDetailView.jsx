import React from 'react';
import { AttemptDetailHeader } from './AttemptDetailHeader';
import { AttemptPerformanceChart } from './AttemptPerformanceChart';
import { AttemptQuestionReviewList } from './AttemptQuestionReviewList';
import { AttemptStats } from './AttemptStats';

export const AttemptDetailView = ({ examData, navigate, summary }) => (
  <div className="relative flex min-h-screen w-full flex-col font-display bg-background-light dark:bg-[#111418] text-[#111418] dark:text-gray-200">
    <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col gap-8">
        <AttemptDetailHeader navigate={navigate} title={examData.title} />
        <AttemptStats
          accuracyOnAnswered={summary.accuracyOnAnswered}
          rawScore={summary.rawScore}
        />
        <AttemptPerformanceChart {...summary} />
        <AttemptQuestionReviewList questionResults={summary.questionResults} />
      </div>
    </main>
  </div>
);
