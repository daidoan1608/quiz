import React from "react";
import { isMultipleChoice, normalizeSelectedIndexes } from "pages/Subject/utils/questionUtils";
import QuestionContent from 'pages/Subject/components/QuestionPanelShared/QuestionContent';
import QuestionPanelShell from 'pages/Subject/components/QuestionPanelShared/QuestionPanelShell';
import SelectableAnswerOption from 'pages/Subject/components/QuestionPanelShared/SelectableAnswerOption';

export const QuestionPanel = ({
  texts,
  question,
  questionIndex,
  questionCount,
  selectedValue,
  onAnswerSelect,
  onPrevious,
  onNext,
}) => {
  const isMultiple = isMultipleChoice(question);

  return (
    <QuestionPanelShell
      footerLabels={{
        previous: texts.previousQuestion || "Câu trước",
        next: texts.nextQuestion || "Câu tiếp theo",
      }}
      isNextDisabled={questionIndex === questionCount - 1}
      isPreviousDisabled={questionIndex === 0}
      onNext={onNext}
      onPrevious={onPrevious}
    >
      <h3 className="pb-2 text-left text-xl font-bold leading-tight text-primary">
        {texts.questionLabel || "Câu"} {questionIndex + 1}
      </h3>
      <QuestionContent
        imageAlt={texts.questionIllustration || "Minh họa câu hỏi"}
        question={question}
      />
      <div className="space-y-4">
        {question?.answers?.map((answer, index) => {
          const isSelected = isMultiple
            ? normalizeSelectedIndexes(selectedValue).includes(index)
            : selectedValue === index;
          return (
            <SelectableAnswerOption
              answer={answer}
              answerClassName={
                isSelected
                  ? "border-primary bg-primary/10 dark:bg-primary/20"
                  : "border-gray-200 hover:border-primary/50 dark:border-gray-600"
              }
              inputName={`question-${questionIndex}`}
              inputType={isMultiple ? "checkbox" : "radio"}
              isSelected={isSelected}
              key={answer.optionId || index}
              onSelect={() => onAnswerSelect(index)}
            />
          );
        })}
      </div>
    </QuestionPanelShell>
  );
};
