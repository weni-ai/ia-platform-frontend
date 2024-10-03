<template>
  <section class="message-input__container">
    <section :class="['message-input__action', 'message-input__attach_media']">
      <ContentItemActions
        triggerIcon="add"
        triggerSize="md"
        popoverPositionHorizontal="left-left"
        :actions="attachActions"
      />

      <input
        v-show="false"
        ref="file"
        type="file"
        :accept="currentAllowedMediaFormats"
        @change="handleFileChange"
      />
    </section>

    <input
      :value="typeof modelValue === 'string' ? modelValue : ''"
      :placeholder="placeholder"
      type="text"
      class="message-input"
      @input="updateModelValue($event.target.value)"
      @keypress.enter="emitSend"
    />

    <UnnnicIcon
      :class="['message-input__action', 'message-input__send-button']"
      icon="send"
      filled
      size="md"
      scheme="weni-600"
      clickable
      @click="emitSend"
    />
  </section>
</template>

<script setup>
import { nextTick, ref, useTemplateRef } from 'vue';
import { useStore } from 'vuex';

import ContentItemActions from '@/views/repository/content/ContentItemActions.vue';

import i18n from '@/utils/plugins/i18n.js';
import { allowedMediaFormats, getFileType } from '@/utils/medias';

const props = defineProps({
  placeholder: {
    type: String,
    default: '',
  },
});

const modelValue = defineModel('modelValue', {
  type: [String, File],
  required: true,
});

const emit = defineEmits(['send', 'update:model-value']);
const store = useStore();

const inputFile = useTemplateRef('file');
const currentAllowedMediaFormats = ref('');

const attachActions = [
  {
    scheme: 'neutral-dark',
    icon: 'image',
    text: i18n.global.t(
      'webapp.home.bases.preview_tests_attachments.photos_or_videos',
    ),
    onClick: () => openFileSelection('photo_and_video'),
  },
  {
    scheme: 'neutral-dark',
    icon: 'attach_file',
    text: i18n.global.t('webapp.home.bases.preview_tests_attachments.file'),
    onClick: () => openFileSelection('document'),
  },
  {
    scheme: 'neutral-dark',
    icon: 'location_on',
    text: i18n.global.t('webapp.home.bases.preview_tests_attachments.location'),
    onClick: () => getGeolocalization(),
  },
];

function openFileSelection(type) {
  const mapTypes = {
    photo_and_video: allowedMediaFormats.image.concat(
      allowedMediaFormats.video,
    ),
    document: allowedMediaFormats.document,
  };
  if (mapTypes[type]?.length) {
    currentAllowedMediaFormats.value = mapTypes[type];
    nextTick(() => inputFile.value.click());
  }
}

function getGeolocalization() {
  if (!('geolocation' in navigator)) {
    return handleGeolocationError();
  }

  navigator.geolocation.getCurrentPosition(
    (position) => handleGeolocationSuccess(position),
    handleGeolocationError,
  );
}
function handleGeolocationSuccess(position) {
  const coords = `${position.coords.latitude},${position.coords.longitude}`;
  updateModelValue(coords);
  nextTick(emitSend);
}
function handleGeolocationError() {
  const mockCoords = '-9.6695958,-35.7209979';
  updateModelValue(mockCoords);
  nextTick(emitSend);
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileType = getFileType(file);
  if (!fileType) {
    store.state.alert = {
      type: 'error',
      text: i18n.global.t('content_bases.files.unsupported_format'),
    };
    return;
  }

  updateModelValue(file);
  nextTick(emitSend);
}

function updateModelValue(value) {
  emit('update:model-value', value);
}

function emitSend() {
  emit('send');
}
</script>

<style lang="scss" scoped>
.message-input {
  $input-inside-height: $unnnic-icon-size-md;
  $input-horizontal-padding: $unnnic-spacing-sm + $unnnic-icon-size-md +
    $unnnic-spacing-xs - $unnnic-border-width-thinner;

  flex: 1;
  padding: $unnnic-spacing-sm - $unnnic-border-width-thinner;
  padding-right: $input-horizontal-padding;
  padding-left: $input-horizontal-padding;

  height: $input-inside-height;

  color: $unnnic-color-neutral-darkest;
  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-regular;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  outline: none;

  border-radius: $unnnic-border-radius-md;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-cleanest;

  &::placeholder {
    color: $unnnic-color-neutral-clean;
  }

  &:focus {
    border-color: $unnnic-color-weni-600;
  }

  &__container {
    position: relative;
    display: flex;
  }

  &__action {
    top: 50%;
    margin-top: - calc($unnnic-icon-size-md / 2);
    user-select: none;
    position: absolute;
  }

  &__attach_media {
    left: $unnnic-spacing-sm;
  }

  &__send-button {
    right: $unnnic-spacing-sm;
  }
}
</style>
