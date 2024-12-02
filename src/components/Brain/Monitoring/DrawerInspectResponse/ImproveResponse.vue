<template>
  <section class="improve-response">
    <header
      v-if="type === 'failed'"
      class="improve-response__header-failed"
      data-testid="header-failed"
    >
      <UnnnicIcon
        icon="cancel"
        scheme="aux-red-500"
        size="sm"
      />
      <UnnnicIntelligenceText
        color="aux-red-500"
        family="secondary"
        size="body-gt"
        tag="p"
      >
        {{ $t('router.monitoring.improve_response.agent_unable_respond') }}
      </UnnnicIntelligenceText>
    </header>
    <section
      :class="[
        'improve-response__actions',
        { 'improve-response__actions--with-header': type === 'failed' },
      ]"
    >
      <UnnnicIntelligenceText
        color="neutral-cloudy"
        family="secondary"
        size="body-gt"
        tag="p"
      >
        {{ $t('router.monitoring.improve_response.title') }}
      </UnnnicIntelligenceText>

      <section class="actions__buttons">
        <UnnnicButton
          v-if="actionToEdit"
          data-testid="edit-action-button"
          size="small"
          :text="
            $t('router.monitoring.improve_response.edit_action', {
              name: actionToEdit.name,
            })
          "
          type="secondary"
          @click="openEditModalAction"
        />
        <UnnnicButton
          v-else
          data-testid="add-content-button"
          size="small"
          :text="$t('router.monitoring.improve_response.add_new_content')"
          type="secondary"
          @click="isModalAddContentOpen = true"
        />
        <UnnnicButton
          data-testid="add-action-button"
          size="small"
          :text="$t('router.monitoring.improve_response.add_new_action')"
          type="secondary"
          @click="isModalAddActionOpen = true"
        />
      </section>
    </section>

    <ModalAddContent
      v-if="isModalAddContentOpen"
      v-model="isModalAddContentOpen"
      data-testid="modal-add-content"
    />

    <ModalActions
      v-if="isModalAddActionOpen"
      v-model="isModalAddActionOpen"
      data-testid="modal-add-action"
      actionGroup="custom"
      :actionToEditUuid="shouldEditAction ? actionToEdit?.uuid : undefined"
      @previous-step="isModalAddActionOpen = false"
    />
  </section>
</template>

<script setup>
import ModalAddContent from '../ModalAddContent/index.vue';

import { computed, onMounted, ref, watch } from 'vue';
import { useMonitoringStore } from '@/store/Monitoring';
import { useActionsStore } from '@/store/Actions';

import ModalActions from '@/components/actions/ModalActions.vue';

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['action', 'failed', 'success'].includes(value),
  },
});

const monitoringStore = useMonitoringStore();
const actionsStore = useActionsStore();

const actionToEdit = computed(
  () => monitoringStore.messages.inspectedAnswer?.action,
);

const isModalAddContentOpen = ref(false);
const isModalAddActionOpen = ref(false);
const shouldEditAction = ref(false);

function openEditModalAction() {
  isModalAddActionOpen.value = true;
  shouldEditAction.value = true;
}

watch(isModalAddActionOpen, (newIsModalAddActionOpen) => {
  if (!newIsModalAddActionOpen) {
    shouldEditAction.value = false;
  }
});

onMounted(() => {
  if (actionsStore.actions.status !== 'complete') {
    actionsStore.load();
  }
});
</script>

<style scoped lang="scss">
.improve-response {
  &__header-failed {
    border-radius: $unnnic-border-radius-sm $unnnic-border-radius-sm 0 0;

    padding: $unnnic-spacing-sm;

    background-color: $unnnic-color-aux-red-100;

    display: flex;
    gap: $unnnic-spacing-xs;
    align-items: center;
  }

  &__actions {
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    border-radius: $unnnic-border-radius-sm;
    padding: $unnnic-spacing-sm;

    display: grid;
    gap: $unnnic-spacing-xs;

    &--with-header {
      border-radius: 0 0 $unnnic-border-radius-sm $unnnic-border-radius-sm;
      border-top: none;
    }

    .actions__buttons {
      display: grid;
      gap: $unnnic-spacing-nano;
    }
  }
}
</style>
