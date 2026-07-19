import EditableInfoItem from './EditableInfoItem';
import InfoItem from './InfoItem';
import VietnamAddressPicker from './VietnamAddressPicker';

const PersonalInfoFields = ({ fields, isEditing, texts }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {fields.map((field) => {
      if (!isEditing) {
        return (
          <InfoItem
            key={field.view.label}
            label={field.view.label}
            value={field.view.value}
            texts={texts}
          />
        );
      }

      if (!field.edit) {
        return (
          <InfoItem
            key={field.view.label}
            label={field.view.label}
            value={field.view.value}
            texts={texts}
          />
        );
      }

      if (field.edit.component === 'address') {
        return (
          <VietnamAddressPicker
            key={field.edit.label}
            label={field.edit.label}
            value={field.edit.value}
            onChange={field.edit.onChange}
            texts={texts}
          />
        );
      }

      return <EditableInfoItem key={field.edit.label} {...field.edit} />;
    })}
  </div>
);

export default PersonalInfoFields;
