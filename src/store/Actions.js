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
      const types = state.types.data;
      const actions = state.data;

      return types.filter(
        (type) =>
          !actions.some(
            (action) =>
              action.name === type.name && action.prompt === type.prompt,
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

        const actions = await nexusaiAPI.router.actions.list({
          projectUuid: rootState.Auth.connectProjectUuid,
        });

        state.data = actions;

        state.status = 'complete';
      } catch (error) {
        state.status = 'error';
      }
    },

    async addAction({ state, rootState }, { name, prompt, flowUuid, type }) {
      const action = await nexusaiAPI.router.actions.create({
        projectUuid: rootState.Auth.connectProjectUuid,
        name,
        prompt,
        flowUuid,
        type,
      });

      state.data.push(action);

      return action;
    },

    async editAction({ state, rootState }, { uuid, name, prompt }) {
      const action = await nexusaiAPI.router.actions.edit({
        projectUuid: rootState.Auth.connectProjectUuid,
        actionUuid: uuid,
        name,
        prompt,
      });

      const item = state.data.find((action) => action.uuid === uuid);

      item.name = action.name;
      item.prompt = action.prompt;

      return action;
    },

    async removeAction({ state, rootState }, { uuid }) {
      await nexusaiAPI.router.actions.delete({
        projectUuid: rootState.Auth.connectProjectUuid,
        actionUuid: uuid,
      });

      state.data = state.data.filter((action) => action.uuid !== uuid);
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
