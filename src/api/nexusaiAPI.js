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

function forceHttps(receivedUrl) {
  const url = new URL(receivedUrl);

  url.protocol = 'https:';

  return url.toString();
}

export default {
  listIntelligences({ next, orgUuid } = {}) {
    if (next) {
      return request.$http.get(forceHttps(next));
    }

    return request.$http.get(`api/${orgUuid}/intelligences/`);
  },

  createIntelligence({ orgUuid, name, description }) {
    return request.$http.post(`api/${orgUuid}/intelligences/`, {
      name,
      description,
    });
  },

  readIntelligence({ orgUuid, intelligenceUuid }) {
    return request.$http.get(
      `api/${orgUuid}/intelligences/${intelligenceUuid}/`,
    );
  },

  updateIntelligence({ orgUuid, intelligenceUuid, name, description }) {
    return request.$http.put(
      `api/${orgUuid}/intelligences/${intelligenceUuid}/`,
      {
        name,
        description,
      },
    );
  },

  deleteIntelligence({ orgUuid, intelligenceUuid }) {
    return request.$http.delete(
      `api/${orgUuid}/intelligences/${intelligenceUuid}/`,
    );
  },

  createIntelligenceContentBase({ intelligenceUuid, title }) {
    return request.$http.post(`api/${intelligenceUuid}/content-bases/`, {
      title,
    });
  },

  listIntelligencesContentBases({ intelligenceUuid, next }) {
    if (next) {
      return request.$http.get(forceHttps(next));
    }

    return request.$http.get(`api/${intelligenceUuid}/content-bases/`);
  },

  readIntelligenceContentBase({ intelligenceUuid, contentBaseUuid }) {
    return request.$http.get(
      `api/${intelligenceUuid}/content-bases/${contentBaseUuid}/`,
    );
  },

  deleteIntelligenceContentBase({ intelligenceUuid, contentBaseUuid }) {
    return request.$http.delete(
      `api/${intelligenceUuid}/content-bases/${contentBaseUuid}/`,
    );
  },

  createIntelligenceContentBaseText({ contentBaseUuid, text }) {
    return request.$http.post(`api/${contentBaseUuid}/content-bases-text/`, {
      text,
    });
  },

  listIntelligenceContentBaseTexts({ contentBaseUuid }) {
    return request.$http.get(`api/${contentBaseUuid}/content-bases-text/`);
  },

  updateIntelligenceContentBaseText({ contentBaseUuid, contentBaseTextUuid, text }) {
    return request.$http.put(`api/${contentBaseUuid}/content-bases-text/${contentBaseTextUuid}/`, {
      text,
    });
  },
};
