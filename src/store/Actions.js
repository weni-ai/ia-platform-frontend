import nexusaiAPI from '@/api/nexusaiAPI.js';
import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import globalStore from '.';

export const useActionsStore = defineStore('actions', () => {
  const connectProjectUuid = computed(
    () => globalStore.state.Auth.connectProjectUuid,
  );

  const actions = reactive({
    status: null,
    data: [],
  });

  async function loadActions() {
    if (actions.status !== null) {
      return;
    }

    try {
      actions.status = 'loading';

      const data = await nexusaiAPI.router.actions.list({
        projectUuid: connectProjectUuid.value,
      });

      actions.data = data;

      actions.status = 'complete';
    } catch (error) {
      actions.status = 'error';
    }
  }

  async function addAction({ name, prompt, flowUuid, type }) {
    const action = await nexusaiAPI.router.actions.create({
      projectUuid: connectProjectUuid.value,
      name,
      prompt,
      flowUuid,
      type,
    });

    actions.data.push(action);

    return action;
  }

  async function editAction({ uuid, name, prompt }) {
    const editedAction = await nexusaiAPI.router.actions.edit({
      projectUuid: connectProjectUuid.value,
      actionUuid: uuid,
      name,
      prompt,
    });

    const item = actions.data.find(
      (action) => action.uuid === editedAction.uuid,
    );

    item.name = editedAction.name;
    item.prompt = editedAction.prompt;

    return editedAction;
  }

  async function removeAction({ uuid }) {
    await nexusaiAPI.router.actions.delete({
      projectUuid: connectProjectUuid.value,
      actionUuid: uuid,
    });

    actions.data = actions.data.filter((action) => action.uuid !== uuid);
  }

  const types = reactive({
    status: null,
    data: [],
  });

  const typesAvailable = computed(() => {
    return types.data.filter(
      (type) =>
        !actions.data.some(
          (action) =>
            action.name === type.name && action.prompt === type.prompt,
        ),
    );
  });

  async function loadTypes() {
    if (types.status !== null) {
      return;
    }

    try {
      types.status = 'loading';

      const data = await nexusaiAPI.router.actions.types.list({
        projectUuid: connectProjectUuid.value,
      });

      types.data = data;

      types.status = 'complete';
    } catch {
      types.status = 'error';
    }
  }

  return {
    actions,
    load: loadActions,
    add: addAction,
    edit: editAction,
    remove: removeAction,

    types,
    typesAvailable,
    loadTypes,
  };
});
