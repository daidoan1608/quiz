import React from 'react';
import { PageContainer } from 'components/common/PageContainer';
import { CountdownCard } from './CountdownCard';
import { ExamBreadcrumb } from './ExamBreadcrumb';
import { ExamHero } from './ExamHero';
import { ExamInfoCard } from './ExamInfoCard';
import { QuestionNavigator } from './QuestionNavigator';
import { QuestionPanel } from './QuestionPanel';
import { SubmitConfirmDialog } from './SubmitConfirmDialog';

export const ExamAttemptView = ({
  answeredCount,
  closeSubmitConfirm,
  confirmSubmitExam,
  currentQuestion,
  currentQuestionIndex,
  goToNextQuestion,
  goToPreviousQuestion,
  handleAnswerSelect,
  hours,
  isSubmitConfirmOpen,
  minutes,
  navigate,
  openSubmitConfirm,
  progressPercent,
  questions,
  seconds,
  selectedAnswers,
  setCurrentQuestionIndex,
  subjectId,
  subjectName,
  texts,
  title,
}) => (
  <div className="relative flex w-full flex-col bg-background-light text-gray-900 transition-colors duration-300 dark:bg-background-dark dark:text-gray-100">
    <PageContainer className="flex-1">
        <ExamBreadcrumb
          texts={texts}
          navigate={navigate}
          subjectId={subjectId}
          subjectName={subjectName}
          title={title}
        />

        <ExamHero
          texts={texts}
          title={title}
          answeredCount={answeredCount}
          questionCount={questions.length}
          progressPercent={progressPercent}
        />

        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 space-y-6 lg:col-span-3">
            <ExamInfoCard
              texts={texts}
              title={title}
              subjectName={subjectName}
              questionCount={questions.length}
            />
            <CountdownCard
              texts={texts}
              hours={hours}
              minutes={minutes}
              seconds={seconds}
            />
          </aside>

          <QuestionPanel
            texts={texts}
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            questionCount={questions.length}
            selectedValue={selectedAnswers[currentQuestionIndex]}
            onAnswerSelect={handleAnswerSelect}
            onPrevious={goToPreviousQuestion}
            onNext={goToNextQuestion}
          />

          <QuestionNavigator
            texts={texts}
            questions={questions}
            selectedAnswers={selectedAnswers}
            currentQuestionIndex={currentQuestionIndex}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
            onSubmit={openSubmitConfirm}
          />
        </div>
    </PageContainer>

    {isSubmitConfirmOpen && (
      <SubmitConfirmDialog
        answeredCount={answeredCount}
        totalQuestions={questions.length}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
        onCancel={closeSubmitConfirm}
        onSubmit={confirmSubmitExam}
      />
    )}
  </div>
);
