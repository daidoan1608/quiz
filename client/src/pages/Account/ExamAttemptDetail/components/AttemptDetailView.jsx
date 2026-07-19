import React from 'react';
import { PageContainer } from 'components/common/PageContainer';
import { AttemptDetailHeader } from './AttemptDetailHeader';
import { AttemptPerformanceChart } from './AttemptPerformanceChart';
import { AttemptQuestionReviewList } from './AttemptQuestionReviewList';
import { AttemptStats } from './AttemptStats';

export const AttemptDetailView = ({ examData, navigate, summary, userAnswers }) => (
  <div className="relative flex min-h-screen w-full flex-col bg-background-light font-display text-[#111418] dark:bg-background-dark dark:text-gray-200">
    <PageContainer className="flex-1">
      <div className="flex flex-col gap-8">
        <button
          onClick={() => navigate('/account')}
          className="inline-flex w-fit items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-primary dark:text-gray-400 dark:hover:text-primary"
          type="button"
        >
          <span className="material-symbols-outlined !text-lg">arrow_back</span>
          Quay lại tài khoản
        </button>
        <AttemptDetailHeader
          examData={examData}
          userExam={userAnswers?.userExamDto}
        />
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <AttemptStats
              accuracyOnAnswered={summary.accuracyOnAnswered}
              rawScore={summary.rawScore}
            />
            <AttemptPerformanceChart {...summary} />
          </div>
        </section>
        <AttemptQuestionReviewList questionResults={summary.questionResults} />
      </div>
    </PageContainer>
  </div>
);
