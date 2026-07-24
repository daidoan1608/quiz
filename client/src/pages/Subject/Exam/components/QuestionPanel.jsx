import React from "react";
import QuestionContent from 'pages/Subject/components/QuestionPanelShared/QuestionContent';
import QuestionPanelShell from 'pages/Subject/components/QuestionPanelShared/QuestionPanelShell';
import SelectableAnswerList from 'pages/Subject/components/QuestionPanelShared/SelectableAnswerList';

export const QuestionPanel = ({
  texts,
  question,
  questionIndex,
  questionCount,
  selectedValue,
  onAnswerSelect,
  onPrevious,
  onNext,
}) => (
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
      <QuestionContent
        imageAlt={texts.questionIllustration || "Minh họa câu hỏi"}
        label={`${texts.questionLabel || "Câu"} ${questionIndex + 1}:`}
        question={question}
      />
      <SelectableAnswerList
        answers={question?.answers}
        getAnswerClassName={({ isSelected }) =>
          isSelected
            ? "border-primary bg-primary/10 dark:bg-primary/20"
            : "border-gray-200 hover:border-primary/50 dark:border-gray-600"
        }
        inputName={`question-${questionIndex}`}
        onAnswerSelect={onAnswerSelect}
        question={question}
        selectedValue={selectedValue}
      />
    </QuestionPanelShell>
);
