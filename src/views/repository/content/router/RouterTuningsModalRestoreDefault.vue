<template>
  <UnnnicModal
    :showModal="showModal"
    scheme="aux-yellow-500"
    modalIcon="warning"
    :text="$t('router.tunings.restore_default_modal.title')"
    :description="$t('router.tunings.restore_default_modal.description')"
    :closeIcon="false"
    class="restore-default-modal"
  >
    <UnnnicButton
      slot="options"
      class="create-repository__container__button"
      type="tertiary"
      @click="$emit('close')"
    >
      {{ $t('router.tunings.restore_default_modal.cancel') }}
    </UnnnicButton>

    <UnnnicButton
      slot="options"
      class="create-repository__container__button attention-button"
      type="attention"
      :loading="restoring"
      @click="$emit('restore')"
    >
      {{ $t('router.tunings.restore_default_modal.restore') }}
    </UnnnicButton>
  </UnnnicModal>
</template>

<script>
export default {
  props: {
    showModal: Boolean,
    restoring: Boolean,
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.restore-default-modal
  ::v-deep
  .unnnic-modal-container-background-body-description-container {
  padding-bottom: $unnnic-spacing-xs;
}
</style>
