export const normalizeApiListResponse = (response) => {
  const data = Array.isArray(response.data.data)
    ? response.data.data
    : [response.data.data];
  return Array.isArray(data[0]) ? data[0] : data;
};
