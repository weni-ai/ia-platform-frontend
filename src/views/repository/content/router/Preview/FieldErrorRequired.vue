<template>
  <p class="field-error">
    <UnnnicIcon
      class="field-error__icon"
      icon="warning"
      size="sm"
    />

    {{ $t('customization.invalid_field') }}
  </p>
</template>

<style lang="scss" scoped>
.field-error {
  margin-top: $unnnic-spacing-nano;

  display: flex;
  align-items: center;
  column-gap: $unnnic-spacing-nano;

  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-md;
  line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
  font-weight: $unnnic-font-weight-regular;

  &,
  & &__icon {
    color: $unnnic-color-aux-red-500;
  }
}
</style>
