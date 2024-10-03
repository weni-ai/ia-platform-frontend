<template>
  <section class="preview-document">
    <UnnnicIcon
      :icon="documentIcon"
      scheme="neutral-white"
      size="md"
    />
    <section class="preview-document__infos">
      <p class="infos__name">{{ document?.name }}</p>
      <section class="infos__technical">
        <p class="technical__extension">{{ documentExtension }}</p>
        <p class="technical__separator">•</p>
        <p class="technical__size">{{ documentSize }}</p>
      </section>
    </section>
  </section>
</template>

<script setup>
import { formatFileSize, getFileExtension } from '@/utils/medias';

const { document } = defineProps({
  document: {
    type: File,
    required: true,
  },
});

const mapIcons = {
  doc: 'article',
  docx: 'article',
  xls: 'table',
  xlsx: 'table',
  pdf: 'picture_as_pdf',
  txt: 'text_snippet',
};

const documentExtension = getFileExtension(document).replace('.', '');
const documentIcon = mapIcons[documentExtension];
const documentSize = formatFileSize(document.size);
</script>

<style scoped lang="scss">
.preview-document {
  padding: $unnnic-spacing-xs;

  display: flex;
  gap: $unnnic-spacing-ant;
  align-items: center;

  &__infos {
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

    overflow: hidden;

    .infos__name {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .infos__technical {
      display: flex;
      gap: $unnnic-spacing-nano;

      font-size: $unnnic-font-size-body-sm;
      text-transform: uppercase;
    }
  }
}
</style>
