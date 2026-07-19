export const formatFileSize = (size = 0) => {
  if (!size) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1
  );
  return `${(size / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

export const getFileType = (filename = '') =>
  filename.split('.').pop()?.toUpperCase() || 'FILE';
