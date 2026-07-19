export const buildAddress = ({ detail, wardName, provinceName }) =>
  [detail, wardName, provinceName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
