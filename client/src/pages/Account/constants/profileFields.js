export const createProfileFields = ({ formValues, handleChange, texts, user }) => [
  {
    edit: {
      label: texts.fullName || 'Họ tên',
      onChange: (value) => handleChange('fullName', value),
      required: true,
      value: formValues.fullName,
    },
    view: {
      label: texts.fullName || 'Họ tên',
      value: user?.fullName || user?.username,
    },
  },
  {
    view: {
      label: texts.name || 'Tên đăng nhập',
      value: user?.username,
    },
  },
  {
    edit: {
      label: texts.email || 'Email',
      onChange: (value) => handleChange('email', value),
      type: 'email',
      value: formValues.email,
    },
    view: {
      label: texts.email || 'Email',
      value: user?.email,
    },
  },
  {
    view: {
      label: texts.role || 'Vai trò',
      value: user?.role,
    },
  },
  {
    edit: {
      label: texts.tel || 'Số điện thoại',
      onChange: (value) => handleChange('phone', value),
      placeholder: texts.enterPhone || 'Nhập số điện thoại',
      value: formValues.phone,
    },
    view: {
      label: texts.tel || 'Số điện thoại',
      value: user?.phone,
    },
  },
  {
    edit: {
      component: 'address',
      label: texts.address || 'Địa chỉ',
      onChange: (value) => handleChange('address', value),
      value: formValues.address,
    },
    view: {
      label: texts.address || 'Địa chỉ',
      value: user?.address,
    },
  },
];
