<template>
  <section>
    <h1>Changes History</h1>
    <UnnnicTableNext
      v-model:pagination="pagination"
      :headers="table.headers"
      :rows="table.rows"
      :paginationTotal="125"
      :paginationInterval="5"
    />
  </section>
</template>

<script setup>
import { ref } from 'vue';

const pagination = ref(1);

const table = ref({
  headers: [{ content: 'Alterações', size: 6 }, { content: 'Data' }],
  rows: [
    {
      content: ['1', 'Alice'],
    },
    {
      content: ['2', 'Bob'],
    },
    {
      content: ['3', 'Charlie'],
    },
    {
      content: ['4', 'Diana'],
    },
    {
      content: ['5', 'Ethan'],
    },
  ],
});
</script>

<style scoped></style>
