import axios from 'axios';
import * as Sentry from '@sentry/browser';
import store from '../store';
import i18n from '../utils/plugins/i18n';
import { get } from 'lodash';

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
        Sentry.captureException(err);

        if (err.response.status === 500 || err.response.status === 408) {
          store.state.alert = {
            text:
              get(err, 'response.data.detail') ||
              i18n.t('internal_server_error'),
            type: 'error',
          };
        } else if (err.response.status === 401) {
          store.state.alert = {
            text: get(err, 'response.data.detail') || i18n.t('unauthorized'),
            type: 'error',
          };
        } else {
          store.state.alert = {
            text:
              get(err, 'response.data.detail') || i18n.t('unexpected_error'),
            type: 'error',
          };
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
  question: {
    create({ contentBaseUuid, text, language }) {
      return request.$http.post('api/v1/wenigpt_question/quick-test', {
        content_base_uuid: contentBaseUuid,
        text,
        language,
      });
    },

    feedback: {
      create({ contentBaseUuid, questionUuid, value, feedback }) {
        return request.$http.post(
          `api/${contentBaseUuid}/content-base-logs/${questionUuid}`,
          {
            value,
            feedback,
          },
        );
      },
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

  createIntelligenceContentBase({
    intelligenceUuid,
    title,
    language,
    description,
  }) {
    return request.$http.post(`api/${intelligenceUuid}/content-bases/`, {
      title,
      language,
      description,
    });
  },

  patchIntelligenceContentBase({
    intelligenceUuid,
    contentBaseUuid,
    title,
    language,
    description,
  }) {
    return request.$http.patch(
      `api/${intelligenceUuid}/content-bases/${contentBaseUuid}/`,
      {
        title,
        language,
        description,
      },
    );
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

  router: {
    read({ projectUuid }) {

      return request.$http.get(`api/${projectUuid}/router/`);
    },
  },

  intelligences: {
    contentBases: {
      sites: {
        create({ contentBaseUuid, link }) {
          return request.$http.post(
            `api/${contentBaseUuid}/content-bases-link/`,
            {
              link,
            },
          );
        },

        list({ next, contentBaseUuid }) {
          if (next) {
            return request.$http.get(forceHttps(next));
          }

          return request.$http.get(
            `api/${contentBaseUuid}/content-bases-link/`,
          );
        },

        delete({ contentBaseUuid, linkUuid }) {
          return request.$http.delete(
            `api/${contentBaseUuid}/content-bases-link/${linkUuid}/`,
          );
        },
      },

      files: {
        create({ contentBaseUuid, file, extension_file, onUploadProgress }) {
          const form = new FormData();

          const fileName =
            file.name.lastIndexOf('.') === -1
              ? file.name
              : file.name
                  .slice(0, file.name.lastIndexOf('.'))
                  .replace(/\./g, ' ') +
                file.name.slice(file.name.lastIndexOf('.'));

          form.append('file', file, fileName);
          form.append('extension_file', extension_file);
          form.append('load_type', 'pdfminer');

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

        download({ fileUuid, file_name }) {
          return request.$http.post('api/v1/download-file', {
            file_name,
            content_base_file: fileUuid,
          });
        },
      },
    },
  },
};
