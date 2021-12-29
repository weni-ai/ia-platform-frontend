import axios from 'axios';

export default {
  $http(token) {
    return axios.create({
      baseURL: config.get('VUE_APP_API_BASE_URL'),
      headers: {
        ...(token
          ? { Authorization: `Translator ${token}` } : {}),
      },
    });
  },
};
