import { SMART_WRONG_MODES } from '../constants/practiceOptions';

export const createPracticeRequestParams = ({
  isSubjectPractice,
  maxQuestionLimit,
}) => ({
  difficulty: undefined,
  includeCorrectAnswers: true,
  limit: isSubjectPractice ? 100 : maxQuestionLimit || 100,
});

export const loadMarkedSubjectQuestions = async ({
  commonParams,
  examApi,
  loadFallbackMarkedQuestions,
  loadMarkedQuestionsByChapter,
  subjectChapters,
}) => {
  const markedByChapter = loadMarkedQuestionsByChapter(subjectChapters);
  const fallbackMarkedIds = loadFallbackMarkedQuestions();
  const markedChapterIds = [...markedByChapter.entries()]
    .filter(([, ids]) => ids.size > 0)
    .map(([id]) => id);
  const fallbackChapterIds = fallbackMarkedIds.size
    ? subjectChapters.map((chapter) => Number(chapter.chapterId))
    : [];
  const chapterIdsToLoad = [
    ...new Set([...markedChapterIds, ...fallbackChapterIds]),
  ];
  const chapterQuestions = await Promise.all(
    chapterIdsToLoad.map((id) =>
      examApi.getChapterQuestions(id, {
        ...commonParams,
        limit: 100,
      })
    )
  );

  return chapterQuestions.flat().filter((question) => {
    const questionChapterId = Number(question.chapterId);
    const chapterMarkedIds = markedByChapter.get(questionChapterId);
    const questionId = Number(question.questionId);
    return chapterMarkedIds?.has(questionId) || fallbackMarkedIds.has(questionId);
  });
};

export const loadPracticeQuestions = ({
  chapterId,
  commonParams,
  examApi,
  practiceMode,
  subjectId,
}) => {
  const strategy = SMART_WRONG_MODES[practiceMode];

  if (strategy) {
    return examApi.getSmartWrongPracticeQuestions({
      ...commonParams,
      chapterId,
      strategy,
      subjectId,
    });
  }

  return examApi.getChapterQuestions(chapterId, {
    ...commonParams,
    mode: 'all',
  });
};

export const getPracticeEmptyText = ({
  isSubjectPractice,
  practiceMode,
  texts,
}) => {
  if (SMART_WRONG_MODES[practiceMode]) {
    return isSubjectPractice
      ? 'Bạn chưa có câu sai nào trong môn này.'
      : 'Bạn chưa có câu sai nào trong chương này.';
  }

  if (practiceMode === 'markedSubject') {
    return 'Bạn chưa có câu đã lưu nào trong môn này.';
  }

  if (practiceMode === 'marked') {
    return 'Bạn chưa đánh dấu câu nào trong chương này.';
  }

  return (
    texts.noPracticeQuestionsForChapter ||
    'Chưa có câu hỏi ôn tập cho chương này.'
  );
};
