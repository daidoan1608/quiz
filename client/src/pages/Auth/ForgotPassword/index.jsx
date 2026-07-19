import React from 'react';
import { Form } from 'antd';
import { ForgotPasswordView } from './components/ForgotPasswordView';
import { useForgotPasswordFlow } from './hooks/useForgotPasswordFlow';

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const forgotPasswordFlow = useForgotPasswordFlow(form);

  return <ForgotPasswordView form={form} {...forgotPasswordFlow} />;
};

export default ForgotPassword;
