<template>
  <section
    :style="{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
    }"
  >
    <UnnnicIntelligenceText
      tag="p"
      family="secondary"
      size="body-gt"
    >
      {{ $t('router.actions.description') }}
    </UnnnicIntelligenceText>

    <UnnnicDivider ySpacing="md" />

    <ContentList
      :items="items"
      shape="accordion"
      defaultIcon="bolt"
      hideSearchInput
      :description="
        items.data.length === 0
          ? $t('router.actions.create_new_action')
          : $t('router.actions.create_action')
      "
      :subDescription="$t('router.actions.pre_defined_or_customized_actions')"
      :addText="$t('router.actions.add')"
      @add="openActionGroupSelector"
      @edit="openEditAction"
      @remove="
        ($event) =>
          openDeleteAction($event.uuid, $event.created_file_name || '')
      "
    />

    <ModalActionTypeSelector
      v-if="isActionTypeSelectorOpen"
      v-model="isActionTypeSelectorOpen"
      v-model:actionGroup="actionGroup"
      @selected="openAddAction($event)"
    />

    <ModalActions
      v-if="isAddActionOpen"
      v-model="isAddActionOpen"
      :actionGroup="actionGroup"
      @added="saveAction"
      @previous-step="isActionTypeSelectorOpen = true"
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
import ContentList from '@/components/Brain/ContentBase/ContentList.vue';
import ModalActionTypeSelector from '@/components/actions/ModalActionTypeSelector.vue';
import ModalActions from '../../components/actions/ModalActions.vue';
import ModalChangeAction from '../../components/actions/ModalChangeAction.vue';
import ModalRemoveAction from '../../components/actions/ModalRemoveAction.vue';

export default {
  components: {
    ContentList,
    ModalActionTypeSelector,
    ModalActions,
    ModalChangeAction,
    ModalRemoveAction,
  },

  data() {
    return {
      isActionTypeSelectorOpen: false,
      actionGroup: '',

      isAddActionOpen: false,
      isAdding: false,

      currentActionEditing: null,
      modalDeleteAction: null,
      flowName: null,
    };
  },

  computed: {
    items() {
      return this.$store.state.Actions;
    },

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
    this.$store.dispatch('loadActions');
  },

  methods: {
    openActionGroupSelector() {
      this.actionGroup = '';

      this.isActionTypeSelectorOpen = true;
    },

    openAddAction() {
      this.isAddActionOpen = true;
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

    saveAction({ uuid, name, description, actionType }) {
      this.items.data.push({
        uuid,
        extension_file: 'action',
        created_file_name: name,
        description,
        actionType,
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
