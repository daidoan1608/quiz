import React from 'react';
import { parseMarkdown } from 'utils/markdown/parseMarkdown';
import { resolveMediaUrl } from 'utils/mediaUrl';

export default function QuestionContent({
  imageAlt = 'Minh họa câu hỏi',
  label,
  question,
}) {
  const content = (
    <div
      className="min-w-0 flex-1 text-base font-normal leading-relaxed text-gray-800 dark:text-gray-200"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(question?.content) }}
    />
  );

  return (
    <>
      <div className="pb-6 pt-1">
        {label ? (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="shrink-0 text-base font-bold leading-relaxed text-gray-800 dark:text-gray-200">
              {label}
            </span>
            {content}
          </div>
        ) : (
          content
        )}
      </div>
      {question?.imageUrl && (
        <div className="my-4 text-center">
          <img
            src={resolveMediaUrl(question.imageUrl)}
            alt={imageAlt}
            className="mx-auto max-h-64 max-w-full rounded-lg border border-gray-200 shadow-sm dark:border-gray-700"
          />
        </div>
      )}
    </>
  );
}
