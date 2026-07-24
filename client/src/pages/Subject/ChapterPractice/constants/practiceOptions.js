export const DEFAULT_PRACTICE_CONFIG = {
  limit: 10,
  difficulty: 'ALL',
  mode: 'all',
};

export const SMART_WRONG_MODES = {
  wrongRecent: 'recent',
};

export const SUBJECT_MODE_OPTIONS = [
  {
    value: 'wrongRecent',
    label: 'Câu sai',
    icon: 'error',
    description: 'Ôn lại các câu bạn từng trả lời chưa đúng.',
  },
  {
    value: 'markedSubject',
    label: 'Câu đã lưu',
    icon: 'bookmark',
    description: 'Tập trung vào những câu bạn đã đánh dấu.',
  },
];

export const PRACTICE_DIFFICULTY_OPTIONS = [
  { value: 'ALL', label: 'Tất cả độ khó' },
  { value: 'EASY', label: 'Dễ' },
  { value: 'MEDIUM', label: 'Trung bình' },
  { value: 'HARD', label: 'Khó' },
];
