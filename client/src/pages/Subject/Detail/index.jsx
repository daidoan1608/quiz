import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { subjectApi } from 'api/subjectApi';
import { useAuth } from 'context/AuthProvider';
import { useFavorites } from 'context/FavoritesContext';
import { useLanguage } from 'context/LanguageProvider';
import LoginPrompt from 'components/modals/LoginPrompt';

export default function SubjectDetail() {
  const [subjectData, setSubjectData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [inProgressExams, setInProgressExams] = useState(new Map());

  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const subjectId = location.state?.subjectId || params.subjectId;
  const { isLoggedIn } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const { texts } = useLanguage();
  const userId = localStorage.getItem('userId');

  const isFavorited = subjectData
    ? favorites.some((fav) => fav.subjectId === subjectData.subjectId)
    : false;

  useEffect(() => {
    if (!subjectId) {
      setError(texts.subjectInfoNotFound || 'Không tìm thấy thông tin môn học');
      setIsLoading(false);
      return;
    }

    const fetchSubjectDetails = async () => {
      try {
        setIsLoading(true);
        const data = await subjectApi.getPublicSubject(subjectId);
        if (data) {
          setSubjectData(data);
        } else {
          setError(
            texts.subjectDataNotFound || 'Không tìm thấy dữ liệu môn học.'
          );
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu:', err);
        setError(
          texts.loadDataError ||
            'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectDetails();
  }, [
    subjectId,
    texts.subjectInfoNotFound,
    texts.subjectDataNotFound,
    texts.loadDataError,
  ]);

  useEffect(() => {
    const fetchInProgressExams = async () => {
      if (!isLoggedIn || !userId) {
        setInProgressExams(new Map());
        return;
      }

      try {
        const attempts = await subjectApi.getInProgressAttempts(userId);
        const attemptMap = new Map();
        attempts.forEach((attempt) => {
          if (attempt.examId) attemptMap.set(Number(attempt.examId), attempt);
        });
        setInProgressExams(attemptMap);
      } catch (err) {
        console.error('Lỗi tải đề đang làm dở:', err);
        setInProgressExams(new Map());
      }
    };

    fetchInProgressExams();
  }, [isLoggedIn, userId]);

  const handleChapterClick = (chapter) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    navigate(`/subjects/${subjectId}/chapters/${chapter.chapterId}`, {
      state: {
        chapterId: chapter.chapterId,
        chapterQuestionCount: chapter.countQuestion || 0,
        subjectId,
        subjectName: subjectData?.name,
        chapterName: chapter.name,
      },
    });
  };

  const handleSmartPracticeClick = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    navigate(`/subjects/${subjectId}/practice`, {
      state: {
        subjectId,
        subjectName: subjectData?.name,
        chapters,
      },
    });
  };

  const handleExamClick = (exam) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    const inProgressAttempt = inProgressExams.get(Number(exam.examId));
    navigate(`/subjects/${subjectId}/exams/${exam.examId}`, {
      state: {
        examId: exam.examId,
        subjectId,
        userExamId: inProgressAttempt?.userExamId,
        title: exam.title,
        startTime: new Date().toISOString(),
      },
    });
  };

  const estimatedHours = subjectData?.totalQuestions
    ? Math.max(1, Math.round(subjectData.totalQuestions / 30))
    : 0;

  const progress = useMemo(() => {
    if (!subjectData) return 0;
    const chapters = subjectData.totalChapters || 0;
    const exams = subjectData.totalExams || 0;
    return Math.min(
      65,
      Math.round((chapters > 0 ? 35 : 0) + (exams > 0 ? 30 : 0))
    );
  }, [subjectData]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error || !subjectData) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center text-red-500">
        <p>{error || texts.noData}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-primary hover:underline"
        >
          {texts.back || 'Quay lại'}
        </button>
      </div>
    );
  }

  const chapters = subjectData.chapters || [];
  const exams = subjectData.exams || [];

  return (
    <div className="bg-background-light text-gray-900 transition-colors duration-300 dark:bg-background-dark dark:text-gray-100">
      {showLoginPrompt && (
        <LoginPrompt
          onLoginRedirect={() => navigate('/login')}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}

      <main className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          <button
            onClick={() => navigate('/subjects')}
            className="font-bold uppercase tracking-wide hover:text-primary"
          >
            {texts.subjects || 'Môn học'}
          </button>
          <span className="material-symbols-outlined text-base">
            chevron_right
          </span>
          <span className="font-bold text-gray-900 dark:text-white">
            {subjectData.name}
          </span>
        </nav>

        <section className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="p-6 md:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                <span className="material-symbols-outlined text-base">
                  school
                </span>
                {texts.overview || 'Tổng quan'}
              </div>
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-5xl">
                    {subjectData.name}
                  </h1>
                  <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
                    {subjectData.description ||
                      texts.subjectHubDescription ||
                      'Tổng quan môn học, chương ôn tập và đề kiểm tra được gom chung trong một màn hình để bạn bắt đầu nhanh hơn.'}
                  </p>
                </div>

                <button
                  onClick={() => toggleFavorite(subjectId, subjectData.name)}
                  disabled={!localStorage.getItem('userId')}
                  className={`shrink-0 rounded-xl border p-3 transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                    isFavorited
                      ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-900/60 dark:bg-red-900/20'
                      : 'border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:text-red-500 dark:border-gray-700 dark:bg-gray-900'
                  }`}
                  title={texts.favorite || 'Yêu thích'}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontVariationSettings: `'FILL' ${isFavorited ? 1 : 0}`,
                    }}
                  >
                    favorite
                  </span>
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleSmartPracticeClick}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">
                    psychology
                  </span>
                  Ôn tập thông minh
                </button>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatsCard
                  title={texts.chapterCount || 'Số chương'}
                  value={subjectData.totalChapters || chapters.length}
                />
                <StatsCard
                  title={texts.questions || 'Câu hỏi'}
                  value={subjectData.totalQuestions || 0}
                />
                <StatsCard
                  title={texts.examCount || 'Đề kiểm tra'}
                  value={subjectData.totalExams || exams.length}
                />
                <StatsCard
                  title={texts.duration || 'Thời lượng'}
                  value={`~${estimatedHours}h`}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/40 lg:border-l lg:border-t-0">
              <h3 className="mb-5 text-lg font-black text-gray-950 dark:text-white">
                {texts.readiness || 'Mức độ sẵn sàng'}
              </h3>
              <div className="flex items-center gap-5">
                <div
                  className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(var(--tw-color-primary, #2563eb) 0% ${progress}%, #e5e7eb ${progress}% 100%)`,
                  }}
                >
                  <div className="absolute h-[70%] w-[70%] rounded-full bg-gray-50 dark:bg-gray-900"></div>
                  <div className="relative z-10 text-center">
                    <span className="block text-2xl font-black text-gray-950 dark:text-white">
                      {progress}%
                    </span>
                    <span className="text-[10px] font-bold uppercase text-gray-500">
                      {texts.ready || 'Sẵn sàng'}
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <MiniInfo
                    label={texts.chapter || 'Chương'}
                    value={`${chapters.length}`}
                  />
                  <MiniInfo
                    label={texts.examLabel || 'Đề thi'}
                    value={`${exams.length}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-primary">
                  {texts.reviewChapters || 'Chương ôn tập'}
                </p>
                <h2 className="text-2xl font-black text-gray-950 dark:text-white">
                  {texts.learnByChapter || 'Học theo chương'}
                </h2>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                {chapters.length} {texts.chapters || 'chương'}
              </span>
            </div>

            {chapters.length > 0 ? (
              chapters.map((chapter, index) => (
                <ChapterCard
                  key={chapter.chapterId}
                  chapter={chapter}
                  index={index}
                  onStart={handleChapterClick}
                  texts={texts}
                />
              ))
            ) : (
              <EmptyState
                text={texts.noChapters || 'Chưa có chương bài học nào.'}
                texts={texts}
              />
            )}
          </section>

          <aside className="space-y-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-primary">
                {texts.examLabel || 'Đề thi'}
              </p>
              <h2 className="text-2xl font-black text-gray-950 dark:text-white">
                {texts.quickTest || 'Kiểm tra nhanh'}
              </h2>
            </div>

            <div className="space-y-4 xl:sticky xl:top-24">
              {exams.length > 0 ? (
                exams.map((exam, index) => (
                  <ExamCard
                    key={exam.examId}
                    exam={exam}
                    index={index}
                    onStart={handleExamClick}
                    inProgress={inProgressExams.has(Number(exam.examId))}
                    texts={texts}
                  />
                ))
              ) : (
                <EmptyState
                  text={texts.noExams || 'Chưa có bài kiểm tra nào.'}
                  compact
                  texts={texts}
                />
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

const StatsCard = ({ title, value }) => (
  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {title}
    </span>
    <span className="text-3xl font-black text-primary">{value}</span>
  </div>
);

const ChapterCard = ({ chapter, index, onStart, texts }) => {
  const hasQuestions = (chapter.countQuestion || 0) > 0;
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-black ${hasQuestions ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'}`}
        >
          {index + 1}
        </div>
        <div>
          <h4 className="text-lg font-black text-gray-950 dark:text-white">
            {chapter.name}
          </h4>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-base">quiz</span>
              {chapter.countQuestion || 0} {texts?.questions || 'câu hỏi'}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${hasQuestions ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'}`}
            >
              {hasQuestions
                ? texts?.canReview || 'Có thể ôn'
                : texts?.noQuestionsYet || 'Chưa có câu hỏi'}
            </span>
          </div>
        </div>
      </div>
      <button
        disabled={!hasQuestions}
        onClick={() => onStart(chapter)}
        className={`rounded-xl px-6 py-3 text-sm font-bold transition-all ${hasQuestions ? 'bg-primary text-white shadow-md hover:shadow-lg active:scale-95' : 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700'}`}
      >
        {texts?.startReview || 'Bắt đầu ôn'}
      </button>
    </div>
  );
};

