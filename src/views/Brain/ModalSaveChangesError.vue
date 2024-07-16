<template>
  <UnnnicModal
    scheme="aux-red-500"
    modalIcon="error"
    :text="$t('router.modal_save_changes_error.title')"
    class="modal-save-changes-error"
    @close="$emit('close')"
  >
    <p
      v-html="
        $tc(
          'router.modal_save_changes_error.description',
          $store.state.Brain.tabsWithError.length,
          {
            tabs,
          },
        )
      "
    />
  </UnnnicModal>
</template>

<script>
export default {
  emits: ['close'],
  computed: {
    tabs() {
      const tabs = this.$store.state.Brain.tabsWithError.map(
        (tab) => `<b>${this.$t(`router.tabs.${tab}`)}</b>`,
      );

      return [tabs.slice(0, -1).join(', '), tabs.at(-1)]
        .filter((i) => i)
        .join(this.$t('and'));
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-save-changes-error {
  :deep(.unnnic-modal-container-background-body-title) {
    padding-bottom: $unnnic-spacing-sm;
  }

  p {
    margin: 0;
  }
}
</style>
