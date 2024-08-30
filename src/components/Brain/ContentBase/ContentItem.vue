<template>
  <UnnnicToolTip
    side="top"
    :text="failureMessage"
    :enabled="isFailed"
    @click="$emit('click')"
  >
    <section
      :class="[
        'files-list__content__file',
        `files-list__content__file--status-${
          file.status === 'fail-upload' ? 'fail' : file.status
        }`,
        {
          'files-list__content__file--compressed': compressed,
          'files-list__content__file--clickable': clickable,
        },
      ]"
    >
      <section class="files-list__content__file__icon">
        <UnnnicAvatarIcon
          :icon="isFailed ? 'warning' : icon"
          class="files-list__content__file__icon__itself"
          :size="compressed ? 'sm' : 'nano'"
          :scheme="iconScheme"
          data-test="item-icon"
        />
      </section>

      <header class="files-list__content__file__content">
        <UnnnicToolTip
          side="top"
          :text="fileName"
          :enabled="!isFailed"
        >
          <p
            class="files-list__content__file__content__title"
            data-test="name"
          >
            {{ fileName }}
          </p>

          <p
            v-if="extension === 'action'"
            class="files-list__content__file__content__sub_title"
          >
            {{ $t(`action_type_selector.types.${actionDetails.group}.title`) }}
          </p>

          <p
            v-else
            class="files-list__content__file__content__sub_title"
          >
            {{
              file.status === 'uploading'
                ? $t('content_bases.files.status.uploading')
                : timeAgo
            }}
          </p>
        </UnnnicToolTip>
      </header>

      <section class="files-list__content__file__actions">
        <UnnnicIcon
          v-if="downloading || isProcessing"
          icon="progress_activity"
          size="sm"
          scheme="neutral-cloudy"
          class="files-list__content__file__actions__loading"
        />

        <UnnnicIcon
          v-if="extension === 'action'"
          icon="delete"
          size="sm"
          class="files-list__content__file__actions__icon"
          clickable
          data-test="action-remove"
          @click.stop="$emit('remove')"
        />

        <ContentItemActions
          v-else-if="actions.length"
          data-test="dropdown-actions"
          :actions="actions"
        />
      </section>
    </section>
  </UnnnicToolTip>

  <FilePreview
    v-if="modalPreview"
    v-bind="modalPreview"
    modelValue
    @update:model-value="modalPreview = null"
  />
</template>

<script>
import nexusaiAPI from '@/api/nexusaiAPI';
import FilePreview from '@/views/ContentBases/components/FilePreview.vue';
import ContentItemActions from '@/views/repository/content/ContentItemActions.vue';
import { actionInfo, createDownloadAnchor } from '@/utils';
import i18n from '@/utils/plugins/i18n.js';

