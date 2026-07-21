export const QUESTION_DEFAULT_FILTERS = {
  subjectId: undefined,
  chapterId: undefined,
  difficulty: undefined,
  creatorId: undefined,
};

export const QUESTION_PAGE_SIZE_OPTIONS = [7, 10, 20, 50];

export const QUESTION_MIN_ANSWERS = 2;

export const QUESTION_MAX_ANSWERS = 8;

export const QUESTION_ANSWER_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export const QUESTION_FORM_INITIAL_VALUES = {
  difficulty: "MEDIUM",
  examEnabled: true,
  practiceEnabled: true,
  questionType: "SINGLE_CHOICE",
  answers: [{ content: "" }, { content: "" }],
};
