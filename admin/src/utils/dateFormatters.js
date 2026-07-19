export const ADMIN_DATE_TIME_FORMAT = "HH:mm DD/MM/YYYY";
export const API_DATE_TIME_FORMAT = "YYYY-MM-DDTHH:mm:ss";

export const formatDayjsRangeStart = (range) =>
  range?.[0] ? range[0].startOf("day").format(API_DATE_TIME_FORMAT) : undefined;

export const formatDayjsRangeEnd = (range) =>
  range?.[1] ? range[1].endOf("day").format(API_DATE_TIME_FORMAT) : undefined;
