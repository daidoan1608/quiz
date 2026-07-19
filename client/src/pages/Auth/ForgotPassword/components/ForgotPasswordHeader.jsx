import React from 'react';
import { forgotPasswordStepContent } from '../constants/forgotPasswordSteps';

export const ForgotPasswordHeader = ({ email, step }) => {
  const content = forgotPasswordStepContent[step];
  const description =
    step === 2 ? (
      <>
        Mã OTP đã gửi tới <b className="text-gray-800">{email}</b>
      </>
    ) : (
      content?.description
    );

  return (
    <div className="text-center mb-8 space-y-2">
      <h2 className="text-3xl font-extrabold text-blue-700 tracking-tight">
        {content?.title}
      </h2>

      {description && (
        <p
          className={`text-sm ${step === 2 ? 'text-gray-600 mt-2' : 'text-gray-500'}`}
        >
          {description}
        </p>
      )}
    </div>
  );
};
