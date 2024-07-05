<template>
  <UnnnicModal
    showModal
    scheme="aux-red-500"
    modalIcon="error"
    :text="$t('modals.actions.remove.title')"
    :closeIcon="false"
    class="flow-modal"
  >
    <p v-html="$t('modals.actions.remove.description', { name })" />

    <template #options>
      <UnnnicButton
        type="tertiary"
        @click="$emit('closeModal')"
      >
        {{ $t('modals.actions.btn_cancel') }}
      </UnnnicButton>

      <UnnnicButton
        type="warning"
        :loading="removing"
        @click="$emit('remove')"
      >
        {{ $t('modals.actions.btn_complete') }}
      </UnnnicButton>
    </template>
  </UnnnicModal>
</template>

<script>
import ModalNext from '../ModalNext.vue';

export default {
  components: {
    ModalNext,
  },
  props: {
    name: String,
    removing: Boolean,
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.flow-modal {
  :deep(.unnnic-modal-container-background-body-title) {
    padding-bottom: $unnnic-spacing-sm;
  }

  :deep(.unnnic-modal-container-background-body-description-container) {
    padding-bottom: $unnnic-spacing-xs;
  }
}
</style>
