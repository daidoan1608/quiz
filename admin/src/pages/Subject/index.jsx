import React from "react";
import { SubjectManagerView } from "./components/SubjectManagerView";
import { useSubjectManager } from "./hooks/useSubjectManager";

export default function SubjectManager() {
  const subjectManager = useSubjectManager();
  return <SubjectManagerView {...subjectManager} />;
}
