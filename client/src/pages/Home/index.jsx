import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subjectApi } from "api/subjectApi";
import { useLanguage } from "context/LanguageProvider";
import { useAuth } from "context/AuthProvider";
import {
  MAX_DISPLAYED_ATTEMPTS,
  MAX_DISPLAYED_SUBJECTS,
} from "./constants";
import HeroSection from "./components/HeroSection";
import InProgressSidebar from "./components/InProgressSidebar";
import LearningPathSection from "./components/LearningPathSection";
import SubjectsSection from "./components/SubjectsSection";
import TeamSection from "./components/TeamSection";
import { getCurrentUserId } from "utils/storage";

export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const [inProgressAttempts, setInProgressAttempts] = useState([]);

  const { t } = useLanguage();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const userId = getCurrentUserId();

  const displayedSubjects = useMemo(
    () => subjects.slice(0, MAX_DISPLAYED_SUBJECTS),
    [subjects]
  );
  const displayedAttempts = useMemo(
    () => inProgressAttempts.slice(0, MAX_DISPLAYED_ATTEMPTS),
    [inProgressAttempts]
  );

  const fetchSubjects = useCallback(async () => {
    try {
      const subjectsData = await subjectApi.getPublicSubjects();
      setSubjects(subjectsData || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách môn học:", error);
      setSubjects([]);
    }
  }, []);

  const fetchInProgressAttempts = useCallback(async () => {
    if (!isLoggedIn || !userId) {
      setInProgressAttempts([]);
      return;
    }

    try {
      const attempts = await subjectApi.getInProgressAttempts(userId);
      setInProgressAttempts(attempts || []);
    } catch (error) {
      console.error("Lỗi khi lấy bài đang thực hiện:", error);
      setInProgressAttempts([]);
    }
  }, [isLoggedIn, userId]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    fetchInProgressAttempts();
  }, [fetchInProgressAttempts]);

  const handleSelectSubject = useCallback(
    (subjectId) => {
      navigate(`/subjects/${subjectId}`, { state: { subjectId } });
    },
    [navigate]
  );

  const handleContinueAttempt = useCallback(
    (attempt) => {
      navigate(`/subjects/${attempt.subjectId}/exams/${attempt.examId}`, {
        state: {
          subjectId: attempt.subjectId,
          examId: attempt.examId,
          userExamId: attempt.userExamId,
          title: attempt.title,
        },
      });
    },
    [navigate]
  );

  const handleStartLearning = useCallback(() => {
    navigate("/subjects");
  }, [navigate]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <main className="flex flex-1 justify-center py-6 sm:py-8 lg:py-12">
        <div className="flex flex-col w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 gap-12">
          <HeroSection t={t} onStart={handleStartLearning} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 flex flex-col gap-10">
              <LearningPathSection t={t} />
              <SubjectsSection
                subjects={displayedSubjects}
                t={t}
                onSelectSubject={handleSelectSubject}
              />
            </div>

            <InProgressSidebar
              attempts={displayedAttempts}
              isLoggedIn={isLoggedIn}
              t={t}
              onContinueAttempt={handleContinueAttempt}
            />
          </div>

          <TeamSection t={t} />
        </div>
      </main>
    </div>
  );
}
