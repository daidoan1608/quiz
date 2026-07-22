import { useState } from "react";
import { getStorageItem, setStorageItem } from 'utils/storage';

const createMarkedStorageKey = (userId, chapterId) =>
  `chapter-practice-marked:${userId}:${chapterId || "unknown"}`;

const readMarkedIds = (storageKey) =>
  new Set(JSON.parse(getStorageItem(storageKey, "[]")).map(Number));

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

  const loadFallbackMarkedQuestions = () =>
    readMarkedIds(createMarkedStorageKey(userId, null));

  const replaceMarkedQuestions = (questionIds) => {
    setMarkedQuestions(new Set(questionIds.map(Number)));
  };

  const toggleMarkedQuestion = (question) => {
    const questionId =
      typeof question === "object" ? question?.questionId : question;
    const targetChapterId =
      typeof question === "object" ? question?.chapterId || chapterId : chapterId;
    const numericQuestionId = Number(questionId);
    if (!numericQuestionId || !targetChapterId) return;
    const targetStorageKey = createMarkedStorageKey(userId, targetChapterId);
    const fallbackStorageKey = createMarkedStorageKey(userId, null);
    const currentMarked = readMarkedIds(targetStorageKey);
    const fallbackMarked = readMarkedIds(fallbackStorageKey);
    const isMarked = currentMarked.has(numericQuestionId) || fallbackMarked.has(numericQuestionId);
    const nextMarked = new Set(markedQuestions);
    if (isMarked) {
      currentMarked.delete(numericQuestionId);
      fallbackMarked.delete(numericQuestionId);
      nextMarked.delete(numericQuestionId);
    } else {
      currentMarked.add(numericQuestionId);
      nextMarked.add(numericQuestionId);
    }
    setMarkedQuestions(nextMarked);
    setStorageItem(targetStorageKey, JSON.stringify([...currentMarked]));
    setStorageItem(fallbackStorageKey, JSON.stringify([...fallbackMarked]));
  };

  return {
    markedQuestions,
    loadFallbackMarkedQuestions,
    loadMarkedQuestions,
    loadMarkedQuestionsByChapter,
    replaceMarkedQuestions,
    toggleMarkedQuestion,
  };
};
