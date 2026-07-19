import React from 'react';
import { Button } from 'antd';
import OtpInput from 'react-otp-input';

const OTP_INPUT_STYLE = {
  border: '1px solid #d9d9d9',
  borderRadius: '10px',
  fontSize: '20px',
  fontWeight: 'bold',
  height: '45px',
  margin: '0 2px',
  transition: 'border-color 0.2s',
  width: '45px',
};

const OTP_FOCUS_STYLE = {
  borderColor: '#3b82f6',
  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
};

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
        renderInput={(props) => <input {...props} />}
        inputStyle={OTP_INPUT_STYLE}
        focusStyle={OTP_FOCUS_STYLE}
      />
    </div>

    <Button
      type="primary"
      onClick={handleVerifyOtp}
      loading={loading}
      block
      className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-lg transition-all duration-300"
    >
      Xác nhận OTP
    </Button>

    <div className="text-center text-sm pt-2">
      Chưa nhận được mã?{' '}
      <button
        onClick={() => handleSendOtp({ email })}
        className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
      >
        Gửi lại
      </button>
    </div>
  </div>
);
