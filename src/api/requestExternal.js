import axios from 'axios';
import runtimeVariables from '../../public/config.js';

export default {
  $http(token) {
    return axios.create({
      baseURL: runtimeVariables.get('VUE_APP_API_BASE_URL'),
      headers: {
        ...(token
          ? { Authorization: `Translator ${token}` } : {}),
      },
    });
  },
};