const ExamCard = ({ exam, index, onStart, inProgress, texts }) => (
  <div
    className={`rounded-2xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800 ${inProgress ? 'border-amber-300 dark:border-amber-700' : 'border-gray-200 dark:border-gray-700'}`}
  >
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-black text-primary">
        {index + 1}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-start gap-2">
          <h4 className="line-clamp-2 text-base font-black text-gray-950 dark:text-white">
            {exam.title}
          </h4>
          {inProgress && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              {texts?.inProgress || 'Đang làm'}
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          {exam.description ||
            texts?.examDescriptionFallback ||
            'Bài kiểm tra tổng hợp kiến thức môn học.'}
        </p>
      </div>
    </div>
    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
      <span className="inline-flex items-center gap-1">
        <span className="material-symbols-outlined text-base">help</span>
        {exam.totalQuestions || 0} {texts?.questionUnit || 'câu'}
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="material-symbols-outlined text-base">timer</span>
        {exam.duration || 60} {texts?.minutes || 'phút'}
      </span>
    </div>
    <button
      onClick={() => onStart(exam)}
      className={`w-full rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95 ${inProgress ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary'}`}
    >
      {inProgress
        ? texts?.continue || 'Tiếp tục'
        : texts?.startExam || 'Bắt đầu làm'}
    </button>
  </div>
);

const MiniInfo = ({ label, value }) => (
  <div>
    <span className="block text-xs font-bold uppercase text-gray-500">
      {label}
    </span>
    <span className="text-lg font-black text-gray-950 dark:text-white">
      {value}
    </span>
  </div>
);

const EmptyState = ({ text, compact = false, texts }) => (
  <div
    className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800 ${compact ? 'py-10' : 'py-14'}`}
  >
    <span className="material-symbols-outlined mb-3 text-5xl text-gray-300">
      inbox
    </span>
    <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
      {texts?.noContent || 'Chưa có nội dung'}
    </h3>
    <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">{text}</p>
  </div>
);
