export const buildSubjectDetailLocation = (subject) => ({
  pathname: `/subjects/${subject.subjectId}`,
  state: { subjectId: subject.subjectId },
});

export const buildChapterPracticeLocation = ({ chapter, subjectData, subjectId }) => ({
  pathname: `/subjects/${subjectId}/chapters/${chapter.chapterId}`,
  state: {
    chapterId: chapter.chapterId,
    chapterName: chapter.name,
    chapterQuestionCount: chapter.countQuestion || 0,
    subjectId,
    subjectName: subjectData?.name,
  },
});

export const buildSubjectPracticeLocation = ({ chapters, subjectData, subjectId }) => ({
  pathname: `/subjects/${subjectId}/practice`,
  state: {
    chapters,
    subjectId,
    subjectName: subjectData?.name,
  },
});

export const buildExamAttemptLocation = ({
  exam,
  inProgressAttempt,
  subjectId,
}) => ({
  pathname: `/subjects/${subjectId}/exams/${exam.examId}`,
  state: {
    examId: exam.examId,
    startTime: new Date().toISOString(),
    subjectId,
    title: exam.title,
    userExamId: inProgressAttempt?.userExamId,
  },
});

export const mapInProgressAttemptsByExamId = (attempts = []) => {
  const attemptMap = new Map();
  attempts.forEach((attempt) => {
    if (attempt.examId) attemptMap.set(Number(attempt.examId), attempt);
  });
  return attemptMap;
};
