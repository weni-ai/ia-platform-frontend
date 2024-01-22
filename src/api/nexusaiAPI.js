import axios from 'axios';
import * as Sentry from '@sentry/browser';
import store from '../store';

const request = {
  get $http() {
    const client = axios.create({
      baseURL: 'https://nexus.dev.cloud.weni.ai',
      headers: {
        ...(store.getters.authenticated
          ? { Authorization: `${store.getters.authToken}` }
          : {}),
      },
    });
    client.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response.status === 500 || err.response.status === 408) {
          Sentry.captureException(err);
        }
        throw err;
      },
    );
    return client;
  },
};

export default {
  listIntelligences({ next, orgUuid } = {}) {
    return request.$http.get(`api/${orgUuid}/intelligences/`, {
      params: { next },
    });
  },

  createIntelligence({ orgUuid, name, description }) {
    return request.$http.post(`api/${orgUuid}/intelligences/`, { name, description });
  },

  readIntelligence({ orgUuid, intelligenceUuid }) {
    return request.$http.get(`api/${orgUuid}/intelligences/${intelligenceUuid}/`);
  },

  updateIntelligence({ orgUuid, intelligenceUuid, name, description }) {
    return request.$http.put(`api/${orgUuid}/intelligences/${intelligenceUuid}/`, {
      name,
      description,
    });
  },

  deleteIntelligence({ orgUuid, intelligenceUuid }) {
    return request.$http.delete(`api/${orgUuid}/intelligences/${intelligenceUuid}/`);
  },
};
