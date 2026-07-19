import React from 'react';
import QuestionReviewCard from './QuestionReviewCard';

export default function QuestionReviewListBase({
  answerBorderStyleClass = 'border',
  answersLayoutClass = 'grid grid-cols-1 gap-3 mt-2 sm:grid-cols-2',
  cardClassName = 'rounded-xl p-5 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800',
  questionContentClassName = 'text-gray-800 dark:text-gray-200 font-semibold flex flex-wrap gap-2',
  questionResults,
  showQuestionImage = false,
  titleClassName = 'text-gray-900 dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em]',
}) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className={titleClassName}>Chi tiết câu trả lời</h2>
      <div className="flex flex-col gap-4">
        {questionResults.map(
          ({ question, selectedIds, isSkipped, isCorrect }, index) => (
            <QuestionReviewCard
              answerBorderStyleClass={answerBorderStyleClass}
              answersLayoutClass={answersLayoutClass}
              cardClassName={cardClassName}
              index={index}
              isCorrect={isCorrect}
              isSkipped={isSkipped}
              key={question.questionId}
              question={question}
              questionContentClassName={questionContentClassName}
              selectedIds={selectedIds}
              showQuestionImage={showQuestionImage}
            />
          )
        )}
      </div>
    </div>
  );
}
