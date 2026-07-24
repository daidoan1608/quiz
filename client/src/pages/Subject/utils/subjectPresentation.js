export const getCategoryName = ({ category, texts }) =>
  category?.categoryName || category?.name || texts.categoryFallback || 'Khoa';

export const getSubjectChapterCount = (subject) =>
  subject?.totalChapters ?? subject?.chapters?.length ?? 0;

export const getSubjectExamCount = (subject) =>
  subject?.totalExams ?? subject?.exams?.length ?? 0;

export const getSubjectQuestionCount = (subject) =>
  subject?.totalQuestions ??
  subject?.chapters?.reduce(
    (total, chapter) => total + (chapter.countQuestion || 0),
    0
  ) ??
  0;

export const getSubjectProgress = (subject) => {
  const chapters = getSubjectChapterCount(subject);
  const exams = getSubjectExamCount(subject);
  const questions = getSubjectQuestionCount(subject);
  if (!chapters && !exams && !questions) return 0;

  return Math.min(
    100,
    Math.max(12, chapters * 10 + exams * 8 + Math.round(questions / 8))
  );
};

export const getSubjectStatus = ({ subject, texts }) => {
  const chapters = getSubjectChapterCount(subject);
  const exams = getSubjectExamCount(subject);

  if (chapters > 0 && exams > 0) {
    return {
      className:
        'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
      text: texts.ready || 'Sẵn sàng',
    };
  }

  if (chapters > 0) {
    return {
      className: 'bg-primary/10 text-primary border border-primary/20',
      text: texts.practice || 'Ôn tập',
    };
  }

  if (exams > 0) {
    return {
      className:
        'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
      text: texts.test || 'Kiểm tra',
    };
  }

  return {
    className:
      'bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
    text: texts.unavailable || 'Chưa có',
  };
};

export const getEstimatedStudyHours = (subjectData) =>
  subjectData?.totalQuestions
    ? Math.max(1, Math.round(subjectData.totalQuestions / 30))
    : 0;
