import { authAxios } from "../axiosConfig";
import { normalizeList, unwrapApiData } from "./apiResponse";

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const auditLogApi = {
  async getLatest() {
    const response = await authAxios.get("/admin/audit-logs");
    return normalizeList(unwrapApiData(response));
  },
};

export const exportApi = {
  async downloadUsers() {
    const response = await authAxios.get("/admin/export/users", { responseType: "blob" });
    downloadBlob(response.data, "users.csv");
  },

  async downloadExamResults() {
    const response = await authAxios.get("/admin/export/exam-results", { responseType: "blob" });
    downloadBlob(response.data, "exam-results.csv");
  },

  async downloadQuestions() {
    const response = await authAxios.get("/admin/export/questions", { responseType: "blob" });
    downloadBlob(response.data, "questions.csv");
  },
};
