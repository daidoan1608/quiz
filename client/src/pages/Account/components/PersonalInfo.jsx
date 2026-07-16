import { useEffect, useState } from 'react';
import EditableInfoItem from './EditableInfoItem';
import InfoItem from './InfoItem';

const PersonalInfo = ({ user, onSave, saving, texts }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  useEffect(() => {
    setFormValues({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
  }, [user]);

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formValues);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormValues({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setIsEditing(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-700/30"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <span className="material-symbols-outlined text-primary">person</span>
          {texts.personalInfo || 'Thông tin cá nhân'}
        </h3>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary/90"
          >
            {texts.edit || 'Chỉnh sửa'}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-100 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {texts.cancel || 'Hủy'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? texts.saving || 'Đang lưu...' : texts.save || 'Lưu'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isEditing ? (
          <>
            <EditableInfoItem
              label={texts.fullName || 'Họ tên'}
              value={formValues.fullName}
              onChange={(value) => handleChange('fullName', value)}
              required
            />
            <InfoItem
              label={texts.name || 'Tên đăng nhập'}
              value={user?.username}
              texts={texts}
            />
            <EditableInfoItem
              label={texts.email || 'Email'}
              type="email"
              value={formValues.email}
              onChange={(value) => handleChange('email', value)}
            />
            <InfoItem
              label={texts.role || 'Vai trò'}
              value={user?.role}
              texts={texts}
            />
            <EditableInfoItem
              label={texts.tel || 'Số điện thoại'}
              value={formValues.phone}
              onChange={(value) => handleChange('phone', value)}
              placeholder={texts.enterPhone || 'Nhập số điện thoại'}
            />
            <EditableInfoItem
              label={texts.address || 'Địa chỉ'}
              value={formValues.address}
              onChange={(value) => handleChange('address', value)}
              placeholder={texts.enterAddress || 'Nhập địa chỉ'}
            />
          </>
        ) : (
          <>
            <InfoItem
              label={texts.fullName || 'Họ tên'}
              value={user?.fullName || user?.username}
              texts={texts}
            />
            <InfoItem
              label={texts.name || 'Tên đăng nhập'}
              value={user?.username}
              texts={texts}
            />
            <InfoItem
              label={texts.email || 'Email'}
              value={user?.email}
              texts={texts}
            />
            <InfoItem
              label={texts.role || 'Vai trò'}
              value={user?.role}
              texts={texts}
            />
            <InfoItem
              label={texts.tel || 'Số điện thoại'}
              value={user?.phone}
              texts={texts}
            />
            <InfoItem
              label={texts.address || 'Địa chỉ'}
              value={user?.address}
              texts={texts}
            />
          </>
        )}
      </div>
    </form>
  );
};

export default PersonalInfo;
