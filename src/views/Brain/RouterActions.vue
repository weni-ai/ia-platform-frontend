<template>
  <section class="actions__container">
    <BasesFormGenericList
      :items="items"
      shape="accordion"
      hideCounter
      hideToggle
      :title="$t('router.actions.title')"
      :description="$t('router.actions.description')"
      :addText="$t('router.actions.add')"
      canEditItem
      @add="isAddActionOpen = true"
      @edit="openEditAction"
      @remove="
        ($event) =>
          openDeleteAction($event.uuid, $event.created_file_name || '')
      "
    />

    <ModalActions
      v-if="isAddActionOpen"
      v-model="isAddActionOpen"
      :currentActions="items.data"
      @added="saveAction"
    />

    <ModalChangeAction
      v-if="isEditActionOpen"
      v-model="isEditActionOpen"
      :action="currentActionEditing"
      @edited="editedAction"
    />

    <ModalRemoveAction
      v-if="modalDeleteAction"
      :name="modalDeleteAction.name"
      :removing="modalDeleteAction.status === 'removing'"
      @close-modal="modalDeleteAction = null"
      @remove="removeAction"
    />
  </section>
</template>

<script>
import nexusaiAPI from '../../api/nexusaiAPI';
import BasesFormGenericList from '../repository/content/BasesFormGenericList.vue';
import ModalActions from '../../components/actions/ModalActions.vue';
import ModalChangeAction from '../../components/actions/ModalChangeAction.vue';
import ModalRemoveAction from '../../components/actions/ModalRemoveAction.vue';

export default {
  components: {
    BasesFormGenericList,
    ModalActions,
    ModalChangeAction,
    ModalRemoveAction,
  },
  props: {
    items: {
      type: Object,
      default() {
        return {};
      },
      required: false,
    },
  },

  data() {
    return {
      isAddActionOpen: false,
      isAdding: false,

      currentActionEditing: null,
      modalDeleteAction: null,
      flowName: null,
    };
  },

  computed: {
    isEditActionOpen: {
      get() {
        return Boolean(this.currentActionEditing);
      },

      set(value) {
        if (value === false) {
          this.currentActionEditing = null;
        }
      },
    },
  },

  created() {
    this.loadActions();
  },

  methods: {
    async loadActions() {
      if (this.items.status !== null) {
        return;
      }

      try {
        this.items.status = 'loading';

        const { data } = await nexusaiAPI.router.actions.list({
          projectUuid: this.$store.state.Auth.connectProjectUuid,
        });

        this.items.data = data.map((item) => ({
          uuid: item.uuid,
          extension_file: 'action',
          created_file_name: item.name,
          description: item.prompt,
          actionType: item.action_type,
        }));

        this.items.status = 'complete';
      } catch (error) {
        this.items.status = 'error';
      }
    },

    openEditAction({ uuid, created_file_name, description, actionType }) {
      this.currentActionEditing = {
        uuid,
        actionType,
        name: created_file_name,
        description,
        status: null,
      };
    },

    editedAction(actionUuid, action) {
      const item = this.items.data.find(({ uuid }) => uuid === actionUuid);

      item.created_file_name = action.name;
      item.description = action.description;
    },

    openDeleteAction(actionUuid, actionName) {
      this.modalDeleteAction = {
        uuid: actionUuid,
        name: actionName,
        status: null,
      };
    },

    async removeAction() {
      try {
        this.modalDeleteAction.status = 'removing';

        await nexusaiAPI.router.actions.delete({
          projectUuid: this.$store.state.Auth.connectProjectUuid,
          actionUuid: this.modalDeleteAction.uuid,
        });

        this.items.data = this.items.data.filter(
          ({ uuid }) => uuid !== this.modalDeleteAction.uuid,
        );

        this.$store.state.alert = {
          type: 'default',
          text: this.$t('router.actions.router_removed', {
            name: this.modalDeleteAction.name,
          }),
        };
      } finally {
        this.modalDeleteAction = null;
      }
    },

    saveAction({ uuid, name, description }) {
      this.items.data.push({
        uuid,
        extension_file: 'action',
        created_file_name: name,
        description,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.actions__container {
  margin-top: $unnnic-spacing-xs;
}
</style>
