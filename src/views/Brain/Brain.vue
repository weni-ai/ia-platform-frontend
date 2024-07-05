<template>
  <PageContainer
    :loadingTitle="loadingContentBase"
    :title="contentBase.title"
    :dontShowBack="true"
    :brainIsDeactivated="!routerTunings.brainOn"
  >
    <template #actions>
      <UnnnicButton
        class="save-button"
        :disabled="$store.getters.isBrainSaveButtonDisabled"
        :loading="$store.state.Brain.isSavingChanges"
        @click="$store.dispatch('saveBrainChanges')"
      >
        {{ $t('router.tunings.save_changes') }}
      </UnnnicButton>
    </template>

    <section class="repository-base-edit__wrapper">
      <div class="repository-base-edit__wrapper__left-side">
        <section :class="'content-base__container'">
          <UnnnicTab
            :tabs="routerTabs.map((e) => e.page)"
            :activeTab="routerTabs.find((e) => e.page === $route.name).page"
            @change="onTabChange"
          >
            <template
              v-for="tab in routerTabs"
              #[`tab-head-${tab.page}`]
            >
              {{ $t(`router.tabs.${tab.title}`) }}
            </template>
          </UnnnicTab>

          <RouterContentBase
            v-if="$route.name === 'router-content'"
            :filterName="filterName"
            :files="files"
            :sites="sites"
            :text="text"
            @load-files="loadFiles"
            @load-sites="loadSites"
            @removed-file="removedFile"
            @removed-site="removedSite"
          />
          <RouterActions
            v-else-if="$route.name === 'router-actions'"
            :items="routerActions"
          />
          <RouterCustomization
            v-else-if="$route.name === 'router-personalization'"
          />
          <RouterTunings
            v-else-if="$route.name === 'router-tunings'"
            :data="routerTunings"
          />
        </section>
      </div>

      <div
        v-if="shouldShowSideareaTest"
        :class="[
          'repository-base-edit__wrapper__card',
          'repository-base-edit__wrapper__card-test-container',
        ]"
      >
        <div class="repository-base-edit__wrapper__card-test-container__header">
          {{ $t('router.preview.title') }}

          <article>
            <UnnnicDropdown
              v-model:open="dropdownOpen"
              position="bottom-left"
            >
              <template #trigger>
                <section>
                  <UnnnicIconSvg
                    icon="navigation-menu-vertical-1"
                    class="unnnic-card-intelligence__header__buttons__icon"
                    :scheme="dropdownOpen ? 'neutral-dark' : 'neutral-clean'"
                    size="sm"
                    clickable
                  />
                </section>
              </template>

              <UnnnicDropdownItem>
                <section
                  class="unnnic-card-intelligence__header__buttons__dropdown"
                  @click="refreshPreview"
                >
                  <UnnnicIconSvg
                    size="sm"
                    icon="refresh"
                  />
                  <div>{{ $t('router.preview.options.refresh') }}</div>
                </section>
              </UnnnicDropdownItem>

              <UnnnicDropdownItem>
                <section
                  class="unnnic-card-intelligence__header__buttons__dropdown"
                  @click="isMobilePreviewModalOpen = true"
                >
                  <UnnnicIconSvg
                    size="sm"
                    icon="smartphone"
                  />
                  <div>{{ $t('router.preview.options.qr_code') }}</div>
                </section>
              </UnnnicDropdownItem>
            </UnnnicDropdown>
          </article>
        </div>

        <Tests
          :key="refreshPreviewValue"
          :contentBaseUuid="contentBaseUuid"
          :contentBaseLanguage="contentBase.language"
          :usePreview="true"
        />
      </div>
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
import { get } from 'lodash';
import Tests from '../repository/content/Tests.vue';
import PageContainer from '../../components/PageContainer.vue';
import nexusaiAPI from '../../api/nexusaiAPI';
import BasesFormFiles from '../repository/content/BasesFormFiles.vue';
import BasesFormSites from '../repository/content/BasesFormSites.vue';
import BasesFormText from '../repository/content/BasesFormText.vue';
import BasesFormGenericListHeader from '../repository/content/BasesFormGenericListHeader.vue';
import RouterActions from './RouterActions.vue';
import RouterTunings from './RouterTunings.vue';
import RouterContentBase from './RouterContentBase.vue';
import RouterCustomization from './RouterCustomization.vue';
import ModalPreviewQRCode from './Preview/ModalPreviewQRCode.vue';
import ModalSaveChangesError from './ModalSaveChangesError.vue';

