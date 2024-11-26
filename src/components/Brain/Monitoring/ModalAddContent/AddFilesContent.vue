<template>
  <section class="add-files-content">
    <section
      v-if="files.data.length"
      class="add-files-content__files"
    >
      <ContentItem
        v-for="file in files.data"
        :key="file.uuid"
        :file="file"
        :compressed="true"
        :clickable="true"
        @remove="remove(file)"
      />
    </section>
    <template v-else>
      <input
        v-show="false"
        ref="browser-file-input"
        type="file"
        :accept="allowedFormats"
        multiple
        @change="inputFile"
      />
      <StartAddContent
        :description="$t('content_bases.files.description')"
        :subDescription="removeHTML(supportedFormats)"
        :textAddContent="$t('content_bases.files.browse_file')"
        @add="$refs['browser-file-input'].click()"
      />
    </template>
  </section>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import { useStore } from 'vuex';
import { get } from 'lodash';

import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';
import { allowedMediaFormats, fileSizeLimitInMegabytes } from '@/utils/medias';

import StartAddContent from './StartAddContent.vue';
import ContentItem from '../../ContentBase/ContentItem.vue';
import { useFilesPagination } from '@/views/ContentBases/filesPagination';

const emit = defineEmits(['update:model-value']);

const store = useStore();
const contentBaseUuid = computed(() => store.state.router.contentBaseUuid);
const allowedFormats = allowedMediaFormats.document;
const files = reactive(
  useFilesPagination({
    contentBaseUuid: contentBaseUuid.value,
  }),
);

watch(files.data, (newFilesData) => {
  console.log('newFilesData', newFilesData);

  emit('update:model-value', newFilesData);
});

function removeHTML(string) {
  const span = document.createElement('span');
  span.innerHTML = string;
  return span.textContent;
}

const supportedFormats = computed(() => {
  return i18n.global.t('content_bases.files.sup_files', {
    suportedFormats: [
      allowedFormats.slice(0, -1).join(', '),
      allowedFormats.at(-1),
    ].join(i18n.global.t('and')),
    limitMB: fileSizeLimitInMegabytes,
  });
});

function inputFile(event) {
  const files =
    get(event, 'dataTransfer.files') || get(event, 'srcElement.files');

  if (!get(files, 'length', 0)) {
    return;
  }

  Object.values(files).forEach(addFile);

  const srcElement = get(event, 'srcElement');

  srcElement.value = '';
}

function addFile(file) {
  const extension =
    file.name.lastIndexOf('.') === -1
      ? file.name
      : file.name.slice(file.name.lastIndexOf('.') + 1);

  const isNotAllowedFormat = !allowedFormats.includes(
    `.${extension}`.toLowerCase(),
  );

  if (isNotAllowedFormat) {
    return (store.state.alert = {
      type: 'error',
      text: i18n.global.t('content_bases.files.unsupported_format'),
    });
  }

  const fileSizeInMegabytes = file.size / Math.pow(1024, 2);

  if (fileSizeInMegabytes > fileSizeLimitInMegabytes) {
    return (store.state.alert = {
      type: 'error',
      text: i18n.global.t('content_bases.files.exceeds_limit', {
        limitMB: fileSizeLimitInMegabytes,
      }),
    });
  }

  const fileItem = reactive({
    uuid: `temp-${Math.floor(Math.random() * 1e9)}`,
    file: file.name,
    created_file_name:
      extension !== file.name
        ? file.name.slice(0, -extension.length - 1)
        : file.name,
    extension_file: extension,
    status: 'waiting',
    progress: 0,
    file_name: file.name,
  });

  files.addItem(fileItem);

  fileItem.status = 'uploading';

  nexusaiAPI.intelligences.contentBases.files
    .create({
      contentBaseUuid: contentBaseUuid.value,
      file,
      extension_file: extension,

      onUploadProgress: (event) => {
        fileItem.progress = event.loaded / event.total;
      },
    })
    .then(({ data }) => {
      fileItem.uuid = data.uuid;
      fileItem.extension_file = data.extension_file;
      fileItem.progress = 0;
      fileItem.status = 'processing';
    })
    .catch(() => {
      fileItem.status = 'fail-upload';
      fileItem.file_name = file.name;
    });
}

function remove(file) {
  nexusaiAPI.intelligences.contentBases.files
    .delete({
      contentBaseUuid: contentBaseUuid.value,
      fileUuid: file.uuid,
    })
    .then(() => {
      this.alert = {
        type: 'default',
        text: i18n.global.t('content_bases.files.file_removed_from_base', {
          name: file.name,
        }),
      };

      files.removeItem({ uuid: file.uuid });
    });
}
</script>

<style scoped lang="scss">
.add-files-content {
  height: 100%;

  display: flex;
  justify-content: center;

  &__files {
    width: 100%;

    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-xs;
  }
}
</style>
