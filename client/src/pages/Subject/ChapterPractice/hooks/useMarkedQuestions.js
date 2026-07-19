import { useState } from "react";

const createMarkedStorageKey = (userId, chapterId) =>
  `chapter-practice-marked:${userId}:${chapterId || "unknown"}`;

const readMarkedIds = (storageKey) =>
  new Set(JSON.parse(localStorage.getItem(storageKey) || "[]").map(Number));

export const useMarkedQuestions = ({ chapterId, userId }) => {
  const markedStorageKey = createMarkedStorageKey(userId, chapterId);
  const [markedQuestions, setMarkedQuestions] = useState(new Set());

  const loadMarkedQuestions = () => readMarkedIds(markedStorageKey);

  const loadMarkedQuestionsByChapter = (chapters) =>
    new Map(
      chapters.map((chapter) => [
        Number(chapter.chapterId),
        readMarkedIds(createMarkedStorageKey(userId, chapter.chapterId)),
      ])
    );

  const replaceMarkedQuestions = (questionIds) => {
    setMarkedQuestions(new Set(questionIds.map(Number)));
  };

  const toggleMarkedQuestion = (questionId) => {
    const numericQuestionId = Number(questionId);
    if (!numericQuestionId) return;
    const nextMarked = new Set(markedQuestions);
    if (nextMarked.has(numericQuestionId)) nextMarked.delete(numericQuestionId);
    else nextMarked.add(numericQuestionId);
    setMarkedQuestions(nextMarked);
    localStorage.setItem(markedStorageKey, JSON.stringify([...nextMarked]));
  };

  return {
    markedQuestions,
    loadMarkedQuestions,
    loadMarkedQuestionsByChapter,
    replaceMarkedQuestions,
    toggleMarkedQuestion,
  };
};
