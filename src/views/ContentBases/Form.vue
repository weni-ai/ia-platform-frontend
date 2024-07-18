<template>
  <PageContainer
    :loadingTitle="contentBase.loading"
    :title="contentBase.title"
    @back="
      $router.push({
        name: 'intelligence-home',
        params: {
          intelligenceUuid: route.params.intelligenceUuid,
        },
      })
    "
  >
    <template #actions>
      <UnnnicButton
        class="settings-button"
        iconCenter="settings"
        type="secondary"
        @click="isEditContentBaseOpen = true"
      />
    </template>

    <section class="repository-base-edit__wrapper">
      <section class="repository-base-edit__wrapper__left-side">
        <section class="base-tabs">
          <section
            v-for="{ name, text, icon } in tabs"
            :key="name"
            :class="[
              'base-tabs__tab',
              { 'base-tabs__tab--active': tab === name },
            ]"
            @click="tab = name"
          >
            <UnnnicIcon
              :icon="icon"
              scheme="inherit"
              size="avatar-nano"
              class="base-tabs__tab__icon"
            />

            {{ $t(text) }}
          </section>
        </section>

        <BasesFormText
          v-if="tab === 'text'"
          :item="contentBaseText"
        />

        <section
          v-else
          :class="'content-base__container'"
        >
          <section class="content-base__scrollable">
            <section class="content-base__content-tab">
              <template v-if="tab === 'files'">
                <UnnnicSkeletonLoading
                  v-if="
                    files.status.value === 'loading' &&
                    files.data.value.length === 0
                  "
                  tag="div"
                  height="100%"
                  class="repository-base-edit__wrapper__card-content"
                />

                <template v-else>
                  <BasesFormFiles
                    v-model:files="files"
                    :filterText="''"
                    :shape="'normal'"
                  />
                </template>
              </template>

              <template v-if="tab === 'sites'">
                <BasesFormSites
                  v-model:items="sites"
                  :filterText="''"
                  :shape="'normal'"
                />
              </template>
            </section>
          </section>
        </section>
      </section>

      <section
        v-if="shouldShowSideareaTest"
        :class="['repository-base-edit__wrapper__card-test-container']"
      >
        <div class="repository-base-edit__wrapper__card-test-container__header">
          {{ $t('content_bases.quick_test') }}
        </div>

        <Tests
          :contentBaseUuid="route.params.contentBaseUuid"
          :contentBaseLanguage="contentBase.language"
        />
      </section>
    </section>
  </PageContainer>

  <BaseSettingsForm
    v-if="isEditContentBaseOpen"
    :intelligenceUuid="route.params.intelligenceUuid"
    :contentBaseUuid="route.params.contentBaseUuid"
    :preFilledValues="{
      title: contentBase.title,
      language: contentBase.language,
      description: contentBase.description,
    }"
    @close="isEditContentBaseOpen = false"
    @success="receiveUpdatedContentBase"
  ></BaseSettingsForm>
</template>

