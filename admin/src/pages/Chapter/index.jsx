import React from "react";
import { ChapterManagerView } from "./components/ChapterManagerView";
import { useChapterManager } from "./hooks/useChapterManager";

export default function ChapterManager() {
  const chapterManager = useChapterManager();
  return <ChapterManagerView {...chapterManager} />;
}
