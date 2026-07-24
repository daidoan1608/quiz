import React from 'react';
import { Button, Result } from 'antd';
import { PageLoadingState } from '../../../../components/common/PageState';

export const VerifyEmailView = ({ message, navigate, status }) => {
  if (status === 'loading') {
    return (
      <PageLoadingState
        className="bg-gray-50"
        label="Đang xác thực email..."
        minHeightClassName="min-h-screen"
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <Result
          status={status === 'success' ? 'success' : 'error'}
          title={
            status === 'success'
              ? 'Xác thực email thành công'
              : 'Xác thực email thất bại'
          }
          subTitle={message}
          extra={[
            <Button
              type="primary"
              key="login"
              onClick={() => navigate('/login')}
            >
              Đi tới đăng nhập
            </Button>,
            <Button key="home" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>,
          ]}
        />
      </div>
    </div>
  );
};