<script setup>
import { reactive, watch, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { get } from 'lodash';
import nexusaiAPI from '@/api/nexusaiAPI.js';
import PageContainer from '@/components/PageContainer.vue';
import BaseSettingsForm from '@/components/BaseSettingsForm.vue';
import BasesFormFiles from '@/views/repository/content/BasesFormFiles.vue';
import BasesFormSites from '@/views/repository/content/BasesFormSites.vue';
import BasesFormText from '@/views/repository/content/BasesFormText.vue';
import Tests from '@/views/repository/content/Tests.vue';
import { useFilesPagination } from './filesPagination';
import { useSitesPagination } from './sitesPagination';

const route = useRoute();

const isEditContentBaseOpen = ref(false);

const contentBase = reactive({
  loading: false,
  title: '',
  description: '',
  language: '',
});

const contentBaseText = reactive({
  status: false,
  uuid: null,
  value: '',
  oldValue: '',
});

const files = useFilesPagination({
  contentBaseUuid: route.params.contentBaseUuid,
});

const sites = useSitesPagination({
  contentBaseUuid: route.params.contentBaseUuid,
});

const tab = ref('files');

const tabs = computed(() => {
  return [
    {
      name: 'files',
      text: 'content_bases.tabs.files',
      icon: 'news',
    },
    {
      name: 'sites',
      text: 'content_bases.tabs.sites',
      icon: 'globe',
    },
    {
      name: 'text',
      text: 'content_bases.tabs.text',
      icon: 'format_align_left',
    },
  ];
});

const shouldShowSideareaTest = computed(() => {
  return (
    files.data.value.length ||
    sites.data.value.length ||
    contentBaseText.oldValue
  );
});

watch(
  [() => route.params.intelligenceUuid, () => route.params.contentBaseUuid],
  async () => {
    loadContentBase();
    loadContentBaseText();
    files.loadNext();
    sites.loadNext();
  },
  { immediate: true },
);

async function loadContentBase() {
  contentBase.loading = true;

  const { data: contentBaseData } = await nexusaiAPI
    .readIntelligenceContentBase({
      intelligenceUuid: route.params.intelligenceUuid,
      contentBaseUuid: route.params.contentBaseUuid,

      obstructiveErrorProducer: true,
    })
    .finally(() => {
      contentBase.loading = false;
    });

  contentBase.title = contentBaseData.title;
  contentBase.description = contentBaseData.description;
  contentBase.language = contentBaseData.language;
}

async function loadContentBaseText() {
  contentBaseText.status = 'loading';

  const { data: contentBaseTextsData } = await nexusaiAPI
    .listIntelligenceContentBaseTexts({
      contentBaseUuid: route.params.contentBaseUuid,
    })
    .finally(() => {
      contentBaseText.status = 'loaded';
    });

  const uuid = get(contentBaseTextsData, 'results.0.uuid', null);
  const text = get(contentBaseTextsData, 'results.0.text', '');

  contentBaseText.uuid = uuid;
  contentBaseText.value = contentBaseText.oldValue = text;
}

function receiveUpdatedContentBase({ title, language, description }) {
  contentBase.title = title;
  contentBase.language = language;
  contentBase.description = description;
}
</script>

<style lang="scss" scoped>
.settings-button {
  margin-left: auto;
}

.base-tabs {
  display: flex;
  margin-bottom: $unnnic-spacing-sm;
  cursor: pointer;
  user-select: none;
  column-gap: $unnnic-spacing-sm;

  &__tab {
    flex: 1;
    display: flex;
    align-items: center;
    column-gap: $unnnic-spacing-xs;

    outline-style: solid;
    outline-color: $unnnic-color-neutral-cleanest;
    outline-width: $unnnic-border-width-thinner;
    outline-offset: -$unnnic-border-width-thinner;

    border-radius: $unnnic-border-radius-sm;
    padding: $unnnic-spacing-ant $unnnic-spacing-sm;

    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-lg;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-bold;

    &__icon {
      color: $unnnic-color-neutral-cloudy;
    }

    &--active {
      outline-color: $unnnic-color-weni-600;
      color: $unnnic-color-weni-600;

      .base-tabs__tab__icon {
        color: $unnnic-color-weni-600;
      }
    }
  }
}

.content-base {
  &__container {
    outline-style: solid;
    outline-color: $unnnic-color-neutral-cleanest;
    outline-width: $unnnic-border-width-thinner;
    outline-offset: -$unnnic-border-width-thinner;

    border-radius: $unnnic-border-radius-sm;
    padding: $unnnic-spacing-sm;

    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__scrollable {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    height: 100%;

    overflow: overlay;

    $scroll-size: $unnnic-inline-nano;

    padding-right: $unnnic-inline-nano + $scroll-size;
    margin-right: -($unnnic-inline-nano + $scroll-size);

    &::-webkit-scrollbar {
      width: $scroll-size;
    }

    &::-webkit-scrollbar-thumb {
      background: $unnnic-color-neutral-clean;
      border-radius: $unnnic-border-radius-pill;
    }

    &::-webkit-scrollbar-track {
      background: $unnnic-color-neutral-soft;
      border-radius: $unnnic-border-radius-pill;
    }
  }

  &__content-tab {
    display: flex;
    flex-direction: column;
    row-gap: $unnnic-spacing-md;
    height: 100%;
  }
}

.repository-base-edit {
  &__wrapper {
    flex: 1;
    display: flex;
    gap: $unnnic-spacing-sm;

    &__left-side {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    &__card-test-container {
      padding: $unnnic-spacing-sm;
      outline-style: solid;
      outline-color: $unnnic-color-neutral-cleanest;
      outline-width: $unnnic-border-width-thinner;
      outline-offset: -$unnnic-border-width-thinner;
      border-radius: $unnnic-border-radius-sm;

      width: 24.625 * $unnnic-font-size;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;

      &__header {
        display: flex;
        justify-content: space-between;
        color: $unnnic-color-neutral-darkest;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-lg;
        line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
        font-weight: $unnnic-font-weight-bold;
        padding-inline: $unnnic-spacing-sm;
        padding-top: $unnnic-spacing-ant;
        padding-bottom: $unnnic-spacing-ant - $unnnic-border-width-thinner;
        margin-inline: -$unnnic-spacing-sm;
        margin-top: -$unnnic-spacing-sm;
        margin-bottom: $unnnic-spacing-sm;
        border-bottom: $unnnic-border-width-thinner solid
          $unnnic-color-neutral-cleanest;
      }
    }

    &__card-content {
      border: 0;
      flex: 1;
      padding: 0;
      position: relative;
      display: flex;
      flex-direction: column;

      &:has(&__info) textarea {
        border-radius: $unnnic-border-radius-sm $unnnic-border-radius-sm 0 0;
      }

      &__header {
        color: $unnnic-color-neutral-darkest;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-lg;
        line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
        font-weight: $unnnic-font-weight-bold;
        background-color: $unnnic-color-background-snow;

        display: flex;
        align-items: center;
        justify-content: space-between;
        position: absolute;
        margin: $unnnic-spacing-sm;
        margin-top: $unnnic-border-width-thinner;
        margin-bottom: 0;
        padding-top: $unnnic-spacing-sm - $unnnic-border-width-thinner;
        padding-bottom: $unnnic-spacing-sm;
        left: 0;
        right: 0;

        &__save-button {
          width: 12.5 * $unnnic-font-size;
        }
      }

      &__info {
        color: $unnnic-color-neutral-cloudy;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-md;
        line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
        font-weight: $unnnic-font-weight-regular;

        display: flex;
        align-items: center;
        column-gap: $unnnic-spacing-nano;
        padding-block: $unnnic-spacing-xs
          ($unnnic-spacing-xs - $unnnic-border-width-thinner);
        padding-inline: $unnnic-spacing-sm - $unnnic-border-width-thinner;

        background-color: $unnnic-color-neutral-light;
        border: $unnnic-border-width-thinner solid
          $unnnic-color-neutral-cleanest;
        border-top-width: 0;

        border-radius: 0 0 $unnnic-border-radius-sm $unnnic-border-radius-sm;

        :deep(a) {
          color: inherit;
          text-underline-offset: $unnnic-spacing-stack-nano;
        }
      }
    }
  }
}
</style>
