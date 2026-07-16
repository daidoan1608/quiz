import { publicAxios } from './axiosConfig';

const getResponseData = (response, fallback) =>
  response?.data?.data ?? response?.data ?? fallback;

export const getDocumentDownloadUrl = (documentId) =>
  publicAxios.getUri({ url: `/public/documents/${documentId}/download` });

export const documentApi = {
  getAll() {
    return publicAxios
      .get('/public/documents')
      .then((response) => getResponseData(response, []));
  },
};
