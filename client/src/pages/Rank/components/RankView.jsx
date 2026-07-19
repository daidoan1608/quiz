import React, { useState } from 'react';
import { PageContainer } from 'components/common/PageContainer';
import { LeaderboardTable } from './LeaderboardTable';
import { RankFilters } from './RankFilters';
import { RankHeader } from './RankHeader';

export const RankView = (props) => {
  const [openSelect, setOpenSelect] = useState(null);

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark font-display transition-colors duration-300">
      <PageContainer as="div">
        <div className="flex flex-col gap-8">
          <RankHeader
            currentUserRankEntry={props.currentUserRankEntry}
            shouldPinCurrentUser={props.shouldPinCurrentUser}
            texts={props.texts}
            userRank={props.userRank}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <RankFilters
              criteriaOptions={props.criteriaOptions}
              filterCriteria={props.filterCriteria}
              openSelect={openSelect}
              selectedSubject={props.selectedSubject}
              setFilterCriteria={props.setFilterCriteria}
              setOpenSelect={setOpenSelect}
              setSelectedSubject={props.setSelectedSubject}
              setTimeFilter={props.setTimeFilter}
              subjectSelectOptions={props.subjectSelectOptions}
              texts={props.texts}
              timeFilter={props.timeFilter}
            />

            <LeaderboardTable
              currentUserId={props.currentUserId}
              displayedLeaderboard={props.displayedLeaderboard}
              filterCriteria={props.filterCriteria}
              isLoading={props.isLoading}
              texts={props.texts}
            />
          </div>
        </div>
      </PageContainer>
    </div>
  );
};
