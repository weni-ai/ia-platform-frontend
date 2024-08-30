import request from '@/api/nexusaiRequest';
import forceHttps from '@/api/utils/forceHttps';

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

  readIntelligenceContentBase({
    intelligenceUuid,
    contentBaseUuid,
    obstructiveErrorProducer,
  }) {
    return request.$http.get(
      `api/${intelligenceUuid}/content-bases/${contentBaseUuid}/`,
      { obstructiveErrorProducer },
    );
  },

  deleteIntelligenceContentBase({ intelligenceUuid, contentBaseUuid }) {
    return request.$http.delete(
      `api/${intelligenceUuid}/content-bases/${contentBaseUuid}/`,
    );
  },

  router: {
    read({ projectUuid, obstructiveErrorProducer }) {
      return request.$http.get(`api/${projectUuid}/router/`, {
        obstructiveErrorProducer,
      });
    },

    actions: {
      types: {
        async list({ projectUuid }) {
          const { data } = await request.$http.get(
            `api/${projectUuid}/template-action/`,
            {
              hideGenericErrorAlert: true,
            },
          );

          const groups = {
            'Interações gerais': 'interactions',
            'Compras de Produtos': 'shopping',
            'Assistência e Suporte': 'support',
          };

          return data
            .map(({ uuid, name, prompt, action_type, group }) => ({
              uuid,
              name,
              prompt,
              type: action_type,
              group: groups[group],
            }))
            .filter(({ group }) => group);
        },
      },

      create({ projectUuid, flowUuid, name, description, action_type }) {
        return request.$http.post(`api/${projectUuid}/flows/`, {
          uuid: flowUuid,
          name: name,
          prompt: description,
          action_type,
          fallback: false,
        });
      },

      edit({ projectUuid, actionUuid, name, description }) {
        return request.$http.patch(`api/${projectUuid}/flows/${actionUuid}/`, {
          name,
          prompt: description,
        });
      },

      delete({ projectUuid, actionUuid }) {
        return request.$http.delete(`api/${projectUuid}/flows/${actionUuid}/`);
      },

      list({ projectUuid }) {
        return request.$http.get(`api/${projectUuid}/flows/`);
      },

      generatedNames: {
        generate({ projectUuid, chatbot_goal, context }) {
          return request.$http.post(
            `api/${projectUuid}/generate-action-name/`,
            {
              chatbot_goal,
              context,
            },
          );
        },
      },

      flows: {
        list({ next, projectUuid, name }) {
          if (next) {
            return request.$http.get(`api/${projectUuid}/search-flows/${next}`);
          }

          return request.$http.get(`api/${projectUuid}/search-flows/`, {
            params: {
              name: name ? name : undefined,
            },
          });
        },
      },
    },

    tunings: {
      read({ projectUuid }) {
        return request.$http.get(`api/${projectUuid}/llm/`);
      },

      restoreDefault({ projectUuid }) {
        return request.$http.post(`api/${projectUuid}/llm-default/`);
      },

      edit({ projectUuid, values }) {
        const { model, ...others } = values;

        return request.$http.patch(
          `api/${projectUuid}/llm/`,
          {
            model,
            setup: others,
          },
          {
            routerName: 'brain-tunings-edit',
            hideGenericErrorAlert: true,
          },
        );
      },

      advanced: {
        read({ projectUuid }) {
          return request.$http.get(`api/${projectUuid}/project`);
        },

        edit({ projectUuid, brain_on }) {
          return request.$http.patch(`api/${projectUuid}/project`, {
            brain_on,
          });
        },
      },
    },

    customization: {
      read({ projectUuid }) {
        return request.$http.get(`api/${projectUuid}/customization/`);
      },

      edit({ projectUuid, data }) {
        return request.$http.put(`api/${projectUuid}/customization/`, data, {
          routerName: 'brain-customization-edit',
          hideGenericErrorAlert: true,
        });
      },

      delete({ projectUuid, id }) {
        return request.$http.delete(
          `api/${projectUuid}/customization/?id=${id}`,
        );
      },
    },

    preview: {
      create({ projectUuid, text, contact_urn }) {
        return request.$http.post(`api/${projectUuid}/preview/`, {
          text,
          contact_urn,
        });
      },
    },
  },

  intelligences: {
    contentBases: {
      texts: {
        list({ contentBaseUuid }) {
          return request.$http.get(
            `api/${contentBaseUuid}/content-bases-text/`,
          );
        },

        create({ contentBaseUuid, text, hideGenericErrorAlert = false }) {
          return request.$http.post(
            `api/${contentBaseUuid}/content-bases-text/`,
            {
              text,
            },
            {
              routerName: 'contentBase-text-create',
              hideGenericErrorAlert,
            },
          );
        },

        edit({
          contentBaseUuid,
          contentBaseTextUuid,
          text,
          hideGenericErrorAlert = false,
        }) {
          return request.$http.put(
            `api/${contentBaseUuid}/content-bases-text/${contentBaseTextUuid}/`,
            {
              text,
            },
            {
              routerName: 'contentBase-text-edit',
              hideGenericErrorAlert,
            },
          );
        },
      },

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

        read({ contentBaseUuid, uuid }) {
          return request.$http.get(
            `api/${contentBaseUuid}/content-bases-link/${uuid}/`,
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

        read({ contentBaseUuid, uuid }) {
          return request.$http.get(
            `api/${contentBaseUuid}/content-bases-file/${uuid}/`,
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

        preview({ projectUuid, contentBaseUuid, fileUuid, page }) {
          return request.$http.post(`api/${projectUuid}/document-preview/`, {
            content_base_uuid: contentBaseUuid,
            content_base_file_uuid: fileUuid,
            page_number: page,
          });
        },
      },
    },
  },
};
