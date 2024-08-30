import nexusaiAPI from '@/api/nexusaiAPI.js';

export default {
  state: () => ({
    status: null,
    data: [],

    types: {
      status: null,
      data: [],
    },
  }),

  getters: {
    actionsTypesAvailable(state) {
      return state.types.data.filter(
        ({ name, prompt }) =>
          !state.data.some(
            ({ created_file_name, description }) =>
              created_file_name === name && prompt === description,
          ),
      );
    },
  },

  actions: {
    async loadActions({ state, rootState }) {
      if (state.status !== null) {
        return;
      }

      try {
        state.status = 'loading';

        const { data } = await nexusaiAPI.router.actions.list({
          projectUuid: rootState.Auth.connectProjectUuid,
        });

        state.data = data.map((item) => ({
          uuid: item.uuid,
          extension_file: 'action',
          created_file_name: item.name,
          description: item.prompt,
          actionType: item.action_type,
        }));

        state.status = 'complete';
      } catch (error) {
        state.status = 'error';
      }
    },

    async loadActionsTypes({ state, rootState }) {
      if (state.types.status !== null) {
        return;
      }

      try {
        state.types.status = 'loading';

        const types = await nexusaiAPI.router.actions.types.list({
          projectUuid: rootState.Auth.connectProjectUuid,
        });

        state.types.data = types;

        state.types.status = 'complete';
      } catch {
        state.types.status = 'error';
      }
    },
  },

  mutations: {},
};
