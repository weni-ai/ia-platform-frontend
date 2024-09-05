<template>
  <section class="message-input__container">
    <input
      v-model="modelValue"
      :placeholder="placeholder"
      type="text"
      class="message-input"
      @keypress.enter="$emit('send')"
    />

    <UnnnicIcon
      class="message-input__send-button"
      icon="send"
      filled
      size="md"
      scheme="weni-600"
      clickable
      @click="$emit('send')"
    />
  </section>
</template>

<script setup>
const modelValue = defineModel('modelValue', {
  type: String,
  required: true,
});

defineProps({
  placeholder: {
    type: String,
    default: '',
  },
});

defineEmits(['send']);
</script>

<style lang="scss" scoped>
.message-input {
  $input-inside-height: $unnnic-icon-size-md;

  flex: 1;
  padding: $unnnic-spacing-sm - $unnnic-border-width-thinner;
  padding-right: $unnnic-spacing-sm + $unnnic-icon-size-md + $unnnic-spacing-xs -
    $unnnic-border-width-thinner;

  height: $input-inside-height;

  color: $unnnic-color-neutral-darkest;
  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-regular;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  outline: none;

  border-radius: $unnnic-border-radius-md;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-clean;

  &::placeholder {
    color: $unnnic-color-neutral-clean;
  }

  &:focus {
    border-color: $unnnic-color-weni-600;
  }

  &__container {
    position: relative;
    display: flex;
  }

  &__send-button {
    top: 50%;
    margin-top: - calc($unnnic-icon-size-md / 2);
    user-select: none;
    position: absolute;
    right: $unnnic-spacing-sm;
  }
}
</style>
