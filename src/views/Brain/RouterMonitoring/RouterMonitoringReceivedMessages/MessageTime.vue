<template>
  <p>{{ formattedTime }}</p>
</template>

<script setup>
import { computed } from 'vue';
import { format } from 'date-fns';

const { date } = defineProps({
  date: {
    type: String,
    required: true,
  },
});

const formattedTime = computed(
  () =>
    `${format(new Date(date), 'dd/MM/yyyy')}, ${format(new Date(date), 'HH:mm')}`,
);
</script>