export default {
  name: 'Brain',
  components: {
    Tests,
    PageContainer,
    BasesFormFiles,
    BasesFormSites,
    BasesFormText,
    BasesFormGenericListHeader,
    RouterActions,
    RouterTunings,
    RouterContentBase,
    RouterCustomization,
    ModalPreviewQRCode,
    ModalSaveChangesError,
  },
  data() {
    return {
      routerTabs: [
        {
          title: 'personalization',
          page: 'router-personalization',
        },
        {
          title: 'content',
          page: 'router-content',
        },
        {
          title: 'actions',
          page: 'router-actions',
        },
        {
          title: 'tunings',
          page: 'router-tunings',
        },
      ],

      loadingContentBase: false,

      contentBase: {
        title: '',
        description: '',
        language: '',
      },

      dropdownOpen: false,
      refreshPreviewValue: 0,

      repositoryUUID: null,

      isMobilePreviewModalOpen: false,

      bases: [],

      filterName: '',

      files: {
        status: null,
        next: null,
        data: [],
      },

      sites: {
        status: null,
        next: null,
        data: [],
      },

      text: {
        open: true,
        status: null,
        uuid: null,
        oldValue: '',
        value: '',
      },

      routerActions: {
        status: null,
        data: [],
      },

      routerTunings: {
        brainOn: true,
      },
    };
  },
  computed: {
    shouldShowSideareaTest() {
      return this.files.data.length || this.sites.data.length;
    },

    contentBaseUuid() {
      return (
        this.$route.params.contentBaseUuid ||
        this.$store.state.router.contentBaseUuid
      );
    },

    intelligenceUuid() {
      return (
        this.$route.params.intelligenceUuid ||
        this.$store.state.router.intelligenceUuid
      );
    },

    contentStyle() {
      return 'accordion';
    },
  },
  watch: {
    '$route.params.intelligenceUuid': {
      immediate: true,

      async handler() {
        this.loadingContentBase = true;
        this.text.status = 'loading';

        const { data: contentBaseData } =
          await nexusaiAPI.readIntelligenceContentBase({
            intelligenceUuid: this.intelligenceUuid,
            contentBaseUuid: this.contentBaseUuid,

            obstructiveErrorProducer: true,
          });

        this.loadingContentBase = false;

        this.contentBase.title = contentBaseData.title;
        this.contentBase.description = contentBaseData.description;
        this.contentBase.language = contentBaseData.language;

        const { data: contentBaseTextsData } =
          await nexusaiAPI.listIntelligenceContentBaseTexts({
            contentBaseUuid: this.contentBaseUuid,
          });

        const text = get(contentBaseTextsData, 'results.0.text', '');

        const uuid = get(contentBaseTextsData, 'results.0.uuid', '');

        this.$store.state.Brain.contentText.uuid = this.text.uuid = uuid;

        const textValue = text === '--empty--' ? '' : text;

        this.$store.state.Brain.contentText.current =
          this.$store.state.Brain.contentText.old = textValue;

        this.text.value = textValue;
        this.text.oldValue = textValue;

        this.text.status = null;
      },
    },
  },
  mounted() {
    this.loadFiles();
    this.loadSites();

    this.loadRouterOptions();
  },

  methods: {
    removedFile(fileUuid) {
      this.files.data = this.files.data.filter(({ uuid }) => uuid !== fileUuid);
    },

    removedSite(siteUuid) {
      this.sites.data = this.sites.data.filter(({ uuid }) => uuid !== siteUuid);
    },

    async loadFiles() {
      this.files.status = 'loading';

      const { data } = await nexusaiAPI.intelligences.contentBases.files.list({
        contentBaseUuid: this.contentBaseUuid,
        next: this.files.next,
      });

      this.files.data = this.files.data.concat(
        data.results
          .map((file) => ({
            ...file,
            status:
              {
                Processing: 'processing',
                success: 'uploaded',
              }[file.status] || file.status,
          }))
          .filter(
            ({ uuid }) =>
              !this.files.data.some((alreadyIn) => alreadyIn.uuid === uuid),
          ),
      );

      this.files.status = null;
      this.files.next = data.next;

      if (!data.next) {
        const status = 'complete';
        this.files.status = status;
      }
    },

    async loadSites() {
      this.sites.status = 'loading';

      try {
        const { data } = await nexusaiAPI.intelligences.contentBases.sites.list(
          {
            contentBaseUuid: this.contentBaseUuid,
            next: this.sites.next,
          },
        );

        this.sites.status = 'complete';

        this.sites.data = this.sites.data.concat(
          data
            .map((site) => ({
              ...site,
              extension_file: 'site',
              created_file_name: site.link,
              status:
                {
                  Processing: 'processing',
                  success: 'uploaded',
                }[site.status] || site.status,
            }))
            .filter(
              ({ uuid }) =>
                !this.sites.data.some((alreadyIn) => alreadyIn.uuid === uuid),
            ),
        );
      } finally {
        if (this.sites.status !== 'complete') {
          this.sites.status = null;
        }
      }
    },

    async loadRouterOptions() {
      const { data } = await nexusaiAPI.router.tunings.advanced.read({
        projectUuid: this.$store.state.Auth.connectProjectUuid,
      });

      this.routerTunings.brainOn = data.brain_on;
    },

    onTabChange(pageName) {
      if (this.$route.name !== pageName) {
        this.$router.push({ name: pageName });
      }
    },
    refreshPreview() {
      this.refreshPreviewValue += 1;
    },
  },
};
</script>

<style lang="scss" scoped>
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

    &--shape-normal {
      height: 100%;
    }

    &__text {
      margin-top: $unnnic-spacing-sm;
    }
  }
}

.save-button,
.settings-button {
  margin-left: auto;
}

.save-button {
  width: 18.5 * $unnnic-font-size;
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
    gap: $unnnic-spacing-sm;

    &__left-side {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    &__card-test-container {
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

    &__card {
      padding: $unnnic-spacing-sm;

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
