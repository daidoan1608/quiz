import { useMemo } from 'react';
import { countAnsweredQuestions, getUniqueAnswers } from 'pages/Subject/utils/answerSelection';
import { isMultipleChoice } from 'pages/Subject/utils/questionUtils';
import { getPracticeEmptyText } from '../utils/practiceData';

export const usePracticeDerivedState = ({
  confirmedAnswers,
  currentQuestionIndex,
  isSubjectPractice,
  locationState,
  practiceMode,
  questions,
  selectedAnswers,
  subjectName,
  texts,
  title,
}) => {
  const currentQuestion = questions[currentQuestionIndex];
  const visibleAnswers = useMemo(
    () => getUniqueAnswers(currentQuestion?.answers || []),
    [currentQuestion]
  );
  const selectedValue = selectedAnswers[currentQuestionIndex];
  const hasAnswered = currentQuestion
    ? isMultipleChoice(currentQuestion)
      ? confirmedAnswers[currentQuestionIndex]
      : selectedValue !== undefined
    : false;
  const answeredCount = useMemo(
    () =>
      countAnsweredQuestions({
        confirmedAnswers,
        questions,
        requireConfirmationForMultiple: true,
        selectedAnswers,
      }),
    [confirmedAnswers, questions, selectedAnswers]
  );
  const progressPercent = questions.length
    ? (answeredCount / questions.length) * 100
    : 0;
  const displaySubjectName =
    subjectName || locationState?.subjectName || texts.subjects || 'Môn học';
  const displayTitle =
    title ||
    locationState?.chapterName ||
    (isSubjectPractice ? 'Ôn tập thông minh' : texts.practiceQuestions) ||
    'Câu hỏi ôn tập';

  return {
    answeredCount,
    currentQuestion,
    displaySubjectName,
    displayTitle,
    emptyText: getPracticeEmptyText({
      isSubjectPractice,
      practiceMode,
      texts,
    }),
    hasAnswered,
    panelTitle: isSubjectPractice ? displaySubjectName : displayTitle,
    progressPercent,
    selectedValue,
    visibleAnswers,
  };
};
