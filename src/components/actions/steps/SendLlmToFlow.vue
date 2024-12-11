<template>
  <section class="send-llm-response">
    <UnnnicCheckbox
      :modelValue="modelValue"
      class="send-llm-response__checkbox"
      :textRight="
        $t(
          'modals.actions.add.steps.select_action_type.send_response_to_flow.title',
        )
      "
      size="md"
      @update:model-value="$emit('update:model-value', $event)"
    />

    <UnnnicToolTip
      class="send-llm-response__tooltip"
      side="top"
      :text="
        $t(
          'modals.actions.add.steps.select_action_type.send_response_to_flow.tooltip',
        )
      "
      enabled
      maxWidth="15rem"
    >
      <UnnnicIcon
        class="tooltip__icon"
        icon="info"
        size="sm"
        scheme="neutral-cleanest"
        filled
      />
    </UnnnicToolTip>
  </section>
</template>

<script setup>
defineEmits(['update:model-value']);

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.send-llm-response {
  display: flex;
  gap: $unnnic-spacing-nano;
  align-items: center;

  .send-llm-response__checkbox {
    padding: $unnnic-spacing-nano;
  }

  .send-llm-response__tooltip .tooltip__icon {
    display: flex;
    cursor: default;
  }
}
</style>
