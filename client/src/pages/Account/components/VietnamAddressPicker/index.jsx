import AddressCombobox from './components/AddressCombobox';
import { useVietnamAddressPicker } from './hooks/useVietnamAddressPicker';
import { textOrFallback } from './utils/addressText';

const fieldClassName =
  'mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white';

export default function VietnamAddressPicker({ label, value, onChange, texts }) {
  const addressPicker = useVietnamAddressPicker({ onChange, value });

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:col-span-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </span>

      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <AddressCombobox
            label={textOrFallback(texts, 'provinceCity', 'Tỉnh/Thành phố')}
            value={addressPicker.addressParts.provinceName}
            query={addressPicker.provinceQuery}
            placeholder={textOrFallback(
              texts,
              'selectProvince',
              'Nhập tên tỉnh/thành phố để lọc'
            )}
            options={addressPicker.filteredProvinces}
            selectedId={addressPicker.addressParts.provinceId}
            onQueryChange={addressPicker.setProvinceQuery}
            onSelect={addressPicker.handleProvinceSelect}
          />
        </div>

        <div>
          <AddressCombobox
            label={textOrFallback(texts, 'wardCommune', 'Phường/Xã')}
            value={addressPicker.addressParts.wardName}
            query={addressPicker.wardQuery}
            placeholder={
              addressPicker.addressParts.provinceId
                ? textOrFallback(texts, 'selectWard', 'Nhập tên phường/xã để lọc')
                : textOrFallback(
                    texts,
                    'selectProvinceFirst',
                    'Chọn tỉnh/thành phố trước'
                  )
            }
            disabled={!addressPicker.addressParts.provinceId}
            options={addressPicker.filteredWards}
            selectedId={addressPicker.addressParts.wardId}
            onQueryChange={addressPicker.setWardQuery}
            onSelect={addressPicker.handleWardSelect}
          />
        </div>

        <label className="sm:col-span-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {textOrFallback(texts, 'detailAddress', 'Địa chỉ chi tiết')}
          </span>
          <input
            value={addressPicker.addressParts.detail}
            onChange={(event) =>
              addressPicker.handleDetailChange(event.target.value)
            }
            placeholder={textOrFallback(
              texts,
              'enterDetailAddress',
              'Số nhà, đường, thôn/xóm...'
            )}
            className={fieldClassName}
          />
        </label>
      </div>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {addressPicker.previewAddress ||
          textOrFallback(
            texts,
            'addressPreviewPlaceholder',
            'Địa chỉ sẽ được ghép tự động khi bạn chọn địa danh.'
          )}
      </p>
    </div>
  );
}
