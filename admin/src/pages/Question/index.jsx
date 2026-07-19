import React from "react";
import { QuestionManagerView } from "./components/QuestionManagerView";
import { useQuestionManager } from "./hooks/useQuestionManager";

export default function QuestionManager() {
  const questionManager = useQuestionManager();
  return <QuestionManagerView {...questionManager} />;
}
