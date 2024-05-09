<template>
  <UnnnicModal
    scheme="aux-yellow-500"
    :text="$t('router.preview.modal_qr_code.title')"
    class="modal-preview-qr-code"
    @close="$emit('close')"
  >
    {{ $t('router.preview.modal_qr_code.description') }}

    <QRCode
      size="380"
      renderAs="svg"
      level="M"
      :value="previewFullPageURL"
      class="modal-preview-qr-code__qr-code"
    />
  </UnnnicModal>
</template>

<script>
import QRCode from 'qrcode.vue';

export default {
  components: {
    QRCode,
  },

  computed: {
    previewFullPageURL() {
      return (
        location.origin +
        this.$router.resolve({
          name: 'brain-preview-full-page',
          query: {
            project_uuid: this.$store.state.Auth.connectProjectUuid,
            token: this.$store.state.Auth.token.replace('Bearer ', ''),
          },
        }).href
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.modal-preview-qr-code {
  :deep(.unnnic-modal-container-background-body-title) {
    padding-bottom: $unnnic-spacing-sm;
  }

  &__qr-code {
    display: inline-block;
    margin-top: $unnnic-spacing-md;
    padding: $unnnic-spacing-ant;
    margin-inline: auto;
    border-radius: $unnnic-border-radius-md;

    outline-style: solid;
    outline-color: $unnnic-color-neutral-cleanest;
    outline-width: $unnnic-border-width-thinner;
    outline-offset: -$unnnic-border-width-thinner;
  }
}
</style>
