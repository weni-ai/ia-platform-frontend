import nexusaiAPI from '@/api/nexusaiAPI.js';

export default {
  state: () => ({
    types: {
      status: null,
      data: [],
    },
  }),

  getters: {},

  actions: {
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
