import React from 'react';
import { PageContainer } from 'components/common/PageContainer';
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
  userAnswers,
}) => (
  <div className="relative flex min-h-screen w-full flex-col bg-background-light font-display text-[#111418] dark:bg-background-dark dark:text-gray-200">
    <PageContainer className="flex-1">
      <div className="flex flex-col gap-8">
        <ResultHeader
          examData={examData}
          rawScore={summary.rawScore}
          userExam={userAnswers?.userExamDto}
        />
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ResultStats
              accuracyOnAnswered={summary.accuracyOnAnswered}
              rawScore={summary.rawScore}
            />
            <PerformanceChart {...summary} />
          </div>
        </section>
        <ResultActions
          examData={examData}
          examId={examId}
          navigate={navigate}
          subjectId={subjectId}
        />
        <QuestionReviewList questionResults={summary.questionResults} />
      </div>
    </PageContainer>
  </div>
);
