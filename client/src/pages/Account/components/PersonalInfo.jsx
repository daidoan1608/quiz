import { createProfileFields } from '../constants/profileFields';
import { usePersonalInfoForm } from '../hooks/usePersonalInfoForm';
import PersonalInfoActions from './PersonalInfoActions';
import PersonalInfoFields from './PersonalInfoFields';

const PersonalInfo = ({ user, onSave, saving, texts }) => {
  const {
    formValues,
    handleCancel,
    handleChange,
    handleSubmit,
    isEditing,
    setIsEditing,
  } = usePersonalInfoForm({ onSave, user });
  const fields = createProfileFields({ formValues, handleChange, texts, user });

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
        <PersonalInfoActions
          isEditing={isEditing}
          onCancel={handleCancel}
          onEdit={() => setIsEditing(true)}
          saving={saving}
          texts={texts}
        />
      </div>

      <PersonalInfoFields fields={fields} isEditing={isEditing} texts={texts} />
    </form>
  );
};

export default PersonalInfo;
