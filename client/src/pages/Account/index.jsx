import React from 'react';
import { AccountView } from './components/AccountView';
import { useAccountPage } from './hooks/useAccountPage';

const Account = () => {
  const accountPage = useAccountPage();

  if (accountPage.loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <AccountView {...accountPage} />;
};

export default Account;
