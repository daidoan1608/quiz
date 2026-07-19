import React from 'react';
import { Button } from 'antd';

export const AuthSubmitButton = ({ children, loading }) => (
  <Button
    block
    type="primary"
    htmlType="submit"
    loading={loading}
    className="auth-primary-btn w-full h-12 rounded-lg font-semibold text-lg shadow-md transition-all duration-300 border-none"
  >
    {children}
  </Button>
);
