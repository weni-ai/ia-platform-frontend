<template>
  <section class="preview-placeholder">
    <img
      class="preview-placeholder__icon-chat"
      src="@/assets/icons/chat.svg"
      alt="chat"
    />

    <p class="preview-placeholder__description">
      {{ $t('router.preview.placeholder') }}
    </p>
  </section>
</template>

<style lang="scss" scoped>
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &__icon-chat {
    margin-bottom: $unnnic-spacing-nano;
  }

  &__description {
    max-width: 11.25 * $unnnic-font-size;

    text-align: center;
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-regular;
  }
}
</style>
