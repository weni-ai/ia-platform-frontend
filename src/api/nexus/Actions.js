import request from '@/api/nexusaiRequest';

const groups = {
  'Interações gerais': 'interactions',
  'Compras de Produtos': 'shopping',
  'Assistência e Suporte': 'support',
};

export const Actions = {
  types: {
    async list({ projectUuid, language }) {
      const { data } = await request.$http.get(
        `api/${projectUuid}/template-action/`,
        {
          params: {
            language: language === 'en-us' ? 'en' : language,
          },
          hideGenericErrorAlert: true,
        },
      );

      return data
        .map(
          ({ uuid, name, display_prompt, action_type, group, language }) => ({
            uuid,
            name,
            prompt: display_prompt,
            type: action_type,
            group: Object.values(groups).includes(group) ? group : 'custom',
          }),
        )
        .filter(({ group }) => group);
    },
  },

  async create({ projectUuid, flowUuid, templateUuid, name, prompt, type }) {
    const { data } = await request.$http.post(`api/${projectUuid}/flows/`, {
      uuid: flowUuid,
      action_template_uuid: templateUuid,
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
      group:
        templateUuid && Object.values(groups).includes(data.group)
          ? data.group
          : 'custom',
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
      ({
        uuid,
        name,
        prompt,
        action_type,
        editable,
        content_base,
        fallback,
        group,
      }) => ({
        uuid,
        name,
        prompt,
        type: action_type,
        editable,
        group: Object.values(groups).includes(group) ? group : 'custom',
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
