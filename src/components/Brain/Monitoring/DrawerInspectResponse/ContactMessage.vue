<template>
  <section
    data-testid="contact-message-container"
    class="inspect-response__contact"
  >
    <UnnnicIntelligenceText
      data-testid="contact-message-title"
      color="neutral-cloudy"
      family="secondary"
      size="body-gt"
      tag="p"
    >
      {{ $t('router.monitoring.inspect_response.contact_message') }}:
    </UnnnicIntelligenceText>
    <p
      data-testid="contact-message-text"
      class="contact__text"
    >
      “{{ text }}”
    </p>
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
