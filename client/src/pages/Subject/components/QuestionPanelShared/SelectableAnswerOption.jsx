import React from 'react';
import { parseMarkdown } from 'utils/markdown/parseMarkdown';

export default function SelectableAnswerOption({
  answer,
  answerClassName,
  disabled = false,
  inputName,
  inputType,
  isSelected,
  onSelect,
  suffix,
}) {
  return (
    <label
      className={`flex cursor-pointer items-start rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${answerClassName}`}
    >
      <input
        type={inputType}
        name={inputName}
        className="mt-0.5 h-5 w-5 flex-shrink-0 border-gray-300 text-primary focus:ring-primary"
        checked={isSelected}
        onChange={onSelect}
        disabled={disabled}
      />
      <span
        className={`ml-4 text-base font-medium ${suffix ? 'flex-1' : ''} ${
          isSelected && !suffix ? 'text-primary dark:text-white' : ''
        }`}
        dangerouslySetInnerHTML={{ __html: parseMarkdown(answer.content) }}
      />
      {suffix}
    </label>
  );
}
