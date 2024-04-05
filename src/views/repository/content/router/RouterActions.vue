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
      @load-more="$emit('load-more')"
      @add="isAddActionOpen = true"
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
import ModalRemoveAction from '../../../../components/actions/ModalRemoveAction.vue';

export default {
  props: {
    items: Object,
  },

  components: {
    BasesFormGenericList,
    ModalActions,
    ModalRemoveAction,
  },

  created() {
    this.loadActions();
  },

  data() {
    return {
      isAddActionOpen: false,
      isAdding: false,

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
