import React from 'react';
import QuestionReviewListBase from 'pages/Subject/components/QuestionReview/QuestionReviewListBase';

export const AttemptQuestionReviewList = ({ questionResults }) => (
  <QuestionReviewListBase
    answerBorderStyleClass="border-l-4 border-y border-r"
    answersLayoutClass="flex flex-col gap-2 mt-2"
    cardClassName="rounded-xl p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
    questionContentClassName="text-gray-800 dark:text-gray-200 font-semibold flex flex-col gap-2"
    questionResults={questionResults}
    showQuestionImage
    titleClassName="text-gray-900 dark:text-white text-2xl font-bold leading-tight"
  />
);
