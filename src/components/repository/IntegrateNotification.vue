<template>
  <UnnnicModal
    showModal
    :text="title"
    :scheme="type === 'success' ? 'feedback-green' : 'feedback-red'"
    :modalIcon="type === 'success' ? 'check-circle-1-1' : 'alert-circle-1'"
    @close="$emit('close')"
  >
    <template #message>
      <span v-html="message" />
    </template>
  </UnnnicModal>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  message: {
    type: String,
    required: true,
  },
});

defineEmits(['close']);
</script>
