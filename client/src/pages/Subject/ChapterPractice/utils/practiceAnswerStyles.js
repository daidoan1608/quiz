export const getPracticeAnswerClassName = ({
  hasAnswered,
  isCorrect,
  isSelected,
}) => {
  if (hasAnswered && isCorrect) {
    return 'border-green-600 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200';
  }

  if (hasAnswered && isSelected && !isCorrect) {
    return 'border-red-600 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200';
  }

  if (isSelected) {
    return 'border-primary bg-primary/10 text-primary dark:bg-primary/20 dark:text-white';
  }

  if (hasAnswered) {
    return 'border-gray-200 opacity-60 dark:border-gray-700';
  }

  return 'border-gray-200 hover:border-primary/50 dark:border-gray-600';
};
