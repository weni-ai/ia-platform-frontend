<template>
  <div
    :class="[
      'files-area__container',
      `files-area__container--shape-${shape}`,
      {
        'files-area__container--active': isClientDragging,
      },
    ]"
    @dragover.prevent
    @drop.prevent="drop"
  >
    <input
      v-show="false"
      ref="browser-file-input"
      type="file"
      multiple
      @change="drop"
    />

    <div
      v-if="!filesData.length && shape !== 'accordion'"
      :class="['paste-area', { 'paste-area--active': isClientDragging }]"
    >
      <section>
        <UnnnicIntelligenceText
          tag="p"
          family="secondary"
          color="neutral-darkest"
          size="body-lg"
          weight="bold"
          marginBottom="ant"
        >
          {{ $t('content_bases.files.upload_content') }}
        </UnnnicIntelligenceText>

        <UnnnicIntelligenceText
          tag="p"
          family="secondary"
          color="neutral-cloudy"
          size="body-gt"
        >
          <span v-html="supportedFormats"></span>
        </UnnnicIntelligenceText>
      </section>

      <UnnnicButton
        size="small"
        type="primary"
        class="paste-area__button"
        @click="$refs['browser-file-input'].click()"
      >
        {{ $t('content_bases.files.browse_file') }}
      </UnnnicButton>
    </div>

    <ContentList
      v-else
      :items="files"
      :shape="shape"
      :description="$t('content_bases.files.description')"
      :subDescription="removeHTML(supportedFormats)"
      :addText="$t('content_bases.files.browse_file')"
      :isOverLap="isClientDragging"
      columns="2, 2fr"
      @add="$refs['browser-file-input'].click()"
      @remove="onRemove"
    />

    <UnnnicAlert
      v-if="alert"
      :key="alert.text"
      :style="{ zIndex: 1 }"
      :type="alert.type"
      :text="alert.text"
      @close="alert = null"
    ></UnnnicAlert>

    <UnnnicModal
      v-if="modalDeleteFile"
      :text="$t('content_bases.files.delete_file.title')"
      :closeIcon="false"
      class="delete-file-modal"
      persistent
      data-test="modal-remove-file"
    >
      <template #icon>
        <UnnnicIcon
          icon="error"
          size="md"
          scheme="aux-red-500"
        />
      </template>

      <template #message>
        <div
          v-html="
            $t('content_bases.files.delete_file.description', {
              name: modalDeleteFile.name,
            })
          "
        ></div>
      </template>
      <template #options>
        <UnnnicButton
          class="create-repository__container__button"
          type="tertiary"
          @click="modalDeleteFile = false"
        >
          {{ $t('content_bases.files.delete_file.cancel') }}
        </UnnnicButton>

        <UnnnicButton
          class="create-repository__container__button attention-button"
          type="warning"
          :loading="modalDeleteFile.status === 'deleting'"
          data-test="button-remove"
          @click="remove"
        >
          {{ $t('content_bases.files.delete_file.delete') }}
        </UnnnicButton>
      </template>
    </UnnnicModal>
  </div>
</template>

<script>
import nexusaiAPI from '@/api/nexusaiAPI';
import { get } from 'lodash';
import BasesFormFilesItem from '@/views/repository/content/BasesFormFilesItem.vue';
import ContentList from '@/components/Brain/ContentBase/ContentList.vue';
import { reactive, toValue } from 'vue';

const allowedFormats = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'];
const fileSizeLimitInMegabytes = 250;

