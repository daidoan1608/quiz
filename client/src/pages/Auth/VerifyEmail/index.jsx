import React from 'react';
import { VerifyEmailView } from './components/VerifyEmailView';
import { useVerifyEmail } from './hooks/useVerifyEmail';

const VerifyEmail = () => {
  const verifyEmail = useVerifyEmail();

  return <VerifyEmailView {...verifyEmail} />;
};

export default VerifyEmail;
