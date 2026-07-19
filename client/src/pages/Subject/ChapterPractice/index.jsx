import React from 'react';
import { ChapterPracticeView } from './components/ChapterPracticeView';
import { PracticeBreadcrumb } from './components/PracticeBreadcrumb';
import { PracticeControls } from './components/PracticeControls';
import { PracticeEmptyState } from './components/PracticeEmptyState';
import { useChapterPractice } from './hooks/useChapterPractice';

export default function ChapterPractice() {
  const practice = useChapterPractice();

  const breadcrumb = (className = 'mb-6') => (
    <PracticeBreadcrumb
      className={className}
      displaySubjectName={practice.displaySubjectName}
      displayTitle={practice.displayTitle}
      navigate={practice.navigate}
      subjectId={practice.subjectId}
      texts={practice.texts}
    />
  );

  const controls = (
    <PracticeControls
      answeredCount={practice.answeredCount}
      hasRequested={practice.hasRequested}
      isLoading={practice.isLoading}
      isSubjectPractice={practice.isSubjectPractice}
      maxQuestionLimit={practice.maxQuestionLimit}
      onModeChange={(mode) =>
        practice.setPracticeConfig((prev) => ({
          ...prev,
          mode,
        }))
      }
      onStartPractice={practice.handleStartPractice}
      panelTitle={practice.panelTitle}
      practiceConfig={practice.practiceConfig}
      progressPercent={practice.progressPercent}
      questionCount={practice.questions.length}
      texts={practice.texts}
    />
  );

  if (practice.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        {practice.texts.loadingPracticeQuestions ||
          'Đang tải câu hỏi ôn tập...'}
      </div>
    );
  }

  if (!practice.hasRequested) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col p-4 py-6">
        {breadcrumb()}
        {controls}
      </div>
    );
  }

  if (!practice.questions.length) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col p-4 py-6">
        {breadcrumb()}
        {controls}
        <PracticeEmptyState
          emptyText={practice.emptyText}
          isSubjectPractice={practice.isSubjectPractice}
          onStartPractice={practice.handleStartPractice}
        />
      </div>
    );
  }

  return (
    <div className="relative flex w-full flex-col bg-background-light text-gray-900 transition-colors duration-300 dark:bg-background-dark dark:text-gray-100">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {breadcrumb()}
          {controls}

          <ChapterPracticeView
            confirmedAnswers={practice.confirmedAnswers}
            currentQuestion={practice.currentQuestion}
            currentQuestionIndex={practice.currentQuestionIndex}
            displaySubjectName={practice.displaySubjectName}
            displayTitle={practice.displayTitle}
            hasAnswered={practice.hasAnswered}
            markedQuestions={practice.markedQuestions}
            onAnswerSelect={practice.handleAnswerSelect}
            onConfirmMultipleAnswer={practice.handleConfirmMultipleAnswer}
            onNext={practice.goToNextQuestion}
            onPrevious={practice.goToPreviousQuestion}
            onToggleMarkedQuestion={practice.handleToggleMarkedQuestion}
            questions={practice.questions}
            selectedAnswers={practice.selectedAnswers}
            selectedValue={practice.selectedValue}
            setCurrentQuestionIndex={practice.setCurrentQuestionIndex}
            visibleAnswers={practice.visibleAnswers}
          />
        </div>
      </main>
    </div>
  );
}
