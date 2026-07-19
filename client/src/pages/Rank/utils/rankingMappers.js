const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const mapRankingItem = ({ filterCriteria, item, texts }) => {
  const scoreValue =
    filterCriteria === 'avg'
      ? toNumber(item.avgScore)
      : toNumber(item.totalScore);

  return {
    attemptCount: item.attemptCount,
    avatarUrl: item.avatarUrl,
    avgScore: toNumber(item.avgScore),
    rank: Number(item.rank) || 0,
    score: scoreValue,
    subject: item.subjectName,
    totalScore: toNumber(item.totalScore),
    userId: item.userId?.toString(),
    username: item.username || texts.unknownUser || 'Người dùng',
  };
};

export const buildSubjectOptions = ({ subjects, texts }) => [
  { value: 'all', label: texts.allSubjectOption || 'Tất cả môn học' },
  ...subjects.map((subject) => ({ value: subject, label: subject })),
];

export const normalizeSubjectNames = (subjects) =>
  (Array.isArray(subjects) ? subjects : [])
    .map((subject) => subject.name)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'vi'));

export const buildDisplayedLeaderboard = ({
  currentUserId,
  currentUserRankEntry,
  leaderboardData,
}) => {
  const topLeaderboardData = leaderboardData.slice(0, 10);
  const shouldPinCurrentUser =
    currentUserRankEntry &&
    currentUserRankEntry.rank > 10 &&
    !topLeaderboardData.some(
      (item) => item.userId?.toString() === currentUserId?.toString()
    );
  const withDisplayPosition = (item, index) => ({
    ...item,
    displayPosition: index + 1,
  });

  return {
    displayedLeaderboard: shouldPinCurrentUser
      ? [
          ...topLeaderboardData.map(withDisplayPosition),
          {
            ...currentUserRankEntry,
            displayPosition: 11,
            isPinnedCurrentUser: true,
          },
        ]
      : topLeaderboardData.map(withDisplayPosition),
    shouldPinCurrentUser,
  };
};
