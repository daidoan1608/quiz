export const formatDateTime = (value, locale = 'vi-VN') => {
  if (!value) return '--';

  return new Date(value).toLocaleString(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

export const formatDuration = ({ endTime, startTime }, unitLabel = 'phút') => {
  if (!endTime || !startTime) return '--';

  const durationMinutes = Math.max(
    0,
    Math.round((new Date(endTime) - new Date(startTime)) / 60000)
  );

  return `${durationMinutes} ${unitLabel}`;
};
