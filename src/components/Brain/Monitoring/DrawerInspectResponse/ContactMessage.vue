<template>
  <section class="inspect-response__contact">
    <UnnnicIntelligenceText
      color="neutral-cloudy"
      family="secondary"
      size="body-gt"
      tag="p"
    >
      {{ $t('router.monitoring.inspect_response.contact_message') }}:
    </UnnnicIntelligenceText>
    <p class="contact__text">“{{ text }}”</p>
  </section>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true,
  },
});
</script>
