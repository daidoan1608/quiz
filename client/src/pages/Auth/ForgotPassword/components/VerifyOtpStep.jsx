import React from 'react';
import { Button } from 'antd';
import OtpInput from 'react-otp-input';

export const VerifyOtpStep = ({
  email,
  handleSendOtp,
  handleVerifyOtp,
  loading,
  otpValue,
  setOtpValue,
}) => (
  <div className="space-y-6">
    <div className="flex justify-center py-2">
      <OtpInput
        value={otpValue}
        onChange={setOtpValue}
        numInputs={6}
        renderSeparator={<span>&nbsp;&nbsp;</span>}
        renderInput={(props) => <input {...props} className="auth-otp-input" />}
      />
    </div>

    <Button
      type="primary"
      onClick={handleVerifyOtp}
      loading={loading}
      block
      className="auth-primary-btn h-12 rounded-xl font-semibold text-lg transition-all duration-300"
    >
      Xác nhận OTP
    </Button>

    <div className="text-center text-sm pt-2">
      Chưa nhận được mã?{' '}
      <button
        onClick={() => handleSendOtp({ email })}
        className="auth-link font-medium hover:underline transition-colors"
        type="button"
      >
        Gửi lại
      </button>
    </div>
  </div>
);
