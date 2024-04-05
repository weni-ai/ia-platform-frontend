<template>
  <section class="actions__container">
    <BasesFormGenericList
      shape="accordion"
      hideCounter
      hideToggle
      :title="'Fluxos'"
      :description="'o que é o router? no que ele agrega se eu ativar no fluxo?'"
      :addText="'Adicionar fluxo'"
      :items.sync="items"
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
      :saving="isAdding"
      @closeModal="isAddActionOpen = false"
      @save="saveAction"
    />

    <ModalChangeAction
      v-if="modalEditAction"
      :editing="modalEditAction.status === 'editing'"
      :description.sync="modalEditAction.description"
      @closeModal="modalEditAction = null"
      @edit="editAction"
    />

    <ModalRemoveAction
      v-if="modalDeleteAction"
      :name="modalDeleteAction.name"
      :removing="modalDeleteAction.status === 'removing'"
      @closeModal="modalDeleteAction = null"
      @remove="removeAction"
    />
  </section>
</template>

<script>
import nexusaiAPI from '../../../../api/nexusaiAPI';
import BasesFormGenericList from '../BasesFormGenericList.vue';
import ModalActions from '../../../../components/actions/ModalActions.vue';
import ModalChangeAction from '../../../../components/actions/ModalChangeAction.vue';
import ModalRemoveAction from '../../../../components/actions/ModalRemoveAction.vue';

export default {
  props: {
    items: Object,
  },

  components: {
    BasesFormGenericList,
    ModalActions,
    ModalChangeAction,
    ModalRemoveAction,
  },

  created() {
    this.loadActions();
  },

  data() {
    return {
      isAddActionOpen: false,
      isAdding: false,

      modalEditAction: null,
      modalDeleteAction: null,
    };
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
        }));

        this.items.status = 'complete';
      } catch (error) {
        this.items.status = 'error';
      }
    },

    openEditAction({ uuid, created_file_name, description }) {
      this.modalEditAction = {
        uuid,
        name: created_file_name,
        description,
        status: null,
      };
    },

    async editAction() {
      try {
        this.modalEditAction.status = 'editing';

        const { data } = await nexusaiAPI.router.actions.edit({
          projectUuid: this.$store.state.Auth.connectProjectUuid,
          actionUuid: this.modalEditAction.uuid,
          description: this.modalEditAction.description,
        });

        const item = this.items.data.find(
          ({ uuid }) => uuid === this.modalEditAction.uuid,
        );

        item.description = data.prompt;

        this.$store.state.alert = {
          type: 'success',
          text: this.$t('router.actions.router_edited', {
            name: this.modalEditAction.name,
          }),
        };
      } finally {
        this.modalEditAction = null;
      }
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

    async saveAction({
      flow: { uuid: flowUuid, name: flowName },
      description,
    }) {
      try {
        this.isAdding = true;

        const { data } = await nexusaiAPI.router.actions.create({
          projectUuid: this.$store.state.Auth.connectProjectUuid,
          flowUuid,
          name: flowName,
          description,
        });

        this.$store.state.alert = {
          type: 'success',
          text: this.$t('router.actions.router_activated', { name: flowName }),
        };

        this.items.data.push({
          uuid: data.uuid,
          extension_file: 'action',
          created_file_name: data.name,
          description: data.prompt,
        });
      } finally {
        this.isAddActionOpen = false;
        this.isAdding = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.actions__container {
  margin-top: $unnnic-spacing-xs;
}
</style>
