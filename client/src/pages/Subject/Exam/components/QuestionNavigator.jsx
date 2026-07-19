import React from "react";
import { QuestionNavigatorPanel } from "pages/Subject/components/QuestionPanelShared/QuestionNavigatorPanel";
import { isQuestionAnswered } from "pages/Subject/utils/questionUtils";

export const QuestionNavigator = ({
  texts,
  questions,
  selectedAnswers,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  onSubmit,
}) => (
  <QuestionNavigatorPanel
    currentQuestionIndex={currentQuestionIndex}
    getQuestionKey={(_, index) => index}
    isQuestionAnswered={(question, index) =>
      isQuestionAnswered(question, selectedAnswers[index])
    }
    labels={{
      title: texts.table || "Bảng trả lời",
      current: texts.currentQuestion || "Câu hiện tại",
      answered: texts.answered || "Đã trả lời",
      notAnswered: texts.notAnswered || "Chưa trả lời",
      submit: texts.submit || "Nộp bài",
    }}
    onSubmit={onSubmit}
    questions={questions}
    setCurrentQuestionIndex={setCurrentQuestionIndex}
    showLegend
  />
);
