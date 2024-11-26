<template>
  <UnnnicModalDialog
    :modelValue="modelValue"
    size="lg"
    showCloseIcon
    :title="$t('router.monitoring.improve_response.add_new_content')"
    :secondaryButtonProps="{
      text: $t('cancel'),
    }"
    :primaryButtonProps="{
      text: $t('finish'),
    }"
    @update:model-value="$emit('update:modelValue', $event)"
    @secondary-button-click="$emit('update:modelValue', false)"
  >
    <UnnnicTab
      :tabs="contentTabs.map((tab) => tab.page)"
      :activeTab="activeTab"
      @change="onTabChange"
    >
      <template
        v-for="tab in contentTabs"
        :key="tab.page"
        #[`tab-head-${tab.page}`]
      >
        {{ $t(`content_bases.tabs.${tab.title}`) }}
      </template>
    </UnnnicTab>

    <section class="modal-add-content__content">
      <AddFilesContent v-show="activeTab === 'files'" />

      <AddSitesContent v-show="activeTab === 'sites'" />

      <textarea
        v-show="activeTab === 'text'"
        class="content__text"
        :placeholder="$t('content_bases.write_content_placeholder')"
        cols="30"
        rows="10"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </section>
  </UnnnicModalDialog>
</template>

<script setup>
import { ref } from 'vue';

import AddFilesContent from './AddFilesContent.vue';
import AddSitesContent from './AddSitesContent.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'update:modelValue']);

const contentTabs = ref([
  { title: 'files', page: 'files' },
  { title: 'sites', page: 'sites' },
  { title: 'text', page: 'text' },
]);
const activeTab = ref(contentTabs.value[0].page);
const onTabChange = (newTab) => {
  activeTab.value = newTab;
};
</script>

<style scoped lang="scss">
.modal-add-content {
  &__content {
    border-radius: $unnnic-border-radius-sm;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-cleanest;

    padding: $unnnic-spacing-sm;

    min-height: 30vh;

    display: grid;
    align-items: center;

    .content__text {
      outline: none;
      resize: none;
      border: none;

      width: 100%;
      height: 100%;

      color: $unnnic-color-neutral-dark;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-regular;

      &::placeholder {
        color: $unnnic-color-neutral-cloudy;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-gt;
        line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
        font-weight: $unnnic-font-weight-regular;
      }
    }
  }
}
</style>
