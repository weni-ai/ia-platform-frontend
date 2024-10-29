<template>
  <PageContainer
    :loadingTitle="loadingContentBase"
    :dontShowBack="true"
    :isNoSpaceContainer="true"
  >
    <section class="repository-base-edit__wrapper">
      <BrainSideBar />
      <div class="repository-base-edit__wrapper__left-side">
        <section class="content-base__container">
          <BrainHeader />
          <section class="scrollable">
            <RouterContentBase
              v-if="route.name === 'router-content'"
              :filesProp="files"
              :sitesProp="sites"
              :textProp="text"
              @update:files="(v) => (files = v)"
            />
            <RouterActions v-else-if="route.name === 'router-actions'" />
            <RouterCustomization
              v-else-if="route.name === 'router-personalization'"
            />
            <RouterTunings
              v-else-if="route.name === 'router-tunings'"
              :data="routerTunings"
            />
          </section>
        </section>
      </div>

      <section
        :class="[
          'repository-base-edit__wrapper__card',
          'repository-base-edit__wrapper__card-test-container',
        ]"
      >
        <BrainHeaderPreview
          :brainOn="routerTunings.brainOn"
          :previewActions="previewActions"
        />
        <BrainWarningBar v-if="!routerTunings.brainOn" />
        <Tests
          :key="refreshPreviewValue"
          :contentBaseUuid="contentBaseUuid"
          :contentBaseLanguage="contentBase.language"
          :usePreview="true"
          @messages="getPreviewMessages"
        />
      </section>
    </section>

    <ModalPreviewQRCode
      v-if="isMobilePreviewModalOpen"
      @close="isMobilePreviewModalOpen = false"
    />

    <ModalSaveChangesError
      v-if="$store.state.Brain.tabsWithError"
      @close="$store.state.Brain.tabsWithError = null"
    />
  </PageContainer>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { get } from 'lodash';
import nexusaiAPI from '../../api/nexusaiAPI';
import PageContainer from '../../components/PageContainer.vue';
import Tests from '../repository/content/Tests.vue';
import RouterActions from './RouterActions.vue';
import RouterContentBase from './RouterContentBase.vue';
import RouterCustomization from './RouterCustomization.vue';
import RouterTunings from './RouterTunings.vue';
import ModalPreviewQRCode from './Preview/ModalPreviewQRCode.vue';
import ModalSaveChangesError from './ModalSaveChangesError.vue';
import { useFilesPagination } from '../ContentBases/filesPagination';
import { useSitesPagination } from '../ContentBases/sitesPagination';
import BrainSideBar from '@/components/Brain/BrainSideBar.vue';
import BrainHeader from '@/components/Brain/BrainHeader.vue';
import i18n from '@/utils/plugins/i18n';
import BrainWarningBar from '@/components/Brain/BrainWarningBar.vue';
import BrainHeaderPreview from '@/components/Brain/BrainHeaderPreview.vue';