export default {
  components: {
    FilePreview,
    ContentItemActions,
  },

  props: {
    file: Object,
    compressed: Boolean,
    clickable: Boolean,
  },

  emits: ['click', 'remove'],

  data() {
    return {
      downloading: false,

      modalPreview: null,
    };
  },

  computed: {
    actions() {
      if (this.extension === 'action') {
        return [];
      }

      const can = {
        seeDetails: this.file.status === 'uploaded',

        accessSite:
          this.file.extension_file === 'site' &&
          this.file.status === 'uploaded',

        downloadFile:
          this.file.extension_file !== 'site' &&
          this.file.status === 'uploaded',

        remove:
          ['fail-upload', 'fail'].includes(this.file.status) ||
          !this.file.uuid.startsWith('temp-'),
      };

      const actions = [];

      if (can.seeDetails) {
        actions.push({
          scheme: 'neutral-dark',
          icon: 'info',
          text: this.$t('content_bases.actions.see_details'),
          onClick: this.preview,
        });
      }

      if (can.downloadFile) {
        actions.push({
          scheme: 'neutral-dark',
          icon: 'download',
          text: this.$t('content_bases.actions.download_file'),
          onClick: this.download,
        });
      }

      if (can.accessSite) {
        actions.push({
          scheme: 'neutral-dark',
          icon: 'open_in_new',
          text: this.$t('content_bases.actions.access_site'),
          onClick: () => window.open(this.fileName),
        });
      }

      if (can.remove) {
        actions.push({
          scheme: 'aux-red-500',
          icon: 'delete',
          text:
            this.extension === 'site'
              ? this.$t('content_bases.actions.remove_site')
              : this.$t('content_bases.actions.remove_file'),
          onClick: () => this.$emit('remove'),
        });
      }

      return actions;
    },

    fileName() {
      if (['site', 'action'].includes(this.file.extension_file)) {
        return this.file?.created_file_name;
      }

      return `${this.file?.created_file_name || ''}.${
        this.file?.extension_file
      }`;
    },

    timeAgo() {
      return this.formatTimeAgo(this.file.created_at);
    },

    extension() {
      if (['site', 'action'].includes(this.file.extension_file)) {
        return this.file.extension_file;
      }

      return this.fileName.lastIndexOf('.') === -1
        ? this.fileName
        : this.fileName.slice(this.fileName.lastIndexOf('.') + 1);
    },

    failureMessage() {
      const message =
        { site: 'site_with_error' }[this.extension] || 'file_with_error';

      return this.$t(`content_bases.${message}`);
    },

    actionDetails() {
      return actionInfo(this.$store.state.Actions.types.data, {
        name: this.file.created_file_name,
        prompt: this.file.description,
        type: this.file.actionType,
      });
    },

    icon() {
      if (this.extension === 'action') {
        return this.actionDetails?.icon;
      }

      return (
        {
          pdf: 'picture_as_pdf',
          txt: 'text_snippet',
          xls: 'table',
          xlsx: 'table',
          doc: 'draft',
          docx: 'draft',
          site: 'globe',
        }[this.extension] || 'draft'
      );
    },

    isFailed() {
      return ['fail', 'fail-upload'].includes(this.file.status);
    },

    isProcessing() {
      return ['uploading', 'processing'].includes(this.file.status);
    },

    iconScheme() {
      if (this.isFailed) {
        return 'feedback-red';
      }

      return 'weni-600';
    },
  },

  methods: {
    async download() {
      try {
        this.downloading = true;

        const { data } =
          await nexusaiAPI.intelligences.contentBases.files.download({
            file_name: this.file.file_name,
            fileUuid: this.file.uuid,
          });

        const a = createDownloadAnchor({
          name: this.fileName,
          href: data.file,
        });

        a.click();
      } finally {
        this.downloading = false;
      }
    },

    formatTimeAgo(dateString) {
      if (!dateString) {
        return i18n.global.t('content_bases.files.status.uploading');
      }

      const now = new Date();
      const createdAt = new Date(dateString);

      if (isNaN(createdAt.getTime())) {
        return i18n.global.t('content_bases.files.status.uploading');
      }

      const diffInMinutes = Math.floor((now - createdAt) / 1000 / 60);

      if (diffInMinutes < 60) {
        return i18n.global.t('content_bases.time_ago_minutes', {
          minutes: diffInMinutes,
        });
      }

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return i18n.global.t('content_bases.time_ago_hours', {
          hours: diffInHours,
        });
      }

      const diffInDays = Math.floor(diffInHours / 24);
      return i18n.global.t('content_bases.time_ago_days', {
        days: diffInDays,
      });
    },

    async preview() {
      this.modalPreview = {
        type: this.extension === 'site' ? 'site' : 'file',
        projectUuid: this.$store.state.Auth.connectProjectUuid,
        contentBaseUuid:
          this.$store.state.router.contentBaseUuid ||
          this.$route.params.contentBaseUuid,
        fileUuid: this.file.uuid,
        name: this.fileName,
        createdAt: this.file.created_at,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.files-list__content__file {
  outline-style: solid;
  outline-color: $unnnic-color-neutral-cleanest;
  outline-width: $unnnic-border-width-thinner;
  outline-offset: -$unnnic-border-width-thinner;

  background-color: $unnnic-color-background-white;

  border-radius: $unnnic-border-radius-sm;

  padding: $unnnic-spacing-ant;
  display: flex;
  column-gap: $unnnic-spacing-ant;
  align-items: center;
  position: relative;

  p {
    margin: 0;
  }

  &--compressed {
    column-gap: $unnnic-spacing-xs;

    :has(.files-list__content__file__content__status) {
      margin-block: -(calc($unnnic-spacing-nano / 2));
    }

    .files-list__content__file__icon {
      padding: 0;

      :deep(.unnnic-avatar-icon) {
        background-color: $unnnic-color-weni-100;
      }
    }

    .files-list__content__file__content__status {
      margin-top: -$unnnic-spacing-nano;
      font-size: $unnnic-font-size-body-sm;
      line-height: $unnnic-font-size-body-sm + $unnnic-line-height-md;
    }
  }

  &--clickable {
    cursor: pointer;
  }

  &--status-fail {
    outline-color: $unnnic-color-aux-red-500;
    background-color: $unnnic-color-aux-red-100;
    color: $unnnic-color-aux-red-500;

    .files-list__content__file__icon {
      background-color: inherit;
    }

    .files-list__content__file__icon__itself,
    .files-list__content__file__content__title,
    .files-list__content__file__actions__icon,
    .files-list__content__file__actions__loading {
      color: inherit;
    }
  }

  &__icon {
    display: flex;
    border-radius: $unnnic-border-radius-sm;
    padding: 0.6875 * $unnnic-font-size;

    &__itself {
      color: $unnnic-color-neutral-clean;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 0;

    &__title {
      color: $unnnic-color-neutral-dark;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-regular;

      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    &__sub_title {
      overflow: hidden;
      color: $unnnic-color-neutral-clean;
      text-overflow: ellipsis;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-md;
      font-weight: $unnnic-font-weight-regular;
    }
  }

  &__actions {
    display: flex;
    column-gap: $unnnic-spacing-xs;
    margin-left: auto;

    &__icon {
      cursor: pointer;
      color: $unnnic-color-neutral-cloudy;
      user-select: none;
      margin-right: $unnnic-spacing-xs;
    }

    &__loading {
      user-select: none;

      animation: spinning 2s infinite ease;

      @keyframes spinning {
        0% {
          transform: rotate(0);
        }

        100% {
          transform: rotate(360deg);
        }
      }
    }
  }
}
</style>