export default {
  components: {
    BasesFormFilesItem,
    ContentList,
  },

  props: {
    files: {
      type: Object,
      required: true,
    },
    shape: {
      type: String,
      default: 'accordion',
    },
  },

  data() {
    return {
      alert: null,

      isClientDragging: false,
      leave: null,

      modalDeleteFile: null,
      filesBeingProcessedIndex: 0,

      events: {
        dragover: (event) => {
          event.preventDefault();

          clearTimeout(this.leave);

          this.isClientDragging = true;
        },

        dragleave: () => {
          clearTimeout(this.leave);

          this.leave = setTimeout(() => {
            this.isClientDragging = false;
          }, 100);
        },

        drop: () => {
          this.isClientDragging = false;
        },
      },
    };
  },

  computed: {
    supportedFormats() {
      const formats = allowedFormats.map((format) => `.${format}`);

      return this.$t('content_bases.files.sup_files', {
        suportedFormats: [formats.slice(0, -1).join(', '), formats.at(-1)].join(
          this.$t('and'),
        ),
        limitMB: fileSizeLimitInMegabytes,
      });
    },

    filesData() {
      return toValue(this.files.data);
    },

    contentBaseUuid() {
      return (
        this.$route.params.contentBaseUuid ||
        this.$store.state.router.contentBaseUuid
      );
    },
  },
  mounted() {
    Object.keys(this.events).forEach((eventName) => {
      window.addEventListener(eventName, this.events[eventName]);
    });
  },

  beforeUnmount() {
    Object.keys(this.events).forEach((eventName) => {
      window.removeEventListener(eventName, this.events[eventName]);
    });
  },

  methods: {
    removeHTML(string) {
      const span = document.createElement('span');
      span.innerHTML = string;
      return span.textContent;
    },

    drop(event) {
      const files =
        get(event, 'dataTransfer.files') || get(event, 'srcElement.files');

      if (!get(files, 'length', 0)) {
        return;
      }

      Object.values(files).forEach(this.addFile);

      const srcElement = get(event, 'srcElement');

      srcElement.value = '';
    },

    addFile(file) {
      const extension =
        file.name.lastIndexOf('.') === -1
          ? file.name
          : file.name.slice(file.name.lastIndexOf('.') + 1);

      const isNotAllowedFormat = !allowedFormats.includes(
        extension.toLowerCase(),
      );

      if (isNotAllowedFormat) {
        return (this.$store.state.alert = {
          type: 'error',
          text: this.$t('content_bases.files.unsupported_format'),
        });
      }

      const fileSizeInMegabytes = file.size / Math.pow(1024, 2);

      if (fileSizeInMegabytes > fileSizeLimitInMegabytes) {
        return (this.$store.state.alert = {
          type: 'error',
          text: this.$t('content_bases.files.exceeds_limit', {
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

      this.files.addItem(fileItem);

      fileItem.status = 'uploading';

      nexusaiAPI.intelligences.contentBases.files
        .create({
          contentBaseUuid: this.contentBaseUuid,
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
    },

    openDeleteFileModal(fileUuid, createdFileName, extensionFile) {
      const name = `${createdFileName || ''}.${extensionFile}`;

      this.modalDeleteFile = {
        uuid: fileUuid,
        name,
      };
    },

    onRemove($event) {
      if (['fail-upload'].includes($event.status)) {
        this.files.removeItem({ uuid: $event.uuid });
      } else {
        this.openDeleteFileModal(
          $event.uuid,
          $event.created_file_name || '',
          $event.extension_file || '',
        );
      }
    },

    remove() {
      this.modalDeleteFile.status = 'deleting';

      nexusaiAPI.intelligences.contentBases.files
        .delete({
          contentBaseUuid: this.contentBaseUuid,
          fileUuid: this.modalDeleteFile.uuid,
        })
        .then(() => {
          this.alert = {
            type: 'default',
            text: this.$t('content_bases.files.file_removed_from_base', {
              name: this.modalDeleteFile.name,
            }),
          };

          this.files.removeItem({ uuid: this.modalDeleteFile.uuid });

          this.modalDeleteFile = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.delete-file-modal {
  :deep(.unnnic-modal-container-background-body-description-container) {
    padding-bottom: $unnnic-spacing-xs;
  }

  :deep(.unnnic-modal-container-background-body__icon-slot) {
    display: flex;
    justify-content: center;
    margin-bottom: $unnnic-spacing-sm;
  }

  :deep(.unnnic-modal-container-background-body-title) {
    padding-bottom: $unnnic-spacing-sm;
  }

  :deep(.unnnic-modal-container-background-body) {
    padding-top: $unnnic-spacing-giant;
  }
}

.files-area {
  &__container {
    flex: 1;
    display: flex;
    flex-direction: column;

    &--active {
      outline-style: dashed;
      outline-color: $unnnic-color-neutral-cleanest;
      outline-width: $unnnic-border-width-thinner;
      outline-offset: -$unnnic-border-width-thinner;

      border-radius: $unnnic-border-radius-md;
    }

    &--shape-normal {
      height: 100%;
    }
  }
}

.paste-area {
  height: 100%;

  justify-content: center;
  outline-style: dashed;
  outline-color: $unnnic-color-neutral-cleanest;
  outline-width: $unnnic-border-width-thinner;
  outline-offset: -$unnnic-border-width-thinner;

  border-radius: $unnnic-border-radius-md;
  padding: $unnnic-spacing-xl $unnnic-spacing-sm;
  box-sizing: border-box;

  text-align: center;

  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-sm;

  flex: none;

  &--active {
    background-color: $unnnic-color-weni-50;
    outline-color: $unnnic-color-weni-500;
  }

  &:only-child {
    flex: 1;
  }

  &__button {
    width: 12.5 * $unnnic-font-size;
    margin: 0 auto;
  }
}
</style>
