export const formatExamDate = (isoString) => {
  if (!isoString) return '--/--';
  return new Date(isoString).toLocaleDateString('vi-VN');
};

export const getUserExamId = (exam) =>
  exam.userExamDto?.userExamId || exam.userExamDto?.id;
