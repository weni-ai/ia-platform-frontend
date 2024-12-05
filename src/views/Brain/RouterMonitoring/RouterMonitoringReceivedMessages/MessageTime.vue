<template>
  <p :title="formattedTitle">{{ formattedTime }}</p>
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

const formattedTime = computed(() => format(new Date(date), 'HH:mm'));
const formattedTitle = computed(
  () =>
    `${format(new Date(date), 'HH:mm')} | ${format(new Date(date), 'dd/MM/yyyy')}`,
);
</script>
