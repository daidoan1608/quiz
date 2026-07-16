import { authAxios } from '../axiosConfig';

const getResponseData = (response, fallback) =>
  response?.data?.data ?? response?.data ?? fallback;

export const documentApi = {
  getAll() {
    return authAxios
      .get('/admin/documents')
      .then((response) => getResponseData(response, []));
  },

  create(formData) {
    return authAxios
      .post('/admin/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((response) => getResponseData(response, null));
  },

  update(id, payload) {
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) params.append(key, value);
    });
    return authAxios
      .patch(`/admin/documents/${id}`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .then((response) => getResponseData(response, null));
  },

  delete(id) {
    return authAxios.delete(`/admin/documents/${id}`);
  },
};
