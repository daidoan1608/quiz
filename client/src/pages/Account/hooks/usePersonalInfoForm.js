import { useEffect, useState } from 'react';

const createFormValues = (user) => ({
  address: user?.address || '',
  email: user?.email || '',
  fullName: user?.fullName || '',
  phone: user?.phone || '',
});

export const usePersonalInfoForm = ({ onSave, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState(() => createFormValues(user));

  useEffect(() => {
    setFormValues(createFormValues(user));
  }, [user]);

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setFormValues(createFormValues(user));
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave(formValues);
    setIsEditing(false);
  };

  return {
    formValues,
    handleCancel,
    handleChange,
    handleSubmit,
    isEditing,
    setIsEditing,
  };
};
