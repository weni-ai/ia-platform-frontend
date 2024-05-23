import axios from 'axios';

export default {
  $http() {
    return axios.create({
      baseURL: 'https://chatguy-nlp.weni.ai/',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};
