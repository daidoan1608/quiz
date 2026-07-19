import React from 'react';
import { Form } from 'antd';
import { LoginView } from './components/LoginView';
import { useLoginForm } from './hooks/useLoginForm';

function Login() {
  const [form] = Form.useForm();
  const loginForm = useLoginForm(form);

  return <LoginView form={form} {...loginForm} />;
}

export default Login;
