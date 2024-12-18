import request from '@/api/nexusaiRequest';

const groups = {
  'Interações gerais': 'interactions',
  'Compras de Produtos': 'shopping',
  'Assistência e Suporte': 'support',
  'Mídias e localização': 'media',
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

  async create({
    projectUuid,
    flowUuid,
    templateUuid,
    name,
    prompt,
    type,
    send_llm_response_to_flow,
  }) {
    const { data } = await request.$http.post(`api/${projectUuid}/flows/`, {
      uuid: flowUuid,
      action_template_uuid: templateUuid,
      name,
      prompt,
      action_type: type,
      fallback: false,
      send_to_llm: send_llm_response_to_flow,
    });

    return {
      uuid: data.uuid,
      name: data.name,
      prompt: data.prompt,
      type: data.action_type,
      flow_uuid: data.flow_uuid,
      send_llm_response_to_flow: data.send_to_llm,
      group:
        templateUuid && Object.values(groups).includes(data.group)
          ? data.group
          : 'custom',
    };
  },

  async edit({
    projectUuid,
    actionUuid,
    name,
    flow_uuid,
    prompt,
    send_llm_response_to_flow,
  }) {
    const { data } = await request.$http.patch(
      `api/${projectUuid}/flows/${actionUuid}/`,
      {
        name,
        flow_uuid,
        prompt,
        send_to_llm: send_llm_response_to_flow,
      },
    );

    return {
      uuid: data.uuid,
      name: data.name,
      flow_uuid: data.flow_uuid,
      prompt: data.prompt,
      send_llm_response_to_flow: data.send_to_llm,
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
        flow_uuid,
        send_to_llm,
      }) => ({
        uuid,
        name,
        prompt,
        type: action_type,
        editable,
        group: Object.values(groups).includes(group) ? group : 'custom',
        flow_uuid,
        send_llm_response_to_flow: send_to_llm,
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
