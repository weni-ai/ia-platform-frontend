<template>
  <UnnnicModal
    :showModal="showModal"
    scheme="aux-yellow-500"
    modalIcon="warning"
    :text="title"
    :description="description"
    :closeIcon="false"
    class="modal-warn"
  >
    <template #message>
      <div v-html="message" />
    </template>
    <template #options>
      <UnnnicButton
        class="create-repository__container__button"
        type="tertiary"
        data-test="close-button"
        @click="$emit('close')"
      >
        {{ closeText }}
      </UnnnicButton>
      <UnnnicButton
        class="create-repository__container__button attention-button"
        type="attention"
        :loading="loading"
        data-test="action-button"
        @click="$emit('action')"
      >
        {{ actionText }}
      </UnnnicButton>
    </template>
  </UnnnicModal>
</template>

<script>
export default {
  props: {
    showModal: Boolean,
    loading: Boolean,
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    closeText: {
      type: String,
      required: true,
    },
    actionText: {
      type: String,
      required: true,
    },
  },

  emits: ['action', 'close'],
};
</script>

<style lang="scss" scoped>
.modal-warn
  :deep(.unnnic-modal-container-background-body-description-container) {
  padding-bottom: $unnnic-spacing-xs;
}
</style>
