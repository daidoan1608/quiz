import provinces from 'vietnam-address-data/dist/data/provinces.json';
import wards from 'vietnam-address-data/dist/data/wards.json';

export const provinceOptions = provinces;

export const normalize = (value = '') =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .toLowerCase();

const normalizePlaceName = (value = '') =>
  normalize(value).replace(/^(tinh|thanh pho|tp)\s+/, '');

export const getWardsByProvinceId = (provinceId) =>
  wards.filter((ward) => ward.provinceId === provinceId);

const findProvinceByName = (name) => {
  const normalizedName = normalizePlaceName(name);
  if (!normalizedName) return null;

  return provinces.find(
    (province) => normalizePlaceName(province.name) === normalizedName
  );
};

const findWardByName = (name, provinceId) => {
  const normalizedName = normalize(name);
  if (!normalizedName || !provinceId) return null;

  return getWardsByProvinceId(provinceId).find(
    (ward) => normalize(ward.name) === normalizedName
  );
};

export const parseAddress = (address = '') => {
  const rawAddress = address.trim();
  if (!rawAddress) {
    return {
      detail: '',
      provinceId: '',
      provinceName: '',
      wardId: '',
      wardName: '',
    };
  }

  const parts = rawAddress
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  const province = parts.length
    ? findProvinceByName(parts[parts.length - 1])
    : null;
  if (!province) {
    return {
      detail: rawAddress,
      provinceId: '',
      provinceName: '',
      wardId: '',
      wardName: '',
    };
  }

  const wardCandidate = parts.length >= 2 ? parts[parts.length - 2] : '';
  const ward = findWardByName(wardCandidate, province.id);
  if (!ward) {
    return {
      detail: parts.slice(0, -1).join(', '),
      provinceId: province.id,
      provinceName: province.name,
      wardId: '',
      wardName: '',
    };
  }

  return {
    detail: parts.slice(0, -2).join(', '),
    provinceId: province.id,
    provinceName: province.name,
    wardId: ward.id,
    wardName: ward.name,
  };
};
