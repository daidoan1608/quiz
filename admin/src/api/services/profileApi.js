import { authAxios } from "../axiosConfig";

export const fetchUserProfile = async (userId) => {
  const response = await authAxios.get(`/users/${userId}`);
  return response.data.data || {};
};
