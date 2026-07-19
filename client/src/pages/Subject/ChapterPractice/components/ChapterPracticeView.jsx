import React from 'react';
import { PracticeInfoCard } from './PracticeInfoCard';
import { PracticeNavigator } from './PracticeNavigator';
import { PracticeQuestionPanel } from './PracticeQuestionPanel';

export const ChapterPracticeView = ({
  confirmedAnswers,
  currentQuestion,
  currentQuestionIndex,
  displaySubjectName,
  displayTitle,
  hasAnswered,
  markedQuestions,
  onAnswerSelect,
  onConfirmMultipleAnswer,
  onNext,
  onPrevious,
  onToggleMarkedQuestion,
  questions,
  selectedAnswers,
  selectedValue,
  setCurrentQuestionIndex,
  visibleAnswers,
}) => (
  <div className="grid grid-cols-12 gap-6">
    <PracticeInfoCard
      displaySubjectName={displaySubjectName}
      displayTitle={displayTitle}
      markedCount={markedQuestions.size}
      questionCount={questions.length}
    />
    <PracticeQuestionPanel
      confirmedAnswers={confirmedAnswers}
      currentQuestion={currentQuestion}
      currentQuestionIndex={currentQuestionIndex}
      hasAnswered={hasAnswered}
      markedQuestions={markedQuestions}
      onAnswerSelect={onAnswerSelect}
      onConfirmMultipleAnswer={onConfirmMultipleAnswer}
      onNext={onNext}
      onPrevious={onPrevious}
      onToggleMarkedQuestion={onToggleMarkedQuestion}
      questionCount={questions.length}
      selectedValue={selectedValue}
      visibleAnswers={visibleAnswers}
    />
    <PracticeNavigator
      confirmedAnswers={confirmedAnswers}
      currentQuestionIndex={currentQuestionIndex}
      markedQuestions={markedQuestions}
      questions={questions}
      selectedAnswers={selectedAnswers}
      setCurrentQuestionIndex={setCurrentQuestionIndex}
    />
  </div>
);
