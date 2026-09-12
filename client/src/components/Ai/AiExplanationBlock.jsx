import React, { useState } from 'react';
import { aiApi } from 'api/services/aiApi';
import { parseMarkdown } from 'utils/markdown/parseMarkdown';

export default function AiExplanationBlock({
  questionId,
  selectedAnswerIds = [],
  className = '',
  buttonSize = 'default',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanationData, setExplanationData] = useState(null);
  const [error, setError] = useState(null);

  const fetchExplanation = async () => {
    if (explanationData) {
      setIsOpen((prev) => !prev);
      return;
    }

    setIsOpen(true);
    setLoading(true);
    setError(null);

    try {
      const data = await aiApi.explainQuestion(questionId, selectedAnswerIds);
      setExplanationData(data);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Không thể lấy giải thích từ AI vào lúc này. Vui lòng thử lại sau.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedExplanation = (rawText) => {
    if (!rawText) return null;

    // Enhance standard headers and bullet points for clean UI display
    const enhancedText = rawText
      .replace(
        /^###\s+(.+)$/gm,
        '<h4 class="ai-explain-title text-base font-bold text-indigo-700 dark:text-indigo-400 mt-3.5 mb-1.5 flex items-center gap-1.5">$1</h4>'
      )
      .replace(
        /^##\s+(.+)$/gm,
        '<h3 class="ai-explain-main-title text-lg font-bold text-gray-900 dark:text-white mt-4 mb-2">$1</h3>'
      )
      .replace(
        /^-\s+(.+)$/gm,
        '<li class="ai-explain-item ml-4 list-disc text-sm text-gray-700 dark:text-gray-300 leading-relaxed">$1</li>'
      );

    return (
      <div
        className="ai-explanation-content space-y-2 text-sm leading-relaxed text-gray-800 dark:text-gray-200"
        dangerouslySetInnerHTML={{ __html: parseMarkdown(enhancedText) }}
      />
    );
  };

  const isSmall = buttonSize === 'small';

  return (
    <div className={`mt-3 ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={fetchExplanation}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-lg border font-medium transition-all duration-200 shadow-2xs ${
          isSmall
            ? 'px-2.5 py-1 text-xs'
            : 'px-3.5 py-1.5 text-sm'
        } ${
          isOpen
            ? 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-700'
            : 'bg-gradient-to-r from-purple-50 to-indigo-50 text-indigo-700 border-purple-200 hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300 hover:shadow-xs dark:from-purple-950/40 dark:to-indigo-950/40 dark:text-purple-300 dark:border-purple-800 dark:hover:from-purple-950/60 dark:hover:to-indigo-950/60'
        }`}
      >
        <span className="material-symbols-outlined text-base text-purple-600 dark:text-purple-400 animate-pulse">
          auto_awesome
        </span>
        <span>
          {loading
            ? 'AI đang suy nghĩ...'
            : isOpen
            ? 'Thu gọn giải thích AI'
            : '✨ Giải thích bằng AI'}
        </span>
      </button>

      {/* Explanation Box */}
      {isOpen && (
        <div className="mt-3 rounded-xl border border-purple-200/80 bg-gradient-to-b from-purple-50/50 via-white to-indigo-50/30 p-4 shadow-sm dark:border-purple-900/50 dark:from-purple-950/20 dark:via-background-dark dark:to-indigo-950/10">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-purple-100 pb-2.5 dark:border-purple-900/40">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white shadow-xs">
                <span className="material-symbols-outlined text-sm">psychology</span>
              </span>
              <span className="font-semibold text-sm text-purple-950 dark:text-purple-200">
                Trợ lý AI giải thích
              </span>
              {explanationData?.cached && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                  ⚡ Phản hồi tức thì
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
              title="Đóng"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="pt-3">
            {loading && (
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-purple-600 border-t-transparent dark:border-purple-400" />
                <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                  Đang phân tích câu hỏi và tổng hợp kiến thức...
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-red-600 shrink-0 mt-0.5">
                    error
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-xs mb-1">Không thể tạo lời giải thích</p>
                    <p className="text-xs opacity-90">{error}</p>
                    <button
                      type="button"
                      onClick={fetchExplanation}
                      className="mt-2 text-xs font-semibold text-red-700 dark:text-red-300 underline hover:no-underline"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              </div>
            )}

            {explanationData && !loading && (
              <div>
                {renderFormattedExplanation(explanationData.explanation)}
                <div className="mt-4 pt-2 border-t border-purple-100/70 dark:border-purple-900/30 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
                  <span>Nội dung được tạo bởi mô hình AI ({explanationData.provider || 'AI Tutor'})</span>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    Thu gọn
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
