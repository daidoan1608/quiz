const getServerMessage = (error) => {
  const responseData = error?.response?.data;
  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message;
  }
  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors[0];
  }
  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }
  return "";
};

export const getApiErrorMessage = (
  error,
  fallback = "Có lỗi xảy ra, vui lòng thử lại!"
) => {
  const status = error?.response?.status;
  const serverMessage = getServerMessage(error);

  if (!error?.response) {
    return "Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại!";
  }
  if ([400, 409, 422].includes(status)) {
    return serverMessage || fallback;
  }
  if (status === 401) {
    return serverMessage || "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!";
  }
  if (status === 403) {
    return "Bạn không có quyền thực hiện thao tác này!";
  }
  if (status === 404) {
    return serverMessage || "Không tìm thấy dữ liệu.";
  }
  if (status === 405) {
    return "Phương thức request không được hỗ trợ.";
  }
  if (status >= 500) {
    return "Hệ thống đang gặp sự cố, vui lòng thử lại sau!";
  }
  return serverMessage || fallback;
};
