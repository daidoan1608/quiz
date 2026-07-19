import { publicAxios } from '../axiosConfig';
import { getResponseData } from './apiResponse';

export const getDocumentDownloadUrl = (documentId) =>
  publicAxios.getUri({ url: `/public/documents/${documentId}/download` });

export const documentApi = {
  getAll() {
    return publicAxios
      .get('/public/documents')
      .then((response) => getResponseData(response, []));
  },
};
