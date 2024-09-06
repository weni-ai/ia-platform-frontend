<template>
  <section class="preview-placeholder">
    <UnnnicIcon
      icon="chat"
      filled
      scheme="inherit"
      class="preview-placeholder__icon-chat"
    />

    <p class="preview-placeholder__description">
      {{ $t('router.preview.placeholder') }}
    </p>
  </section>
</template>

<style lang="scss" scoped>
.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  & &__icon-chat {
    $icon-size: 3.5 * $unnnic-font-size;

    color: $unnnic-color-neutral-soft;
    margin-bottom: $unnnic-spacing-nano;
    font-size: $icon-size;
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
