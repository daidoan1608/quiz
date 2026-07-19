import React from 'react';
import { Form } from 'antd';
import { RegisterView } from './components/RegisterView';
import { useRegisterForm } from './hooks/useRegisterForm';

const RegisterForm = () => {
  const [form] = Form.useForm();
  const registerForm = useRegisterForm(form);

  return <RegisterView form={form} {...registerForm} />;
};

export default RegisterForm;
