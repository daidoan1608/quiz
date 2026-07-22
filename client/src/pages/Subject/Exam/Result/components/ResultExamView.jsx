import React from 'react';
import { PageContainer } from 'components/common/PageContainer';
import { AnswerDistributionChart } from 'pages/Subject/components/AnswerDistributionChart';
import { ExamAnswerSummaryStats } from 'pages/Subject/components/ExamAnswerSummaryStats';
import QuestionReviewListBase from 'pages/Subject/components/QuestionReview/QuestionReviewListBase';
import { ResultActions } from './ResultActions';
import { ResultHeader } from './ResultHeader';

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
        <section className="aura-surface-panel p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ExamAnswerSummaryStats
              accuracyOnAnswered={summary.accuracyOnAnswered}
              rawScore={summary.rawScore}
            />
            <AnswerDistributionChart {...summary} />
          </div>
        </section>
        <ResultActions
          examData={examData}
          examId={examId}
          navigate={navigate}
          subjectId={subjectId}
        />
        <QuestionReviewListBase questionResults={summary.questionResults} />
      </div>
    </PageContainer>
  </div>
);
