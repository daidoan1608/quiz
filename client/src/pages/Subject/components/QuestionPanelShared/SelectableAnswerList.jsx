import React from 'react';
import {
  isMultipleChoice,
  normalizeSelectedIndexes,
} from 'pages/Subject/utils/questionUtils';
import SelectableAnswerOption from './SelectableAnswerOption';

export default function SelectableAnswerList({
  answers = [],
  disabled,
  getAnswerClassName,
  getAnswerSuffix,
  inputName,
  onAnswerSelect,
  question,
  selectedValue,
}) {
  const isMultiple = isMultipleChoice(question);
  const normalizedSelectedIndexes = isMultiple
    ? normalizeSelectedIndexes(selectedValue)
    : [];

  return (
    <div className="space-y-4">
      {answers.map((answer, index) => {
        const isSelected = isMultiple
          ? normalizedSelectedIndexes.includes(index)
          : selectedValue === index;

        return (
          <SelectableAnswerOption
            answer={answer}
            answerClassName={getAnswerClassName({ answer, index, isSelected })}
            disabled={disabled}
            inputName={inputName}
            inputType={isMultiple ? 'checkbox' : 'radio'}
            isSelected={isSelected}
            key={answer.optionId || index}
            onSelect={() => onAnswerSelect(index)}
            suffix={getAnswerSuffix?.({ answer, index, isSelected })}
          />
        );
      })}
    </div>
  );
}
