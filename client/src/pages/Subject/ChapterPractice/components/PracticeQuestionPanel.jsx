import React from 'react';
import {
  isMultipleChoice,
  normalizeSelectedIndexes,
} from 'pages/Subject/utils/questionUtils';
import QuestionContent from 'pages/Subject/components/QuestionPanelShared/QuestionContent';
import QuestionPanelShell from 'pages/Subject/components/QuestionPanelShared/QuestionPanelShell';
import SelectableAnswerOption from 'pages/Subject/components/QuestionPanelShared/SelectableAnswerOption';
import { getPracticeAnswerClassName } from '../utils/practiceAnswerStyles';
import ConfirmMultipleAnswerButton from './ConfirmMultipleAnswerButton';
import MarkedQuestionButton from './MarkedQuestionButton';
import PracticeAnswerExplanation from './PracticeAnswerExplanation';

export const PracticeQuestionPanel = ({
  confirmedAnswers,
  currentQuestion,
  currentQuestionIndex,
  hasAnswered,
  isMarkingEnabled = true,
  markedQuestions,
  onAnswerSelect,
  onConfirmMultipleAnswer,
  onNext,
  onPrevious,
  onToggleMarkedQuestion,
  questionCount,
  selectedValue,
  visibleAnswers,
}) => {
  const isMultiple = isMultipleChoice(currentQuestion);
  const isMarked = markedQuestions.has(Number(currentQuestion?.questionId));

  return (
    <QuestionPanelShell
      footerLabels={{ previous: 'Câu trước', next: 'Câu tiếp theo' }}
      isNextDisabled={currentQuestionIndex === questionCount - 1}
      isPreviousDisabled={currentQuestionIndex === 0}
      onNext={onNext}
      onPrevious={onPrevious}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <QuestionContent
            label={`Câu ${currentQuestionIndex + 1}:`}
            question={currentQuestion}
          />
        </div>
        {isMarkingEnabled && (
          <MarkedQuestionButton
            isMarked={isMarked}
            onClick={onToggleMarkedQuestion}
          />
        )}
      </div>
      <div className="space-y-4">
        {visibleAnswers.map((answer, index) => {
          const isSelected = isMultiple
            ? normalizeSelectedIndexes(selectedValue).includes(index)
            : selectedValue === index;
          const isCorrect = Boolean(answer.isCorrect);
          const answerClass = getPracticeAnswerClassName({
            hasAnswered,
            isCorrect,
            isSelected,
          });

          return (
            <SelectableAnswerOption
              answer={answer}
              answerClassName={answerClass}
              disabled={hasAnswered}
              inputName={`question-${currentQuestionIndex}`}
              inputType={isMultiple ? 'checkbox' : 'radio'}
              isSelected={isSelected}
              key={answer.optionId || index}
              onSelect={() => onAnswerSelect(index)}
              suffix={
                <>
                  {hasAnswered && isCorrect && (
                    <span className="material-symbols-outlined ml-3 text-green-600">
                      check_circle
                    </span>
                  )}
                  {hasAnswered && isSelected && !isCorrect && (
                    <span className="material-symbols-outlined ml-3 text-red-600">
                      cancel
                    </span>
                  )}
                </>
              }
            />
          );
        })}
      </div>

      {isMultiple && !confirmedAnswers[currentQuestionIndex] && (
        <ConfirmMultipleAnswerButton onClick={onConfirmMultipleAnswer} />
      )}

      {hasAnswered && <PracticeAnswerExplanation />}
    </QuestionPanelShell>
  );
};
