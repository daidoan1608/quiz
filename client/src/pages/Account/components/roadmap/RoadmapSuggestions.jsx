import React, { useEffect, useState, useCallback } from 'react';
import { aiApi } from 'api/services/aiApi';
import { useAuth } from 'context/auth/AuthProvider';

export default function RoadmapSuggestions({ roadmap = [] }) {
  const { isLoggedIn } = useAuth();
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetchRoadmap = useCallback(async (isRefresh = false) => {
    if (!isLoggedIn) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setHasError(false);

    try {
      const data = await aiApi.getLearningRoadmap(isRefresh);
      if (data && data.steps && data.steps.length > 0) {
        setAiData(data);
      }
    } catch (err) {
      console.warn('Could not load AI roadmap:', err);
      setHasError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchRoadmap(false);
  }, [fetchRoadmap]);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60">
            🔥 Ưu tiên cao
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/60">
            🌟 Bứt phá
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60">
            🎯 Duy trì
          </span>
        );
    }
  };

  return (
    <div className="aura-info-note p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="material-symbols-outlined text-primary">route</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Lộ trình học tập AI
          </h3>
          {aiData && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              Cá nhân hóa
            </span>
          )}
          {aiData?.cached && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              ⚡ Tức thì
            </span>
          )}
        </div>

        {isLoggedIn && (
          <button
            type="button"
            onClick={() => fetchRoadmap(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-1 rounded-lg p-1.5 text-xs font-medium text-gray-600 hover:bg-white/80 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            title="Làm mới lộ trình với AI"
          >
            <span className={`material-symbols-outlined text-base ${refreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          <div className="h-16 animate-pulse rounded-lg bg-gray-200/70 dark:bg-gray-800" />
          <div className="h-14 animate-pulse rounded-lg bg-gray-200/70 dark:bg-gray-800" />
          <div className="h-14 animate-pulse rounded-lg bg-gray-200/70 dark:bg-gray-800" />
        </div>
      )}

      {/* AI Roadmap Content */}
      {!loading && aiData && (
        <div className="space-y-3">
          {/* AI Summary Quote */}
          {aiData.summary && (
            <div className="rounded-lg border border-purple-200/80 bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-transparent p-3.5 text-xs sm:text-sm text-purple-950 dark:border-purple-900/50 dark:from-purple-950/30 dark:via-indigo-950/20 dark:text-purple-200 leading-relaxed flex items-start gap-2.5">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-base shrink-0 mt-0.5">
                psychology
              </span>
              <div>
                <span className="font-semibold block mb-0.5 text-purple-900 dark:text-purple-300">
                  Nhận xét từ Cố vấn AI:
                </span>
                <span>{aiData.summary}</span>
              </div>
            </div>
          )}

          {/* Action Steps */}
          {aiData.steps?.map((step) => (
            <div
              key={step.step}
              className="rounded-xl border border-gray-200/70 bg-white p-3.5 shadow-2xs dark:border-gray-800 dark:bg-gray-800 transition-all hover:border-primary/40"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="aura-index-badge size-6 rounded-full text-xs font-bold">
                    {step.step}
                  </span>
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">
                    {step.title}
                  </span>
                </div>
                {getPriorityBadge(step.priority)}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed ml-8">
                {step.action}
              </p>
              {step.subjectName && (
                <div className="ml-8 mt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    <span className="material-symbols-outlined text-xs">school</span>
                    {step.subjectName}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Fallback to static roadmap if AI not available or error */}
      {!loading && (!aiData || hasError) && (
        <div className="space-y-3">
          {roadmap.map((item, index) => (
            <div
              key={item}
              className="flex gap-3 rounded-lg bg-white p-3 text-sm text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200"
            >
              <span className="aura-index-badge size-7 rounded-full text-xs">
                {index + 1}
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
