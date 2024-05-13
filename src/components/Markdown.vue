<template>
  <section v-html="html" />
</template>

<script>
import DOMPurify from 'dompurify';
import { marked } from 'marked';

export default {
  props: {
    content: String,
  },

  computed: {
    html() {
      return DOMPurify.sanitize(marked.parse(this.content));
    },
  },
};
</script>
