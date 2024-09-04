import request from '@/api/nexusaiRequest';

export const Actions = {
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

  async create({ projectUuid, flowUuid, name, prompt, type }) {
    const { data } = await request.$http.post(`api/${projectUuid}/flows/`, {
      uuid: flowUuid,
      name,
      prompt,
      action_type: type,
      fallback: false,
    });

    return {
      uuid: data.uuid,
      name: data.name,
      prompt: data.prompt,
      type: data.action_type,
    };
  },

  async edit({ projectUuid, actionUuid, name, prompt }) {
    const { data } = await request.$http.patch(
      `api/${projectUuid}/flows/${actionUuid}/`,
      {
        name,
        prompt,
      },
    );

    return {
      uuid: data.uuid,
      name: data.name,
      prompt: data.prompt,
    };
  },

  delete({ projectUuid, actionUuid }) {
    return request.$http.delete(`api/${projectUuid}/flows/${actionUuid}/`);
  },

  async list({ projectUuid }) {
    const { data } = await request.$http.get(`api/${projectUuid}/flows/`);

    return data.map(
      ({ uuid, name, prompt, action_type, content_base, fallback }) => ({
        uuid,
        name,
        prompt,
        type: action_type,
      }),
    );
  },

  generatedNames: {
    generate({ projectUuid, chatbot_goal, context }) {
      return request.$http.post(`api/${projectUuid}/generate-action-name/`, {
        chatbot_goal,
        context,
      });
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
};
