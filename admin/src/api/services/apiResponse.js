export const unwrapApiData = (response, fallback = []) => {
  const payload = response?.data;

  if (payload && Object.prototype.hasOwnProperty.call(payload, "data")) {
    return payload.data ?? fallback;
  }

  return payload ?? fallback;
};

export const unwrapPageData = (data) => {
  const content = data?.content || [];
  const pageMeta = data?.page || {};
  const metaPageSize = pageMeta.size ?? data?.pageSize ?? content.length;
  const fallbackPageSize = metaPageSize || 1;

  const total =
    pageMeta.totalElements ??
    data?.totalElements ??
    data?.totalItems ??
    (pageMeta.totalPages ? pageMeta.totalPages * fallbackPageSize : null) ??
    (data?.totalPages ? data.totalPages * fallbackPageSize : null) ??
    (data?.totalPage ? data.totalPage * fallbackPageSize : null) ??
    data?.total ??
    content.length;

  const current =
    (typeof pageMeta.number === "number"
      ? pageMeta.number
      : data?.number ?? 0) + 1;

  return {
    content,
    current,
    pageSize: metaPageSize,
    total,
  };
};

export const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return Array.isArray(value[0]) ? value[0] : value;
  }
  return [value];
};
