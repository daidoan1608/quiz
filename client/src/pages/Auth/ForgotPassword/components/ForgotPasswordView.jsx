import React from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  ForgotPasswordHeader,
  ResetPasswordStep,
  SendOtpStep,
  VerifyOtpStep,
} from './ForgotPasswordSteps';

export const ForgotPasswordView = ({
  email,
  form,
  handleResetPassword,
  handleSendOtp,
  handleVerifyOtp,
  loading,
  navigate,
  otpValue,
  setOtpValue,
  step,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-gray-200">
      <ForgotPasswordHeader email={email} step={step} />

      {step === 1 && (
        <SendOtpStep
          form={form}
          handleSendOtp={handleSendOtp}
          loading={loading}
        />
      )}

      {step === 2 && (
        <VerifyOtpStep
          email={email}
          handleSendOtp={handleSendOtp}
          handleVerifyOtp={handleVerifyOtp}
          loading={loading}
          otpValue={otpValue}
          setOtpValue={setOtpValue}
        />
      )}

      {step === 3 && (
        <ResetPasswordStep
          form={form}
          handleResetPassword={handleResetPassword}
          loading={loading}
        />
      )}

      {(step === 1 || step === 2) && (
        <div className="text-center mt-8 pt-4 border-t border-gray-100">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-600 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
          >
            <ArrowLeftOutlined /> Quay lại đăng nhập
          </button>
        </div>
      )}
    </div>
  </div>
);
