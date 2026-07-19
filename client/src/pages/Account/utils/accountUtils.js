import { getCurrentUserId, getStoredAvatarUrl } from "utils/storage";
export { getAttemptProgress } from "utils/attemptProgress";

export { getCurrentUserId };

export const normalizeExams = (examData = []) => {
  return examData
    .filter((exam) => exam.userExamDto?.status === "SUBMITTED")
    .map((exam) => ({
      ...exam,
      endTime: exam.userExamDto?.endTime,
      examId: exam.examId || exam.id || exam.userExamDto?.examId,
      score: exam.userExamDto?.score || 0,
      startTime: exam.userExamDto?.startTime,
      subjectName: exam.subjectName || "Chưa xác định",
      title: exam.title || "Bài thi không tên",
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

export const buildLearningStats = (exams = []) => {
  const submitted = exams
    .filter((exam) => exam.startTime)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const averageScore = submitted.length
    ? submitted.reduce((sum, exam) => sum + Number(exam.score || 0), 0) / submitted.length
    : 0;

  const bySubject = Object.values(submitted.reduce((groups, exam) => {
    const subjectName = exam.subjectName || "Chưa xác định";
    const current = groups[subjectName] || { subjectName, attempts: 0, totalScore: 0, scores: [] };
    current.attempts += 1;
    current.totalScore += Number(exam.score || 0);
    current.scores.push(Number(exam.score || 0));
    groups[subjectName] = current;
    return groups;
  }, {})).map((subject) => {
    const firstScore = subject.scores[0] || 0;
    const lastScore = subject.scores[subject.scores.length - 1] || 0;
    return {
      ...subject,
      averageScore: subject.attempts ? subject.totalScore / subject.attempts : 0,
      progress: lastScore - firstScore,
    };
  }).sort((a, b) => a.averageScore - b.averageScore);

  const attemptedDates = new Set(submitted.map((exam) => new Date(exam.startTime).toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  while (attemptedDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const weakSubjects = bySubject.filter((subject) => subject.averageScore < 70).slice(0, 3);
  const roadmap = weakSubjects.length
    ? weakSubjects.map((subject) => `Ôn lại ${subject.subjectName}, ưu tiên các chương có nhiều câu sai và làm thêm 1 bài kiểm tra ngắn.`)
    : ["Duy trì nhịp học hiện tại, chọn một chương mới để luyện 10-20 câu mỗi ngày."];

  return {
    averageScore,
    streak,
    subjectProgress: bySubject,
    weakSubjects,
    roadmap,
    totalAttempts: submitted.length,
  };
};

export const buildAvatarFormData = (fileInput) => {
  const formData = new FormData();
  formData.append('file', fileInput);
  return formData;
};

export const mergeUpdatedUser = (prevUser, updatedUser) => ({
  ...prevUser,
  ...updatedUser,
  avatarUrl: updatedUser.avatarUrl || prevUser?.avatarUrl,
});

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
