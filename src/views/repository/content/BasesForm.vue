<template>
  <PageContainer
    :loadingTitle="loadingContentBase"
    :title="contentBase.title"
    :dontShowBack="isRouterView"
    :brainIsDeactivated="!routerTunings.brainOn"
    @back="
      $router.push({
        name: 'intelligence-home',
        params: {
          intelligenceUuid: intelligenceUuid,
        },
      })
    "
  >
    <UnnnicButton
      v-if="isRouterView"
      slot="actions"
      class="save-button"
      :disabled="$store.getters.isBrainSaveButtonDisabled"
      :loading="$store.state.Brain.isSavingChanges"
      @click="$store.dispatch('saveBrainChanges')"
    >
      {{ $t('router.tunings.save_changes') }}
    </UnnnicButton>

    <UnnnicButton
      v-else
      class="settings-button"
      slot="actions"
      iconCenter="settings"
      type="secondary"
      @click="isEditContentBaseOpen = true"
    />

    <section class="repository-base-edit__wrapper">
      <div class="repository-base-edit__wrapper__left-side">
        <section
          v-if="!isRouterView"
          class="base-tabs"
        >
          <div
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

            {{ text }}
          </div>
        </section>

        <BasesFormText
          v-if="tab === 'text' && !isRouterView"
          :item="text"
        />

        <section
          v-else
          :class="'content-base__container'"
        >
          <template v-if="isRouterView">
            <ul class="router-tabs">
              <RouterLink
                v-for="(tab, index) in routerTabs"
                :key="index"
                :to="{ name: tab.page }"
              >
                <li
                  :class="[
                    'router-tabs__tab',
                    {
                      'router-tabs__tab--selected': $route.name === tab.page,
                    },
                  ]"
                >
                  {{ $t(`router.tabs.${tab.title}`) }}
                </li>
              </RouterLink>
            </ul>

            <UnnnicDivider ySpacing="sm"></UnnnicDivider>
          </template>

          <section class="content-base__scrollable">
            <section :style="isRouterView ? { height: 0 } : { flex: 1 }">
              <section
                v-if="
                  ['router-content', 'intelligence-content-base-edit'].includes(
                    $route.name,
                  )
                "
                :class="[
                  'content-base__content-tab',
                  `content-base__content-tab--shape-${contentStyle}`,
                ]"
              >
                <template v-if="$route.name === 'router-content'">
                  <section>
                    <UnnnicInput
                      size="md"
                      :iconLeftClickable="true"
                      iconLeft="search-1"
                      :placeholder="
                        $t('router.content.fields.search_placeholder')
                      "
                      v-model="filterName"
                    />
                  </section>
                </template>
                <template v-if="tab === 'files' || isRouterView">
                  <UnnnicSkeletonLoading
                    v-if="
                      files.status === 'loading' &&
                      files.data.length === 0 &&
                      contentStyle !== 'accordion'
                    "
                    tag="div"
                    height="100%"
                    class="repository-base-edit__wrapper__card-content"
                  />

                  <template v-else>
                    <BasesFormFiles
                      :files.sync="files"
                      :filterText="filterName"
                      @load-more="loadFiles"
                      @removed="removedFile"
                      :shape="contentStyle"
                    />
                  </template>
                </template>

                <template v-if="tab === 'sites' || isRouterView">
                  <BasesFormSites
                    :items.sync="sites"
                    :filterText="filterName"
                    @load-more="loadSites"
                    @removed="removedSite"
                    :shape="contentStyle"
                  />
                </template>

                <section v-if="isRouterView">
                  <BasesFormGenericListHeader
                    :shape="contentStyle"
                    :open.sync="text.open"
                    :title="$t('content_bases.tabs.text')"
                  />

                  <BasesFormText
                    v-if="text.open"
                    useBrain
                    dontShowSaveButton
                    :item="text"
                    class="content-base__content-tab__text"
                  />
                </section>
              </section>

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
          </section>
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
          {{
            isRouterView
              ? $t('router.preview.title')
              : $t('content_bases.quick_test')
          }}

          <article v-if="isRouterView">
            <UnnnicDropdown
              position="bottom-left"
              :open.sync="dropdownOpen"
            >
              <section slot="trigger">
                <UnnnicIconSvg
                  icon="navigation-menu-vertical-1"
                  class="unnnic-card-intelligence__header__buttons__icon"
                  :scheme="dropdownOpen ? 'neutral-dark' : 'neutral-clean'"
                  size="sm"
                  slot="trigger"
                  clickable
                />
              </section>

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

        <section
          v-if="isRouterView && !routerTunings.brainOn"
          class="brain-deactivated-preview"
        >
          <UnnnicIcon
            size="lg"
            icon="warning"
            scheme="neutral-cloudy"
          />

          <UnnnicIntelligenceText
            tag="h2"
            family="secondary"
            color="neutral-cloudy"
            size="body-lg"
            weight="bold"
            marginTop="ant"
            marginBottom="nano"
          >
            {{ $t('router.preview.active_to_see') }}
          </UnnnicIntelligenceText>

          <UnnnicIntelligenceText
            tag="p"
            family="secondary"
            color="neutral-cloudy"
            size="body-gt"
          >
            {{ $t('router.preview.active_to_see_description') }}
          </UnnnicIntelligenceText>
        </section>

        <Tests
          v-else
          :key="refreshPreviewValue"
          :contentBaseUuid="contentBaseUuid"
          :contentBaseLanguage="contentBase.language"
          :usePreview="isRouterView"
        />
      </div>
    </section>

    <UnnnicModal
      :showModal="openModal"
      scheme="aux-yellow-500"
      modalIcon="warning"
      :text="$t('webapp.home.bases.edit-base_modal_alert_title')"
      :description="$t('webapp.home.bases.edit-base_modal_alert_description')"
      :closeIcon="false"
      class="exit-content-base-modal"
    >
      <UnnnicButton
        slot="options"
        class="create-repository__container__button"
        type="tertiary"
        @click="openModal = false"
      >
        {{ $t('webapp.home.bases.edit-base_modal_alert_discard') }}
      </UnnnicButton>
      <UnnnicButton
        slot="options"
        class="create-repository__container__button attention-button"
        type="primary"
        @click="discardUpdate()"
      >
        {{ $t('webapp.home.bases.edit-base_modal_alert_save') }}
      </UnnnicButton>
    </UnnnicModal>

    <ModalPreviewQRCode
      v-if="isMobilePreviewModalOpen"
      @close="isMobilePreviewModalOpen = false"
    />

    <ModalSaveChangesError
      v-if="$store.state.Brain.tabsWithError"
      @close="$store.state.Brain.tabsWithError = null"
    />

    <UnnnicAlert
      v-if="isAlertOpen"
      :text="$t('content_bases.changes_saved')"
      scheme="feedback-green"
      seconds="5"
      @close="isAlertOpen = false"
    />

    <BaseSettingsForm
      v-if="isEditContentBaseOpen"
      :intelligenceUuid="intelligenceUuid"
      :contentBaseUuid="contentBaseUuid"
      :preFilledValues="{
        title: contentBase.title,
        language: contentBase.language,
        description: contentBase.description,
      }"
      @close="isEditContentBaseOpen = false"
      @success="receiveUdatedContentBase"
    ></BaseSettingsForm>
  </PageContainer>
