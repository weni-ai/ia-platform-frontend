<template>
  <UnnnicModalDialog
    data-testid="modal-add-content"
    :modelValue="modelValue"
    size="lg"
    showCloseIcon
    :title="$t('router.monitoring.improve_response.add_new_content')"
    :secondaryButtonProps="{
      text: $t('cancel'),
    }"
    :primaryButtonProps="{
      text: $t('finish'),
      disabled: disableSaveButton,
      loading: isSavingContents,
    }"
    @update:model-value="$emit('update:modelValue', $event)"
    @secondary-button-click="closeModal"
    @primary-button-click="saveContents"
  >
    <section class="modal-add-content">
      <UnnnicIntelligenceText
        color="neutral-cloudy"
        family="secondary"
        size="body-gt"
        tag="p"
      >
        {{ $t('router.monitoring.modal_add_content.description') }}
      </UnnnicIntelligenceText>

      <UnnnicTab
        data-testid="tabs"
        class="modal-add-content__tab"
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
        <AddFilesContent
          v-show="activeTab === 'files'"
          data-testid="tab-files"
          @update:model-value="contents.files = $event"
        />

        <AddSitesContent
          v-show="activeTab === 'sites'"
          data-testid="tab-sites"
          @update:model-value="contents.sites = $event"
        />

        <textarea
          v-show="activeTab === 'text'"
          data-testid="tab-text"
          class="content__text"
          :placeholder="$t('content_bases.write_content_placeholder')"
          cols="30"
          rows="10"
          @input="contents.text = $event.target.value"
        />
      </section>
    </section>
  </UnnnicModalDialog>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useStore } from 'vuex';

import nexusaiAPI from '@/api/nexusaiAPI';

import AddFilesContent from './AddFilesContent.vue';
import AddSitesContent from './AddSitesContent.vue';
import { normalizeURL } from '@/utils/sites';
import i18n from '@/utils/plugins/i18n';

const store = useStore();
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'update:modelValue']);

const contentBaseUuid = computed(() => store.state.router.contentBaseUuid);

onMounted(async () => {
  if (contentBaseUuid.value) return;

  const { data } = await nexusaiAPI.router.read({
    projectUuid: store.state.Auth.connectProjectUuid,
    obstructiveErrorProducer: true,
  });

  store.state.router.contentBaseUuid = data.uuid;
});

const contentTabs = ref([
  { title: 'files', page: 'files' },
  { title: 'sites', page: 'sites' },
  { title: 'text', page: 'text' },
]);
const activeTab = ref(contentTabs.value[0].page);
const onTabChange = (newTab) => {
  activeTab.value = newTab;
};

const contents = ref({
  files: null,
  sites: null,
  text: null,
});

const disableSaveButton = computed(
  () =>
    !contents.value.files?.length &&
    !contents.value.sites?.length &&
    !contents.value.text?.length,
);

function closeModal() {
  emit('update:modelValue', false);
}

async function saveSitesContent() {
  const { sites } = contents.value;
  if (!sites?.length) return;

  const treatedSites = sites.map((site) =>
    reactive({
      file: null,
      file_name: null,
      extension_file: 'site',
      uuid: `temp-${Math.random() * 1000}`,
      created_file_name: normalizeURL(site),
      status: 'uploading',
    }),
  );

  Promise.all(
    treatedSites.map(async (site) => {
      await nexusaiAPI.intelligences.contentBases.sites.create({
        contentBaseUuid: contentBaseUuid.value,
        link: site.created_file_name,
      });
    }),
  );
}

async function saveTextContent() {
  const { uuid } = store.state.Brain.contentText;
  const { text } = contents.value;

  if (!text?.length) return;

  const contentTextApi = nexusaiAPI.intelligences.contentBases.texts;
  const apiMethod = uuid ? contentTextApi.edit : contentTextApi.create;

  const payload = {
    contentBaseUuid: contentBaseUuid.value,
    text,
    ...(uuid && { contentBaseTextUuid: uuid }),
  };

  const { data: contentBaseTextData } = await apiMethod(payload);

  store.state.Brain.contentText.current = contentBaseTextData.text;
}

const isSavingContents = ref(false);

async function saveContents() {
  if (
    contents.value.files?.length &&
    !contents.value.sites?.length &&
    !contents.value.text?.length
  ) {
    closeModal();
    return;
  }

  isSavingContents.value = true;

  const promises = [];

  if (contents.value.sites?.length) {
    promises.push(saveSitesContent());
  }

  if (contents.value.text?.length) {
    promises.push(saveTextContent());
  }

  try {
    await Promise.all(promises);
    closeModal();
    store.state.alert = {
      type: 'success',
      text: i18n.global.t('router.monitoring.modal_add_content.success_alert'),
    };
  } finally {
    isSavingContents.value = false;
  }
}
</script>

<style scoped lang="scss">
.modal-add-content {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  &__tab {
    margin-bottom: -$unnnic-spacing-sm;
  }

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
