import React from "react";
import { QuestionNavigatorPanel } from "pages/Subject/components/QuestionPanelShared/QuestionNavigatorPanel";
import { isQuestionAnswered } from "pages/Subject/utils/questionUtils";

export const QuestionNavigator = ({
  texts,
  questions,
  selectedAnswers,
  currentQuestionIndex,
  isSubmitting,
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
      marked: texts.marked || "Đã đánh dấu",
      notAnswered: texts.notAnswered || "Chưa trả lời",
      submit: isSubmitting ? "Đang nộp..." : texts.submit || "Nộp bài",
    }}
    onSubmit={onSubmit}
    questions={questions}
    setCurrentQuestionIndex={setCurrentQuestionIndex}
    showLegend
    submitDisabled={isSubmitting}
    submitIcon={isSubmitting ? "hourglass_top" : "check_circle"}
  />
);
