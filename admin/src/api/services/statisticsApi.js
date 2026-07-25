import { authAxios } from "../axiosConfig";
import { unwrapApiData } from "./apiResponse";

export const statisticsApi = {
  async getDashboard(params) {
    const response = await authAxios.get("/admin/statistics", { params });
    return unwrapApiData(response, {});
  },
};
