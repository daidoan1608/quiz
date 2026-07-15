import { getCurrentUserId, getStoredAvatarUrl } from "utils/storage";

export { getCurrentUserId };

export const ACCOUNT_SECTIONS = {
  ROADMAP: "roadmap",
  PERSONAL: "personal",
};

export const normalizeExams = (examData = []) => {
  return examData.filter((exam) => exam.userExamDto?.status === "SUBMITTED").map((exam) => ({
    ...exam,
    examId: exam.examId || exam.id || exam.userExamDto?.examId,
    subjectName: exam.subjectName || "Chưa xác định",
    title: exam.title || "Bài thi không tên",
    score: exam.userExamDto?.score || 0,
    startTime: exam.userExamDto?.startTime,
    endTime: exam.userExamDto?.endTime,
  }));
};

export const groupExamsBySubject = (exams = []) => {
  return exams.reduce((groups, exam) => {
    const subjectName = exam.subjectName;
    return {
      ...groups,
      [subjectName]: [...(groups[subjectName] || []), exam],
    };
  }, {});
};

export const getAttemptProgress = (attempt) => {
  const total = Number(attempt.totalQuestions) || 0;
  const answered = Number(attempt.answeredCount) || 0;
  return total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : 0;
};

export const buildProfilePayload = (profileValues) => ({
  fullName: profileValues.fullName?.trim(),
  email: profileValues.email?.trim(),
  phone: profileValues.phone?.trim(),
  address: profileValues.address?.trim(),
});

export const buildExamAttemptLocation = (attempt) => ({
  pathname: `/subjects/${attempt.subjectId}/exams/${attempt.examId}`,
  state: {
    subjectId: attempt.subjectId,
    examId: attempt.examId,
    title: attempt.title,
  },
});

export const resolveAvatarUrl = ({ userData, avatarUrl }) => {
  const storedAvatarUrl = getStoredAvatarUrl();
  return userData.avatarUrl || avatarUrl || storedAvatarUrl || "";
};