</template>

<script>
import { get } from 'lodash';
import { mapActions } from 'vuex';
import router from '@/router/index';
import Tests from './Tests.vue';
import { unnnicCallAlert } from '@weni/unnnic-system';
import PageContainer from '../../../components/PageContainer.vue';
import nexusaiAPI from '../../../api/nexusaiAPI';
import BasesFormFiles from './BasesFormFiles.vue';
import BasesFormSites from './BasesFormSites.vue';
import BasesFormText from './BasesFormText.vue';
import BaseSettingsForm from '../../../components/BaseSettingsForm.vue';
import BasesFormGenericListHeader from './BasesFormGenericListHeader.vue';
import RouterActions from './router/RouterActions.vue';
import RouterTunings from './router/RouterTunings.vue';
import RouterCustomization from './router/RouterCustomization.vue';
import ModalPreviewQRCode from './router/ModalPreviewQRCode.vue';
import ModalSaveChangesError from './router/ModalSaveChangesError.vue';

export default {
  name: 'RepositoryBaseEdit',
  components: {
    Tests,
    PageContainer,
    BasesFormFiles,
    BasesFormSites,
    BasesFormText,
    BaseSettingsForm,
    BasesFormGenericListHeader,
    RouterActions,
    RouterTunings,
    RouterCustomization,
    ModalPreviewQRCode,
    ModalSaveChangesError,
  },
  data() {
    return {
      tab: 'files',

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

      isEditContentBaseOpen: false,
      dropdownOpen: false,
      refreshPreviewValue: 0,

      loadingTitle: false,
      loadingText: false,
      repositoryUUID: null,
      isSavedModalOpen: false,

      isMobilePreviewModalOpen: false,

      openModal: false,
      localNext: null,
      bases: [],
      selectedLanguage: '',
      knowledgeBase: {
        title: '',
        oldTitle: '',
        text: {
          id: null,
          uuid: null,
          value: '',
          oldValue: '',
          language: '',
          oldLanguage: '',
          lastUpdate: '',
        },
      },
      destroyVerifying: null,
      provisoryTitle: '',
      isAlertOpen: false,

      repositoryConfig: '',
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

  methods: {
    ...mapActions([
      'createQAKnowledgeBase',
      'getQAKnowledgeBase',
      'getQATexts',
      'createQAText',
      'updateQAText',
      'editQAKnowledgeBase',
    ]),

    receiveUdatedContentBase({ title, language, description }) {
      this.contentBase.title = title;
      this.contentBase.language = language;
      this.contentBase.description = description;
    },

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

    alertError(title) {
      unnnicCallAlert({
        props: { text: title, scheme: 'feedback-red', icon: 'alert-circle-1' },
        seconds: 5,
      });
    },

    onTitleChange(event) {
      this.knowledgeBase.title = event.srcElement.textContent;
    },
    routerHandle(path) {
      if (path !== this.$router.currentRoute.name) {
        this.$router.push({
          name: `${path}`,
        });
      }
    },
    discardUpdate() {
      this.openModal = false;

      if (this.localNext) {
        this.localNext();
      }
    },
    async saveClose() {
      this.openModal = false;

      if (this.localNext) {
        this.localNext();
      }
    },
    async init() {
      const response = await this.getQAKnowledgeBase({
        repositoryUUID: this.repositoryUUID,
        id: this.$route.params.id,
      });

      this.loadingTitle = false;

      const { title } = response.data;

      this.knowledgeBase.title = title;
      this.knowledgeBase.oldTitle = title;
      this.provisoryTitle = title;
      this.knowledgeBase.text.lastUpdate = response.data.last_update;

      const responseText = await this.getQATexts({
        repositoryUUID: this.repositoryUUID,
        knowledgeBaseId: this.$route.params.id,
        page: 0,
      });

      this.loadingText = false;

      if (responseText.data.results.length) {
        const { id, language, text, knowledge_base } =
          responseText.data.results[0];

        this.repositoryConfig = [
          `Bearer ${this.repository?.authorization?.uuid}`,
          knowledge_base,
          language,
        ].join('⇝');

        this.knowledgeBase.text.id = id;
        this.knowledgeBase.text.value = text;
        this.knowledgeBase.text.oldValue = text;
        this.knowledgeBase.text.language = language;
        this.knowledgeBase.text.oldLanguage = language;
      } else {
        this.knowledgeBase.text.language = this.repository.language;
        this.knowledgeBase.text.oldLanguage = this.repository.language;
      }
    },
    formatDate(info) {
      const date = new Date(info);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const hour = date.getHours().toString().padStart(2, '0');
      return `${this.$t(
        'webapp.home.bases.edit-base-saved-at',
      )} ${day}/${month}/${year} ${this.$t(
        'webapp.home.bases.edit-base-saved-time',
      )} ${hour}h${minutes}`;
    },
    refreshPreview() {
      this.refreshPreviewValue += 1;
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

        this.knowledgeBase.text.uuid = get(
          contentBaseTextsData,
          'results.0.uuid',
          '',
        );

        this.$store.state.Brain.contentText.uuid = this.text.uuid =
          this.knowledgeBase.text.uuid;

        this.knowledgeBase.text.value = text === '--empty--' ? '' : text;
        this.knowledgeBase.text.oldValue = this.knowledgeBase.text.value;

        this.$store.state.Brain.contentText.current =
          this.$store.state.Brain.contentText.old =
            this.knowledgeBase.text.value;

        this.text.value = this.knowledgeBase.text.value;
        this.text.oldValue = this.knowledgeBase.text.oldValue;

        this.text.status = null;
      },
    },
  },
  computed: {
    shouldShowSideareaTest() {
      return (
        this.files.data.length ||
        this.sites.data.length ||
        this.knowledgeBase.text.oldValue ||
        this.isRouterView
      );
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

    isRouterView() {
      return (
        this.$route.name === 'router' || this.$route.name.startsWith('router-')
      );
    },

    contentStyle() {
      return this.isRouterView ? 'accordion' : 'normal';
    },

    tabs() {
      return [
        {
          name: 'files',
          text: this.$t('content_bases.tabs.files'),
          icon: 'news',
        },
        {
          name: 'sites',
          text: this.$t('content_bases.tabs.sites'),
          icon: 'globe',
        },
        {
          name: 'text',
          text: this.$t('content_bases.tabs.text'),
          icon: 'format_align_left',
        },
      ];
    },

    configTest() {
      if (this.$store.state.User.me.language && this.repositoryConfig) {
        return [this.$store.state.User.me.language, this.repositoryConfig].join(
          '⇝',
        );
      }

      return '';
    },

    hasUpdates() {
      if (this.knowledgeBase.title !== this.knowledgeBase.oldTitle) {
        return true;
      }

      if (
        this.knowledgeBase.text.language !== this.knowledgeBase.text.oldLanguage
      ) {
        return true;
      }

      return this.knowledgeBase.text.value !== this.knowledgeBase.text.oldValue;
    },
  },
  mounted() {
    if (this.$route.name === 'repository-content-bases-edit') {
      this.loadingTitle = true;
      this.loadingText = true;
    }

    this.destroyVerifying = router.beforeEach((to, from, next) => {
      if (this.hasUpdates) {
        this.openModal = true;
        this.localNext = next;
      } else {
        next();
      }
    });

    this.loadFiles();
    this.loadSites();

    if (this.isRouterView) {
      this.loadRouterOptions();
    }
  },

  destroyed() {
    this.destroyVerifying();
  },
};
</script>

<style lang="scss" scoped>
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

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

.router-tabs {
  margin: 0;
  padding: 0;
  display: inline-flex;
  column-gap: $unnnic-spacing-lg;

  &__tab {
    display: block;
    padding-inline: $unnnic-spacing-sm;

    color: $unnnic-color-neutral-clean;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-lg;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-bold;

    cursor: pointer;
    user-select: none;

    &--selected {
      color: $unnnic-color-neutral-darkest;
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
  ::v-deep
  .unnnic-modal-container-background-body-description-container {
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

        ::v-deep a {
          color: inherit;
          text-underline-offset: $unnnic-spacing-stack-nano;
        }
      }
    }
  }
}

::v-deep {
  .unnnic-tooltip-label-bottom {
    top: 75px !important;
  }
  .shake-me {
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
  .input.size-md {
    height: 46px;
  }

  .rpstr-vw-bs {
    margin-top: 0;
  }
}
.input.size-md {
  height: 46px;
}
</style>
