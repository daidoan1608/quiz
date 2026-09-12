import React, { useState, useEffect, useCallback } from 'react';
import { aiApi } from 'api/services/aiApi';
import { useAuth } from 'context/auth/AuthProvider';

export default function ExamAiAnalysisCard({ userExamId, className = '' }) {
  const { isLoggedIn } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchAnalysis = useCallback(async () => {
    if (!userExamId || !isLoggedIn) return;

    setLoading(true);
    setError(null);

    try {
      const data = await aiApi.analyzeExamResult(userExamId);
      if (data) {
        setAnalysis(data);
      }
    } catch (err) {
      console.warn('Could not load AI exam analysis:', err);
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Không thể phân tích bài thi bằng AI vào lúc này.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userExamId, isLoggedIn]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  if (!userExamId) return null;

  if (!isLoggedIn) {
    return (
      <section className={`aura-surface-panel p-5 shadow-sm ${className}`}>
        <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
          <span className="material-symbols-outlined text-purple-600 text-lg">psychology</span>
          <span>Đăng nhập tài khoản để nhận đánh giá và phân tích chuyên sâu từ Trợ lý AI.</span>
        </div>
      </section>
    );
  }


  const getTierConfig = (tier) => {
    switch (tier?.toUpperCase()) {
      case 'XUẤT SẮC':
        return {
          badgeClass:
            'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700',
          icon: 'emoji_events',
          label: 'XUẤT SẮC',
        };
      case 'GIỎI':
        return {
          badgeClass:
            'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700',
          icon: 'military_tech',
          label: 'GIỎI',
        };
      case 'KHÁ':
        return {
          badgeClass:
            'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-700',
          icon: 'stars',
          label: 'KHÁ',
        };
      case 'TRUNG BÌNH':
        return {
          badgeClass:
            'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-700',
          icon: 'trending_flat',
          label: 'TRUNG BÌNH',
        };
      default:
        return {
          badgeClass:
            'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700',
          icon: 'flag',
          label: 'CẦN CỐ GẮNG',
        };
    }
  };

  const tierConfig = getTierConfig(analysis?.performanceTier);

  return (
    <section className={`aura-surface-panel p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
            <span className="material-symbols-outlined text-lg">psychology</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
              <span>Đánh giá & Phân tích từ Trợ lý AI</span>
              {analysis && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${tierConfig.badgeClass}`}
                >
                  <span className="material-symbols-outlined text-sm">{tierConfig.icon}</span>
                  {tierConfig.label}
                </span>
              )}
            </h3>
          </div>
          {analysis?.cached && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              ⚡ Tức thì
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {analysis && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span>{isExpanded ? 'Thu gọn' : 'Xem chi tiết'}</span>
              <span className="material-symbols-outlined text-sm">
                {isExpanded ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="py-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-purple-700 dark:text-purple-300 font-medium text-sm">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent dark:border-purple-400" />
            <span>AI đang phân tích kết quả bài thi theo chương và độ khó...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="h-28 animate-pulse rounded-xl bg-gray-200/70 dark:bg-gray-800" />
            <div className="h-28 animate-pulse rounded-xl bg-gray-200/70 dark:bg-gray-800" />
            <div className="h-28 animate-pulse rounded-xl bg-gray-200/70 dark:bg-gray-800" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="py-4 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between gap-2">
          <span>Chưa thể tải phân tích AI cho bài thi này.</span>
          <button
            type="button"
            onClick={fetchAnalysis}
            className="text-xs text-primary font-semibold hover:underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Content */}
      {analysis && !loading && isExpanded && (
        <div className="pt-4 space-y-4">
          {/* Summary Box */}
          {analysis.summary && (
            <div className="rounded-xl border border-purple-200/70 bg-gradient-to-r from-purple-50/60 via-indigo-50/30 to-transparent p-4 text-sm text-purple-950 dark:border-purple-900/40 dark:from-purple-950/30 dark:via-indigo-950/20 dark:text-purple-200 leading-relaxed flex items-start gap-3">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-lg shrink-0 mt-0.5">
                auto_awesome
              </span>
              <div>
                <span className="font-bold block mb-1 text-purple-900 dark:text-purple-300">
                  Nhận xét tổng quan:
                </span>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {analysis.summary}
                </p>
              </div>
            </div>
          )}

          {/* 3 Columns for Strengths, Weaknesses, Recommendations */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Strengths */}
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/15">
              <div className="flex items-center gap-2 mb-3 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <span className="material-symbols-outlined text-base text-emerald-600 dark:text-emerald-400">
                  check_circle
                </span>
                <span>Điểm sáng & Nắm chắc</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {analysis.strengths?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-xs shrink-0 mt-0.5">
                      done
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="rounded-xl border border-rose-200/80 bg-rose-50/30 p-4 dark:border-rose-900/40 dark:bg-rose-950/15">
              <div className="flex items-center gap-2 mb-3 text-rose-800 dark:text-rose-300 font-bold text-sm">
                <span className="material-symbols-outlined text-base text-rose-600 dark:text-rose-400">
                  warning
                </span>
                <span>Lỗ hổng & Điểm cần cải thiện</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {analysis.weaknesses?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-rose-500 text-xs shrink-0 mt-0.5">
                      priority_high
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/30 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/15">
              <div className="flex items-center gap-2 mb-3 text-indigo-800 dark:text-indigo-300 font-bold text-sm">
                <span className="material-symbols-outlined text-base text-indigo-600 dark:text-indigo-400">
                  rocket_launch
                </span>
                <span>Chiến lược cho bài thi tới</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {analysis.recommendations?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-indigo-500 text-xs shrink-0 mt-0.5">
                      arrow_forward
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
