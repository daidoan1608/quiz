import { publicAxios } from '../axiosConfig';
import { getResponseData } from './apiResponse';

export const documentApi = {
  getAll() {
    return publicAxios
      .get('/public/documents')
      .then((response) => getResponseData(response, []));
  },
};
