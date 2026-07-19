import axios from 'axios';
import { attachAuthResponseInterceptor, EXPLICIT_LOGOUT_KEY } from './http/authInterceptors';
import { createAxiosConfig } from './http/clientConfig';
import { attachLanguageAndCsrfHeaders } from './http/requestInterceptors';

const config = createAxiosConfig();

const authAxios = axios.create(config);
const publicAxios = axios.create(config);

authAxios.interceptors.request.use(attachLanguageAndCsrfHeaders);
publicAxios.interceptors.request.use(attachLanguageAndCsrfHeaders);

attachAuthResponseInterceptor({ authAxios, publicAxios });

export { authAxios, EXPLICIT_LOGOUT_KEY, publicAxios };