export default {
  name: 'Brain',
  components: {
    Tests,
    PageContainer,
    RouterActions,
    RouterContentBase,
    RouterCustomization,
    RouterTunings,
    ModalPreviewQRCode,
    ModalSaveChangesError,
    BrainSideBar,
    BrainHeader,
    BrainWarningBar,
    BrainHeaderPreview,
  },
  setup() {
    const route = useRoute();
    const store = useStore();

    const loadingContentBase = ref(false);
    const dropdownOpen = ref(false);
    const refreshPreviewValue = ref(0);
    const isMobilePreviewModalOpen = ref(false);

    const previewMessages = ref('');

    const text = ref({
      open: true,
      status: null,
      uuid: null,
      oldValue: '',
      value: '',
    });

    const routerTunings = ref({
      brainOn: true,
    });

    const contentBase = ref({
      title: '',
      description: '',
      language: '',
    });

    const contentBaseUuid = computed(
      () => route.params.contentBaseUuid || store.state.router.contentBaseUuid,
    );

    const intelligenceUuid = computed(
      () =>
        route.params.intelligenceUuid || store.state.router.intelligenceUuid,
    );

    const files = useFilesPagination({
      contentBaseUuid: contentBaseUuid.value,
    });

    const sites = useSitesPagination({
      contentBaseUuid: contentBaseUuid.value,
    });

    const refreshPreview = () => {
      refreshPreviewValue.value += 1;
    };

    const exportConversations = () => {
      if (previewMessages.value.length === 0) return;

      const csvData = convertToCSV(previewMessages.value);

      const filename = 'preview-messages.csv';
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();

      URL.revokeObjectURL(url);
    };

    const getPreviewMessages = (newMessages) => {
      previewMessages.value = newMessages;
    };

    const convertToCSV = (array) => {
      const headers = ['type', 'text'];
      const csvRows = [headers.join(',')];

      array.forEach((item) => {
        const row = [item.type, item.text];
        csvRows.push(row.join(','));
      });

      return csvRows.join('\n');
    };

    const loadRouterOptions = async () => {
      const { data } = await nexusaiAPI.router.tunings.advanced.read({
        projectUuid: store.state.Auth.connectProjectUuid,
      });

      routerTunings.value.brainOn = data.brain_on;
    };

    const loadContentBase = async () => {
      loadingContentBase.value = true;
      text.value.status = 'loading';

      try {
        const { data: contentBaseData } =
          await nexusaiAPI.readIntelligenceContentBase({
            intelligenceUuid: intelligenceUuid.value,
            contentBaseUuid: contentBaseUuid.value,
            obstructiveErrorProducer: true,
          });

        contentBase.value.title = contentBaseData.title;
        contentBase.value.description = contentBaseData.description;
        contentBase.value.language = contentBaseData.language;
      } finally {
        loadingContentBase.value = false;
      }

      const { data: contentBaseTextsData } =
        await nexusaiAPI.intelligences.contentBases.texts.list({
          contentBaseUuid: contentBaseUuid.value,
        });

      const textData = get(contentBaseTextsData, 'results.0.text', '');
      const uuid = get(contentBaseTextsData, 'results.0.uuid', '');

      store.state.Brain.contentText.uuid = text.value.uuid = uuid;
      const textValue = textData === '--empty--' ? '' : textData;

      store.state.Brain.contentText.current =
        store.state.Brain.contentText.old = textValue;

      text.value.value = textValue;
      text.value.oldValue = textValue;
      text.value.status = null;
    };

    watch(
      () => route.params.intelligenceUuid,
      async () => {
        await loadContentBase();
      },
      { immediate: true },
    );

    onMounted(() => {
      files.loadNext();
      sites.loadNext();
      loadRouterOptions();
    });

    const previewActions = computed(() => {
      return [
        {
          scheme: 'neutral-dark',
          icon: 'refresh',
          text: i18n.global.t('router.preview.options.refresh'),
          onClick: refreshPreview,
        },
        {
          scheme: 'neutral-dark',
          icon: 'ios_share',
          text: i18n.global.t('router.preview.options.export'),
          onClick: exportConversations,
        },
        {
          scheme: 'neutral-dark',
          icon: 'smartphone',
          text: i18n.global.t('router.preview.options.qr_code'),
          onClick: () => (isMobilePreviewModalOpen.value = true),
        },
      ];
    });

    return {
      route,
      loadingContentBase,
      dropdownOpen,
      refreshPreviewValue,
      isMobilePreviewModalOpen,
      files,
      sites,
      text,
      routerTunings,
      contentBase,
      contentBaseUuid,
      intelligenceUuid,
      refreshPreview,
      loadRouterOptions,
      loadContentBase,
      getPreviewMessages,
      previewActions,
    };
  },
};
</script>

<style lang="scss" scoped>
.scrollable {
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

  > * {
    height: 0;
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }
}

.brain-deactivated-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(244, 246, 248, 0.4);
  margin: -$unnnic-spacing-sm;
  padding: $unnnic-spacing-lg;
  text-align: center;
}

.content-base {
  &__container {
    border-style: solid;
    border-color: $unnnic-color-neutral-soft;
    border-width: 0 $unnnic-border-width-thinner 0 $unnnic-border-width-thinner;

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

    &--shape-normal {
      height: 100%;
    }

    &__text {
      margin-top: $unnnic-spacing-sm;
    }
  }
}

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

.exit-content-base-modal
  :deep(.unnnic-modal-container-background-body-description-container) {
  padding-bottom: $unnnic-spacing-xs;
}

.attention-button {
  background-color: $unnnic-color-aux-yellow-500;

  &:hover:enabled {
    background-color: $unnnic-color-aux-yellow-700;
  }

  &:active:enabled {
    background-color: $unnnic-color-aux-yellow-900;
  }
}

.repository-base-edit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $unnnic-spacing-md;

  &__header {
    display: flex;
    align-items: center;
    column-gap: $unnnic-spacing-ant;

    &__buttons {
      display: flex;
      justify-content: space-between;

      .unnnic-tooltip {
        height: 46px;
        &:nth-child(2) {
          margin: 0 $unnnic-inset-nano;
        }
        &:nth-child(3) {
          margin-right: $unnnic-inset-nano;
        }
      }
    }
    &__button {
      width: 46px;
      height: 46px;
    }
    &--content {
      display: flex;
      align-items: center;
    }
    span {
      cursor: pointer;
      margin-right: $unnnic-spacing-xs;
    }
  }

  &__text {
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-md;
    color: $unnnic-color-neutral-cloudy;
  }

  .input.size-md {
    height: 46px;
  }
  :deep(.input.size-md) {
    height: 46px;
  }

  &__wrapper {
    flex: 1;
    display: flex;

    &__left-side {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    &__card-test-container {
      width: 24.625 * $unnnic-font-size;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    }

    &__card {
      &__header {
        display: flex;
        align-items: center;
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

:deep(.unnnic-tooltip-label-bottom) {
  top: 75px !important;
}
:deep(.shake-me) {
  animation: shake 3s infinite alternate;

  &:after {
    content: '\10A50';
    color: red !important;
    font-size: 70px;

    display: flex;
    justify-content: left;
    align-items: center;
  }
}
:deep(.input.size-md) {
  height: 46px;
}

:deep(.rpstr-vw-bs) {
  margin-top: 0;
}

.input.size-md {
  height: 46px;
}
</style>
