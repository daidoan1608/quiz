import React from "react";
import { UserExamListView } from "./components/UserExamListView";
import { useUserExamList } from "./hooks/useUserExamList";

export default function GetUserExam() {
  const userExamList = useUserExamList();
  return <UserExamListView {...userExamList} />;
}
