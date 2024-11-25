<template>
  <section class="improve-response">
    <section class="improve-response__actions">
      <UnnnicIntelligenceText
        color="neutral-cloudy"
        family="secondary"
        size="body-gt"
        tag="p"
      >
        {{ $t('router.monitoring.improve_response.title') }}
      </UnnnicIntelligenceText>

      <section class="actions__buttons">
        <UnnnicButton
          v-if="type === 'action'"
          size="small"
          :text="$t('router.monitoring.improve_response.edit_action')"
          type="secondary"
        />
        <UnnnicButton
          v-if="type === 'failed'"
          size="small"
          :text="$t('router.monitoring.improve_response.add_new_content')"
          type="secondary"
        />
        <UnnnicButton
          size="small"
          :text="$t('router.monitoring.improve_response.add_new_action')"
          type="secondary"
        />
      </section>
    </section>
  </section>
</template>

<script setup>
const props = defineProps({
  type: {
    required: true,
    validator: (value) => ['action', 'failed'].includes(value),
  },
});
</script>

<style scoped lang="scss">
.improve-response {
  &__actions {
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    border-radius: $unnnic-border-radius-sm;
    padding: $unnnic-spacing-sm;

    display: grid;
    gap: $unnnic-spacing-xs;

    .actions__buttons {
      display: grid;
      gap: $unnnic-spacing-nano;
    }
  }
}
</style>
