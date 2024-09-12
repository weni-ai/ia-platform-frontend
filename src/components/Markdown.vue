<template>
  <section
    class="content-section"
    v-html="html"
  />
</template>

<script>
import DOMPurify from 'dompurify';
import { marked } from 'marked';

export default {
  props: {
    content: {
      type: String,
      default: '',
    },
  },

  computed: {
    html() {
      return DOMPurify.sanitize(marked.parse(this.content));
    },
  },
};
</script>

<style scoped>
.content-section {
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}
</style>
