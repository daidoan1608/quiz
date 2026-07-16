import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { examApi } from 'api/examApi';
import { parseMarkdown } from 'utils/parseMarkdown';
import { typesetMath } from 'utils/typesetMath';

export default function ResultExam() {
  // --- STATE ---
  const [examData, setExamData] = useState(null);
  const [userAnswers, setUserAnswers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- HOOKS ---
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  // Result là bước cuối của luồng: /subjects/:subjectId/exams/:examId/result
  const subjectId = location.state?.subjectId || params.subjectId;
  const examId = location.state?.examId || params.examId;
  const { userExamId, totalQuestions } = location.state || {};

  // --- 1. FETCH DỮ LIỆU ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examResponse, userAnswersResponse] = await Promise.all([
          examApi.getPublicExam(examId, {
            includeCorrectAnswers: true,
            userExamId,
          }),
          examApi.getExamAttempt(userExamId),
        ]);
        setExamData(examResponse.data.data);
        setUserAnswers(userAnswersResponse.data.data);
      } catch (error) {
        console.error('Fetch Data Error:', error.response || error);
        setError(error.message || 'Lỗi khi tải dữ liệu kết quả.');
      } finally {
        setLoading(false);
      }
    };

    if (examId && userExamId) {
      fetchData();
    } else {
      setError('Thiếu thông tin bài kiểm tra.');
      setLoading(false);
    }
  }, [examId, userExamId]);

  useEffect(() => {
    if (examData) typesetMath();
  }, [examData]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500 bg-background-light dark:bg-background-dark">
        {error}
      </div>
    );

  // --- 2. TÍNH TOÁN CHỈ SỐ ---
  if (!examData || !userAnswers || !userAnswers.userExamDto) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Lỗi: Không tìm thấy dữ liệu bài thi chi tiết.
      </div>
    );
  }

  const getAnswerId = (answer) => answer?.optionId || answer?.answerId;
  const sameAnswerSet = (a, b) =>
    a.length === b.length && a.every((id) => b.includes(id));

  const userAnswerIdsByQuestion = (userAnswers.userAnswerDtos || []).reduce(
    (acc, userAnswer) => {
      if (!userAnswer.questionId || !userAnswer.answerId) return acc;
      acc[userAnswer.questionId] = acc[userAnswer.questionId] || [];
      if (!acc[userAnswer.questionId].includes(userAnswer.answerId)) {
        acc[userAnswer.questionId].push(userAnswer.answerId);
      }
      return acc;
    },
    {}
  );

  const questionResults = (examData.questions || []).map((question) => {
    const selectedIds = userAnswerIdsByQuestion[question.questionId] || [];
    const correctIds = (question.answers || [])
      .filter((answer) => answer.isCorrect)
      .map(getAnswerId)
      .filter(Boolean);
    const isSkipped = selectedIds.length === 0;
    const isCorrect = !isSkipped && sameAnswerSet(selectedIds, correctIds);
    return { question, selectedIds, correctIds, isSkipped, isCorrect };
  });

  // Dữ liệu cơ bản
  const rawScore = userAnswers.userExamDto.score || 0; // Điểm số trên thang 100
  const calculatedTotal = examData.questions?.length || totalQuestions || 1; // Tổng số câu hỏi
  const calculatedCorrect = questionResults.filter(
    (result) => result.isCorrect
  ).length;

  // Số câu đã làm = số câu có ít nhất một đáp án được chọn (multichoice vẫn tính là 1 câu)
  const answeredQuestions = questionResults.filter(
    (result) => !result.isSkipped
  ).length;

  // Số câu Bỏ qua (Skipped)
  const skippedAnswers = calculatedTotal - answeredQuestions;

  // Số câu Sai
  const wrongAnswers = answeredQuestions - calculatedCorrect;

  // Tỷ lệ Chính xác (Chỉ trên số câu ĐÃ LÀM)
  const answeredTotal = answeredQuestions || 1; // Tránh chia cho 0
  const accuracyOnAnswered =
    Math.round((calculatedCorrect / answeredTotal) * 100) || 0;

  // Tính toán Tỷ lệ % trên TỔNG SỐ CÂU (cho Biểu đồ tròn)
  const totalForPercentage = calculatedTotal || 100; // Đảm bảo không chia cho 0 hoặc dùng 100
  const correctPercentageOnTotal =
    Math.round((calculatedCorrect / totalForPercentage) * 100) || 0;
  const wrongPercentageOnTotal =
    Math.round((wrongAnswers / totalForPercentage) * 100) || 0;
  // Bỏ qua = 100 - Đúng - Sai
  const skippedPercentageOnTotal =
    100 - correctPercentageOnTotal - wrongPercentageOnTotal;

  // Tính toán SVG Chart (Chu vi ~ 100)
  // Các giá trị này dùng làm strokeDasharray
  const correctStroke = correctPercentageOnTotal;
  const wrongStroke = wrongPercentageOnTotal;
  const skippedStroke = skippedPercentageOnTotal;

  // --- RENDER ---
  return (
    <div className="relative flex min-h-screen w-full flex-col font-display bg-background-light dark:bg-background-dark text-[#111418] dark:text-gray-200">
      {/* MAIN CONTENT */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col gap-8">
          {/* 1. Header Kết quả */}
          <div className="flex flex-wrap justify-between gap-4 items-center">
            <div className="flex flex-col gap-2">
              <p className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black tracking-[-0.033em]">
                Kết quả: {examData.title}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal">
                {rawScore >= 50
                  ? 'Chúc mừng! Bạn đã hoàn thành bài kiểm tra.'
                  : 'Kết quả chưa tốt, hãy cố gắng hơn lần sau nhé!'}
              </p>
            </div>
          </div>

          {/* 2. Thống kê nhanh (Grid 3 cột) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800">
              <p className="text-gray-800 dark:text-gray-300 text-base font-medium leading-normal">
                Điểm số
              </p>
              <p className="text-gray-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
                {typeof rawScore === 'number' ? rawScore.toFixed(1) : rawScore}
                /100
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800">
              <p className="text-gray-800 dark:text-gray-300 text-base font-medium leading-normal">
                Tỷ lệ chính xác
              </p>
              <p className="text-gray-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
                {accuracyOnAnswered}%
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800">
              <p className="text-gray-800 dark:text-gray-300 text-base font-medium leading-normal">
                Trạng thái
              </p>
              <p
                className={`tracking-light text-3xl font-bold leading-tight ${
                  rawScore >= 50
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-red-600 dark:text-red-500'
                }`}
              >
                {rawScore >= 50 ? 'Đạt' : 'Chưa đạt'}
              </p>
            </div>
          </div>

          {/* 3. Phân tích hiệu suất (Biểu đồ tròn) */}
          <div className="flex flex-col gap-6">
            <h2 className="text-gray-900 dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em]">
              Phân tích hiệu suất
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800">
                <p className="text-gray-800 dark:text-gray-300 text-base font-medium leading-normal">
                  Tỷ lệ câu trả lời (trên tổng số câu)
                </p>
                <div className="flex items-center gap-6">
                  {/* SVG Chart  */}
                  <div className="relative size-32">
                    <svg className="size-full" viewBox="0 0 36 36">
                      {/* Nền (Màu xám/đỏ nhạt cho phần còn lại) */}
                      <circle
                        className="stroke-current text-gray-200 dark:text-gray-700"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="15.9154943092"
                        strokeWidth="3"
                      ></circle>

                      {/* 1. Phần Bỏ qua (Xám) - Bắt đầu từ 0 */}
                      <circle
                        className="stroke-current text-gray-400/50 transition-all duration-1000 ease-out"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="15.9154943092"
                        strokeWidth="3"
                        strokeDasharray={`${skippedStroke}, 100`}
                        strokeDashoffset={0}
                      ></circle>

                      {/* 2. Phần Sai (Đỏ) - Bắt đầu sau phần Bỏ qua */}
                      <circle
                        className="stroke-current text-red-500 transition-all duration-1000 ease-out"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="15.9154943092"
                        strokeWidth="3"
                        strokeDasharray={`${wrongStroke}, 100`}
                        strokeDashoffset={-skippedStroke}
                      ></circle>

                      {/* 3. Phần Đúng (Xanh) - Bắt đầu sau phần Sai */}
                      <circle
                        className="stroke-current text-green-500 transition-all duration-1000 ease-out"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="15.9154943092"
                        strokeWidth="3"
                        strokeDasharray={`${correctStroke}, 100`}
                        strokeDashoffset={-(skippedStroke + wrongStroke)}
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {calculatedCorrect}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        /{calculatedTotal} câu
                      </span>
                    </div>
                  </div>

                  {/* Chú thích */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {calculatedCorrect} Đúng ({correctPercentageOnTotal}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {wrongAnswers} Sai ({wrongPercentageOnTotal}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-gray-400/50"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {skippedAnswers} Bỏ qua ({skippedPercentageOnTotal}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              disabled
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-white text-sm font-semibold opacity-50 cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-base">
                school
              </span>
              Ôn tập câu sai (Sắp ra mắt)
            </button>
            {/* Nút Làm lại bài kiểm tra */}
            <button
              onClick={() => {
                const newStartTime = new Date().toISOString();
                const currentSubjectId = subjectId || examData?.subjectId;
                navigate(`/subjects/${currentSubjectId}/exams/${examId}`, {
                  state: {
                    examId: examId,
                    subjectId: currentSubjectId,
                    startTime: newStartTime,
                  },
                });
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-base">
                refresh
              </span>
              Làm lại bài kiểm tra
            </button>
            <button
              onClick={() => {
                const currentSubjectId = subjectId || examData?.subjectId;
                navigate(`/subjects/${currentSubjectId}`, {
                  state: { subjectId: currentSubjectId },
                });
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-base">
                list_alt
              </span>
              Quay về danh sách
            </button>
          </div>

          {/* 5. Chi tiết câu trả lời */}
          <div className="flex flex-col gap-6">
            <h2 className="text-gray-900 dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em]">
              Chi tiết câu trả lời
            </h2>
            <div className="flex flex-col gap-4">
              {questionResults.map(
                ({ question, selectedIds, isSkipped, isCorrect }, index) => {
                  return (
                    <div
                      key={question.questionId}
                      className="rounded-xl p-5 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800"
                    >
                      <div className="flex flex-col gap-4">
                        {/* Tiêu đề câu hỏi & Badge */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="text-gray-800 dark:text-gray-200 font-semibold flex flex-wrap gap-2">
                            <span className="shrink-0">Câu {index + 1}:</span>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: parseMarkdown(question.content),
                              }}
                            />
                          </div>
                          <div
                            className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full shrink-0
                            ${
                              isSkipped
                                ? 'text-gray-600 bg-gray-100 dark:bg-gray-700/50'
                                : isCorrect
                                  ? 'text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/50'
                                  : 'text-red-600 dark:text-red-500 bg-red-100 dark:bg-red-900/50'
                            }`}
                          >
                            <span className="material-symbols-outlined !text-base">
                              {isSkipped
                                ? 'radio_button_unchecked'
                                : isCorrect
                                  ? 'check_circle'
                                  : 'cancel'}
                            </span>
                            <span>
                              {isSkipped
                                ? 'Bỏ qua'
                                : isCorrect
                                  ? 'Đúng'
                                  : 'Sai'}
                            </span>
                          </div>
                        </div>

                        {/* Hiển thị đầy đủ tất cả đáp án */}
                        <div className="grid grid-cols-1 gap-3 mt-2 sm:grid-cols-2">
                          {question.answers.map((answer, answerIndex) => {
                            const answerId = getAnswerId(answer);
                            const isUserChoice = selectedIds.includes(answerId);
                            const isRightAnswer = answer.isCorrect;

                            let answerClass =
                              'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60';
                            if (isRightAnswer) {
                              answerClass =
                                'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/30';
                            }
                            if (isUserChoice && !isRightAnswer) {
                              answerClass =
                                'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/30';
                            }

                            return (
                              <div
                                key={answerId || answerIndex}
                                className={`flex items-start gap-3 rounded-lg border p-3 ${answerClass}`}
                              >
                                <div
                                  className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                    isRightAnswer
                                      ? 'bg-green-500 text-white'
                                      : isUserChoice
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  {String.fromCharCode(65 + answerIndex)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {isRightAnswer && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900/50 dark:text-green-300">
                                        <span className="material-symbols-outlined !text-sm">
                                          check_circle
                                        </span>
                                        Đáp án đúng
                                      </span>
                                    )}
                                    {isUserChoice && (
                                      <span
                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                                          isRightAnswer
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                        }`}
                                      >
                                        <span className="material-symbols-outlined !text-sm">
                                          person
                                        </span>
                                        Bạn chọn
                                      </span>
                                    )}
                                  </div>
                                  <div
                                    className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200"
                                    dangerouslySetInnerHTML={{
                                      __html: parseMarkdown(answer.content),
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
