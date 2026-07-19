import React from 'react';
import { parseMarkdown } from 'utils/markdown/parseMarkdown';
import { resolveMediaUrl } from 'utils/mediaUrl';

export default function QuestionContent({
  imageAlt = 'Minh họa câu hỏi',
  question,
}) {
  return (
    <>
      <div
        className="pb-6 pt-1 text-base font-normal leading-relaxed text-gray-800 dark:text-gray-200"
        dangerouslySetInnerHTML={{ __html: parseMarkdown(question?.content) }}
      />
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
