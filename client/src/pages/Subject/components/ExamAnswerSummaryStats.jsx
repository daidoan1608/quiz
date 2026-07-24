import React from 'react';
import { MetricCard } from 'components/common/MetricCard';

const metricLabelClassName =
  'normal-case !text-base !font-medium !tracking-normal !text-gray-600 dark:!text-gray-300';

const formatRawScore = (rawScore, separator = '/') => {
  const value = typeof rawScore === 'number' ? rawScore.toFixed(1) : rawScore;
  return `${value}${separator}100`;
};

export const ExamAnswerSummaryStats = ({
  accuracyOnAnswered,
  rawScore,
  scoreSeparator = '/',
}) => (
  <>
    <MetricCard
      label="Điểm số"
      labelClassName={metricLabelClassName}
      size="lg"
      surface="flat"
      value={formatRawScore(rawScore, scoreSeparator)}
    />
    <MetricCard
      label="Tỷ lệ chính xác"
      labelClassName={metricLabelClassName}
      size="lg"
      surface="flat"
      value={`${accuracyOnAnswered}%`}
    />
    <MetricCard
      label="Trạng thái"
      labelClassName={metricLabelClassName}
      size="lg"
      surface="flat"
      tone={rawScore >= 50 ? 'success' : 'danger'}
      value={rawScore >= 50 ? 'Đạt' : 'Chưa đạt'}
    />
  </>
);
