<template>
  <StartAddContent
    :description="$t('content_bases.files.description')"
    :subDescription="removeHTML(supportedFormats)"
    :textAddContent="$t('content_bases.files.browse_file')"
  />
</template>

<script setup>
import { computed } from 'vue';
import i18n from '@/utils/plugins/i18n';

import StartAddContent from './StartAddContent.vue';

const allowedFormats = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'];
const fileSizeLimitInMegabytes = 50;

function removeHTML(string) {
  const span = document.createElement('span');
  span.innerHTML = string;
  return span.textContent;
}

const supportedFormats = computed(() => {
  const formats = allowedFormats.map((format) => `.${format}`);

  return i18n.global.t('content_bases.files.sup_files', {
    suportedFormats: [formats.slice(0, -1).join(', '), formats.at(-1)].join(
      i18n.global.t('and'),
    ),
    limitMB: fileSizeLimitInMegabytes,
  });
});
</script>
