import React from 'react';
import { QuestionNavigatorPanel } from 'pages/Subject/components/QuestionPanelShared/QuestionNavigatorPanel';
import { isMultipleChoice } from 'pages/Subject/utils/questionUtils';

export const PracticeNavigator = ({
  confirmedAnswers,
  currentQuestionIndex,
  markedQuestions,
  questions,
  selectedAnswers,
  setCurrentQuestionIndex,
  showMarkedQuestions = true,
  texts,
}) => (
  <QuestionNavigatorPanel
    currentQuestionIndex={currentQuestionIndex}
    isQuestionAnswered={(question, index) =>
      isMultipleChoice(question)
        ? confirmedAnswers[index] === true
        : selectedAnswers[index] !== undefined
    }
    isQuestionMarked={(question) =>
      showMarkedQuestions && markedQuestions.has(Number(question.questionId))
    }
    labels={{
      title: texts.table || 'Bảng trả lời',
    }}
    questions={questions}
    setCurrentQuestionIndex={setCurrentQuestionIndex}
  />
);
