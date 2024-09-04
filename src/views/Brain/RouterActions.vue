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
      :items="{
        status: items.status,
        data: items.data.map((action) => ({
          ...action,
          extension_file: 'action',
          created_file_name: action.name,
        })),
      }"
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
      @previous-step="isActionTypeSelectorOpen = true"
    />

    <ModalChangeAction
      v-if="isEditActionOpen"
      v-model="isEditActionOpen"
      :action="currentActionEditing"
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
import ContentList from '@/components/Brain/ContentBase/ContentList.vue';
import ModalActionTypeSelector from '@/components/actions/ModalActionTypeSelector.vue';
import ModalActions from '../../components/actions/ModalActions.vue';
import ModalChangeAction from '../../components/actions/ModalChangeAction.vue';
import ModalRemoveAction from '../../components/actions/ModalRemoveAction.vue';
import { useAlertStore } from '@/store/Alert.js';
import { useActionsStore } from '@/store/Actions.js';
import { onMounted, toRef, reactive } from 'vue';

export default {
  components: {
    ContentList,
    ModalActionTypeSelector,
    ModalActions,
    ModalChangeAction,
    ModalRemoveAction,
  },

  setup() {
    const alertStore = useAlertStore();
    const actionsStore = useActionsStore();

    onMounted(() => {
      actionsStore.load();
    });

    return {
      items: actionsStore.actions,

      alertStore,
      actionsStore,
    };
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

  methods: {
    openActionGroupSelector() {
      this.actionGroup = '';

      this.isActionTypeSelectorOpen = true;
    },

    openAddAction() {
      this.isAddActionOpen = true;
    },

    openEditAction({ uuid }) {
      const action = this.items.data.find((action) => action.uuid === uuid);

      this.currentActionEditing = {
        uuid,
        type: action.type,
        name: action.name,
        description: action.prompt,
        status: null,
      };
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

        await this.actionsStore.remove({
          uuid: this.modalDeleteAction.uuid,
        });

        this.alertStore.add({
          type: 'default',
          text: this.$t('router.actions.router_removed', {
            name: this.modalDeleteAction.name,
          }),
        });
      } finally {
        this.modalDeleteAction = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.actions__container {
  margin-top: $unnnic-spacing-xs;
}
</style>
