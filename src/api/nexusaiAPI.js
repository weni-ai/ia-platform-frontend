import axios from 'axios';
import * as Sentry from '@sentry/browser';
import store from '../store';

const request = {
  get $http() {
    const client = axios.create({
      baseURL: runtimeVariables.get('NEXUS_API_BASE_URL'),
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
  ask: {
    v1({ contentBaseUuid, text }) {
      return request.$http.post('api/v1/wenigpt_question/quick-test', {
        content_base_uuid: contentBaseUuid,
        text,
      });
    },
  },

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

  createIntelligenceContentBase({ intelligenceUuid, title, description }) {
    return request.$http.post(`api/${intelligenceUuid}/content-bases/`, {
      title,
      description,
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

  updateIntelligenceContentBaseText({
    contentBaseUuid,
    contentBaseTextUuid,
    text,
  }) {
    return request.$http.put(
      `api/${contentBaseUuid}/content-bases-text/${contentBaseTextUuid}/`,
      {
        text,
      },
    );
  },

  intelligences: {
    contentBases: {
      files: {
        create({ contentBaseUuid, file, extension_file, onUploadProgress }) {
          const form = new FormData();

          form.append('file', file);
          form.append('extension_file', extension_file);

          return request.$http.post(
            `api/${contentBaseUuid}/content-bases-file/`,
            form,
            {
              onUploadProgress,
            },
          );
        },

        list({ next, contentBaseUuid }) {
          if (next) {
            return request.$http.get(forceHttps(next));
          }

          return request.$http.get(
            `api/${contentBaseUuid}/content-bases-file/`,
          );
        },

        read({ contentBaseUuid, fileUuid }) {
          return request.$http.get(
            `api/${contentBaseUuid}/content-bases-file/${fileUuid}/`,
          );
        },

        delete({ contentBaseUuid, fileUuid }) {
          return request.$http.delete(
            `api/${contentBaseUuid}/content-bases-file/${fileUuid}/`,
          );
        },
      },
    },
  },
};