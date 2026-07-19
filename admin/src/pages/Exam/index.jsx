import React from "react";
import { ExamManagerView } from "./components/ExamManagerView";
import { useExamManager } from "./hooks/useExamManager";

export default function ExamManager() {
  const examManager = useExamManager();
  return <ExamManagerView {...examManager} />;
}
