import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { publicAxios } from "../../../api/axiosConfig";
import { useAuth } from "../../../context/AuthProvider";
import { useFavorites } from "../../../context/FavoritesContext";
import LoginPrompt from "../../Modal/LoginPrompt";

export default function RevisionListChap() {
  const [subjectData, setSubjectData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { subjectId } = location.state || {};
  const { isLoggedIn } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();

  const isFavorited = subjectData
    ? favorites.some((fav) => fav.subjectId === subjectData.subjectId)
    : false;

  useEffect(() => {
    if (!subjectId) {
      setError("Không tìm thấy thông tin môn học");
      setIsLoading(false);
      return;
    }

    const fetchSubjectDetails = async () => {
      try {
        setIsLoading(true);
        const resp = await publicAxios.get(`public/subjects/${subjectId}`);
        if (resp.data.status === "success") {
          setSubjectData(resp.data.data);
        } else {
          setError("Không tìm thấy dữ liệu môn học.");
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectDetails();
  }, [subjectId]);

  const handleChapterClick = (chapter) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    navigate(`/subjects/${subjectId}/chapters/${chapter.chapterId}`, {
      state: {
        chapterId: chapter.chapterId,
        subjectId,
        subjectName: subjectData?.name,
        chapterName: chapter.name,
      },
    });
  };

  const handleExamClick = (exam) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    navigate(`/subjects/${subjectId}/exams/${exam.examId}`, {
      state: {
        examId: exam.examId,
        subjectId,
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
    return Math.min(65, Math.round((chapters > 0 ? 35 : 0) + (exams > 0 ? 30 : 0)));
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
        <p>{error || "Dữ liệu trống"}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline">
          Quay lại
        </button>
      </div>
    );
  }

  const chapters = subjectData.chapters || [];
  const exams = subjectData.exams || [];

  return (
    <div className="min-h-screen bg-background-light text-gray-900 transition-colors duration-300 dark:bg-background-dark dark:text-gray-100">
      {showLoginPrompt && (
        <LoginPrompt onLoginRedirect={() => navigate("/login")} onClose={() => setShowLoginPrompt(false)} />
      )}

      <main className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          <button onClick={() => navigate("/subjects")} className="font-bold uppercase tracking-wide hover:text-primary">
            Môn học
          </button>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="font-bold text-gray-900 dark:text-white">{subjectData.name}</span>
        </nav>

        <section className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="p-6 md:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                <span className="material-symbols-outlined text-base">school</span>
                Overview
              </div>
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-5xl">
                    {subjectData.name}
                  </h1>
                  <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
                    {subjectData.description ||
                      "Tổng quan môn học, chương ôn tập và đề kiểm tra được gom chung trong một màn hình để bạn bắt đầu nhanh hơn."}
                  </p>
                </div>

                <button
                  onClick={() => toggleFavorite(subjectId, subjectData.name)}
                  disabled={!localStorage.getItem("userId")}
                  className={`shrink-0 rounded-xl border p-3 transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                    isFavorited
                      ? "border-red-200 bg-red-50 text-red-500 dark:border-red-900/60 dark:bg-red-900/20"
                      : "border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:text-red-500 dark:border-gray-700 dark:bg-gray-900"
                  }`}
                  title="Yêu thích"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${isFavorited ? 1 : 0}` }}>
                    favorite
                  </span>
                </button>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatsCard title="Số chương" value={subjectData.totalChapters || chapters.length} />
                <StatsCard title="Câu hỏi" value={subjectData.totalQuestions || 0} />
                <StatsCard title="Đề kiểm tra" value={subjectData.totalExams || exams.length} />
                <StatsCard title="Thời lượng" value={`~${estimatedHours}h`} />
              </div>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/40 lg:border-l lg:border-t-0">
              <h3 className="mb-5 text-lg font-black text-gray-950 dark:text-white">Mức độ sẵn sàng</h3>
              <div className="flex items-center gap-5">
                <div
                  className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
                  style={{ background: `conic-gradient(var(--tw-color-primary, #2563eb) 0% ${progress}%, #e5e7eb ${progress}% 100%)` }}
                >
                  <div className="absolute h-[70%] w-[70%] rounded-full bg-gray-50 dark:bg-gray-900"></div>
                  <div className="relative z-10 text-center">
                    <span className="block text-2xl font-black text-gray-950 dark:text-white">{progress}%</span>
                    <span className="text-[10px] font-bold uppercase text-gray-500">Ready</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <MiniInfo label="Chương" value={`${chapters.length}`} />
                  <MiniInfo label="Đề thi" value={`${exams.length}`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-primary">Chương ôn tập</p>
                <h2 className="text-2xl font-black text-gray-950 dark:text-white">Học theo chương</h2>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">{chapters.length} chương</span>
            </div>

            {chapters.length > 0 ? (
              chapters.map((chapter, index) => (
                <ChapterCard key={chapter.chapterId} chapter={chapter} index={index} onStart={handleChapterClick} />
              ))
            ) : (
              <EmptyState text="Chưa có chương bài học nào." />
            )}
          </section>

          <aside className="space-y-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-primary">Đề thi</p>
              <h2 className="text-2xl font-black text-gray-950 dark:text-white">Kiểm tra nhanh</h2>
            </div>

            <div className="space-y-4 xl:sticky xl:top-24">
              {exams.length > 0 ? (
                exams.map((exam, index) => <ExamCard key={exam.examId} exam={exam} index={index} onStart={handleExamClick} />)
              ) : (
                <EmptyState text="Chưa có bài kiểm tra nào." compact />
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
    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{title}</span>
    <span className="text-3xl font-black text-primary">{value}</span>
  </div>
);

const ChapterCard = ({ chapter, index, onStart }) => {
  const hasQuestions = (chapter.countQuestion || 0) > 0;
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-black ${hasQuestions ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500 dark:bg-gray-700"}`}>{index + 1}</div>
        <div>
          <h4 className="text-lg font-black text-gray-950 dark:text-white">{chapter.name}</h4>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-base">quiz</span>{chapter.countQuestion || 0} câu hỏi</span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${hasQuestions ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" : "bg-gray-100 text-gray-500 dark:bg-gray-700"}`}>{hasQuestions ? "Có thể ôn" : "Chưa có câu hỏi"}</span>
          </div>
        </div>
      </div>
      <button disabled={!hasQuestions} onClick={() => onStart(chapter)} className={`rounded-xl px-6 py-3 text-sm font-bold transition-all ${hasQuestions ? "bg-primary text-white shadow-md hover:shadow-lg active:scale-95" : "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700"}`}>Bắt đầu ôn</button>
    </div>
  );
};

const ExamCard = ({ exam, index, onStart }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-black text-primary">{index + 1}</div>
      <div className="min-w-0">
        <h4 className="line-clamp-2 text-base font-black text-gray-950 dark:text-white">{exam.title}</h4>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{exam.description || "Bài kiểm tra tổng hợp kiến thức môn học."}</p>
      </div>
    </div>
    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
      <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-base">help</span>{exam.totalQuestions || 0} câu</span>
      <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-base">timer</span>{exam.duration || 60} phút</span>
    </div>
    <button onClick={() => onStart(exam)} className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95">Bắt đầu làm</button>
  </div>
);

const MiniInfo = ({ label, value }) => (
  <div>
    <span className="block text-xs font-bold uppercase text-gray-500">{label}</span>
    <span className="text-lg font-black text-gray-950 dark:text-white">{value}</span>
  </div>
);

const EmptyState = ({ text, compact = false }) => (
  <div className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800 ${compact ? "py-10" : "py-14"}`}>
    <span className="material-symbols-outlined mb-3 text-5xl text-gray-300">inbox</span>
    <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">Chưa có nội dung</h3>
    <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">{text}</p>
  </div>
);
