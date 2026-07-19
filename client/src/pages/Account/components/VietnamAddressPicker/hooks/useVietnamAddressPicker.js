import { useEffect, useMemo, useState } from 'react';
import { buildAddress } from '../utils/addressFormatters';
import {
  getWardsByProvinceId,
  normalize,
  parseAddress,
  provinceOptions,
} from '../utils/vietnamAddressLookup';

export const useVietnamAddressPicker = ({ onChange, value }) => {
  const [addressParts, setAddressParts] = useState(() => parseAddress(value));
  const [provinceQuery, setProvinceQuery] = useState(addressParts.provinceName);
  const [wardQuery, setWardQuery] = useState(addressParts.wardName);

  useEffect(() => {
    const parsedAddress = parseAddress(value);
    setAddressParts(parsedAddress);
    setProvinceQuery(parsedAddress.provinceName);
    setWardQuery(parsedAddress.wardName);
  }, [value]);

  const wardsByProvince = useMemo(
    () =>
      addressParts.provinceId
        ? getWardsByProvinceId(addressParts.provinceId)
        : [],
    [addressParts.provinceId]
  );

  const filteredProvinces = useMemo(() => {
    const normalizedQuery = normalize(provinceQuery);
    if (!normalizedQuery) return provinceOptions;

    return provinceOptions.filter((province) =>
      normalize(province.name).includes(normalizedQuery)
    );
  }, [provinceQuery]);

  const filteredWards = useMemo(() => {
    const normalizedQuery = normalize(wardQuery);
    if (!normalizedQuery) return wardsByProvince;

    return wardsByProvince.filter((ward) =>
      normalize(ward.name).includes(normalizedQuery)
    );
  }, [wardQuery, wardsByProvince]);

  const emitChange = (nextParts) => {
    setAddressParts(nextParts);
    onChange(buildAddress(nextParts));
  };

  const handleDetailChange = (detail) => {
    emitChange({ ...addressParts, detail });
  };

  const handleProvinceSelect = (province) => {
    setProvinceQuery('');
    setWardQuery('');
    emitChange({
      ...addressParts,
      provinceId: province.id,
      provinceName: province.name,
      wardId: '',
      wardName: '',
    });
  };

  const handleWardSelect = (ward) => {
    setWardQuery('');
    emitChange({
      ...addressParts,
      wardId: ward.id,
      wardName: ward.name,
    });
  };

  return {
    addressParts,
    filteredProvinces,
    filteredWards,
    handleDetailChange,
    handleProvinceSelect,
    handleWardSelect,
    previewAddress: buildAddress(addressParts),
    provinceQuery,
    setProvinceQuery,
    setWardQuery,
    wardQuery,
  };
};
