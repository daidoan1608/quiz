import React from 'react';
import { PageContainer } from 'components/common/PageContainer';
import { PageLoadingState } from 'components/common/PageState';
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
      onPracticeConfigChange={practice.setPracticeConfig}
      onStartPractice={practice.handleStartPractice}
      panelTitle={practice.panelTitle}
      practiceConfig={practice.practiceConfig}
      progressPercent={practice.progressPercent}
      questionCount={practice.questions.length}
      texts={practice.texts}
    />
  );

  let content = null;

  if (practice.isLoading) {
    content = (
      <PageLoadingState
        className="aura-surface-panel text-gray-600 dark:text-gray-300"
        label={
          practice.texts.loadingPracticeQuestions ||
          'Đang tải câu hỏi ôn tập...'
        }
        minHeightClassName="min-h-48"
      />
    );
  } else if (practice.hasRequested && !practice.questions.length) {
    content = (
      <PracticeEmptyState
        emptyText={practice.emptyText}
        isSubjectPractice={practice.isSubjectPractice}
        onStartPractice={practice.handleStartPractice}
      />
    );
  } else if (practice.questions.length) {
    content = (
      <ChapterPracticeView
        confirmedAnswers={practice.confirmedAnswers}
        currentQuestion={practice.currentQuestion}
        currentQuestionIndex={practice.currentQuestionIndex}
        displaySubjectName={practice.displaySubjectName}
        displayTitle={practice.displayTitle}
        hasAnswered={practice.hasAnswered}
        isSubjectPractice={practice.isSubjectPractice}
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
        texts={practice.texts}
        visibleAnswers={practice.visibleAnswers}
      />
    );
  }

  return (
    <PageContainer
      as="div"
      className="flex min-h-[60vh] flex-col text-gray-900 transition-colors duration-300 dark:text-gray-100"
    >
      {breadcrumb()}
      {controls}
      {content}
    </PageContainer>
  );
}
