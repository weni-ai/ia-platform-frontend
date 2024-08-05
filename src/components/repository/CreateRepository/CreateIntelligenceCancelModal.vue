<template>
  <UnnnicModal
    class="modal-cancel-create-intelligence"
    showModal
    :text="$t('webapp.create_repository.modal_title')"
    scheme="aux-yellow-500"
    modalIcon="warning"
    :closeIcon="false"
    @close="$emit('close')"
  >
    <template #message>
      <span v-html="$t('webapp.create_repository.modal_description')" />
    </template>
    <template #options>
      <UnnnicButton
        type="tertiary"
        data-test="cancel-button"
        @click="$emit('close')"
      >
        {{ $t('webapp.create_repository.modal_continue_button') }}
      </UnnnicButton>

      <UnnnicButton
        type="attention"
        data-test="cancel-create-button"
        @click="$emit('cancelCreateIntelligence')"
      >
        {{ $t('webapp.create_repository.modal_exit_button') }}
      </UnnnicButton>
    </template>
  </UnnnicModal>
</template>

<script setup>
defineEmits(['close', 'cancelCreateIntelligence']);
</script>

<style lang="scss" scoped>
.modal-cancel-create-intelligence {
  :deep(.unnnic-modal-container-background-body) {
    padding-top: $unnnic-spacing-xs;
  }

  :deep(.unnnic-modal-container-background-body-description-container) {
    padding-bottom: $unnnic-spacing-sm;
  }
}
</style>
