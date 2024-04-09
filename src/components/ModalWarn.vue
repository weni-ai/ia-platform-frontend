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
    <UnnnicButton
      slot="options"
      class="create-repository__container__button"
      type="tertiary"
      @click="$emit('close')"
    >
      {{ closeText }}
    </UnnnicButton>

    <UnnnicButton
      slot="options"
      class="create-repository__container__button attention-button"
      type="attention"
      :loading="loading"
      @click="$emit('action')"
    >
      {{ actionText }}
    </UnnnicButton>
  </UnnnicModal>
</template>

<script>
export default {
  props: {
    showModal: Boolean,
    loading: Boolean,
    title: String,
    description: String,
    closeText: String,
    actionText: String,
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.modal-warn
  ::v-deep
  .unnnic-modal-container-background-body-description-container {
  padding-bottom: $unnnic-spacing-xs;
}
</style>
