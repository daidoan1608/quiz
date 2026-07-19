import React from 'react';
import { RankView } from './components/RankView';
import { useRankings } from './hooks/useRankings';

export default function Rank() {
  const rankings = useRankings();
  return <RankView {...rankings} />;
}
