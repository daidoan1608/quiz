import React from 'react';
import { PageLoadingState } from 'components/common/PageState';
import { AccountView } from './components/AccountView';
import { useAccountPage } from './hooks/useAccountPage';

const Account = () => {
  const accountPage = useAccountPage();

  if (accountPage.loading) {
    return <PageLoadingState minHeightClassName="flex-1" />;
  }

  return <AccountView {...accountPage} />;
};

export default Account;
