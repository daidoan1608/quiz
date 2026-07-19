export const TIME_FILTER_OPTIONS = [
  { id: 'week', textKey: 'thisWeek', fallback: 'Tuần này' },
  { id: 'month', textKey: 'thisMonth', fallback: 'Tháng này' },
  { id: 'all', textKey: 'all', fallback: 'Tất cả' },
];

export const buildCriteriaOptions = (texts) => [
  { value: 'total', label: texts.accumulatedScore || 'Tổng điểm tích lũy' },
  { value: 'avg', label: texts.averageScoreFull || 'Điểm trung bình' },
];
