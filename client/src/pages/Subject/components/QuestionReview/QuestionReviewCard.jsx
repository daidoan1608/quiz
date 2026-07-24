import React from 'react';
import { parseMarkdown } from 'utils/markdown/parseMarkdown';
import { resolveMediaUrl } from 'utils/mediaUrl';
import { getAnswerId } from 'pages/Subject/utils/examResultSummary';
import ReviewAnswerOption from './ReviewAnswerOption';
import ReviewStatusBadge from './ReviewStatusBadge';

export default function QuestionReviewCard({
  answerBorderStyleClass,
  answersLayoutClass,
  cardClassName,
  index,
  isCorrect,
  isSkipped,
  question,
  questionContentClassName,
  selectedIds,
  showQuestionImage = false,
}) {
  return (
    <div className={cardClassName}>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div className={questionContentClassName}>
            <div className="flex gap-2 flex-wrap">
              <span className="shrink-0">Câu {index + 1}:</span>
              <div
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(question.content),
                }}
              />
            </div>
            {showQuestionImage && question.imageUrl && (
              <div className="my-2">
                <img
                  src={resolveMediaUrl(question.imageUrl)}
                  alt="Minh họa câu hỏi"
                  className="max-h-48 max-w-full rounded-lg shadow-xs border border-gray-200 dark:border-gray-700"
                  decoding="async"
                  loading="lazy"
                />
              </div>
            )}
          </div>
          <ReviewStatusBadge isCorrect={isCorrect} isSkipped={isSkipped} />
        </div>

        <div className={answersLayoutClass}>
          {question.answers.map((answer, answerIndex) => {
            const answerId = getAnswerId(answer);
            const isUserChoice = selectedIds.includes(answerId);
            const isRightAnswer = answer.isCorrect;

            return (
              <ReviewAnswerOption
                answer={answer}
                answerId={answerId}
                answerIndex={answerIndex}
                borderStyleClass={answerBorderStyleClass}
                isRightAnswer={isRightAnswer}
                isUserChoice={isUserChoice}
                key={answerId || answerIndex}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
