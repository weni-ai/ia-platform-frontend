<template>
  <page-container
    :loading-title="loadingContentBase"
    :title="contentBase.title"
    @back="
      $router.push({
        name: 'intelligence-home',
        params: {
          intelligenceUuid: $route.params.intelligenceUuid,
        },
      })
    "
  >
    <section class="repository-base-edit__wrapper">
      <div class="repository-base-edit__wrapper__left-side">
        <section class="base-tabs">
          <div
            v-for="{ name, text, icon, counter } in tabs"
            :key="name"
            :class="[
              'base-tabs__tab',
              { 'base-tabs__tab--active': tab === name },
            ]"
            @click="tab = name"
          >
            <unnnic-icon
              :icon="icon"
              scheme="weni-600"
              size="avatar-nano"
              class="base-tabs__tab__icon"
            />

            {{ text }}

            <div v-if="counter" class="base-tabs__tab__counter">
              {{ counter }}
            </div>
          </div>
        </section>

        <template v-if="tab === 'files'">
          <unnnic-skeleton-loading
            v-if="files.status === 'loading' && files.data.length === 0"
            tag="div"
            height="100%"
            class="repository-base-edit__wrapper__card-content"
          />

          <template v-else>
            <bases-form-files
              :files.sync="files"
              :flat-bottom="!files.data.length"
              @load-more="loadFiles"
              @removed="removedFile"
            />

            <div
              v-if="!files.data.length && false"
              class="repository-base-edit__wrapper__card-content__info"
            >
              <unnnic-icon icon="help" size="sm" scheme="neutral-cloudy" />

              <span v-html="$t('content_bases.write_content_help')"></span>
            </div>
          </template>
        </template>

        <template v-if="tab === 'text'">
          <unnnic-skeleton-loading
            v-if="loadingContentBaseText"
            tag="div"
            height="100%"
            class="repository-base-edit__wrapper__card-content"
          />

          <div
            v-else
            :class="[
              'repository-base-edit__wrapper__card',
              'repository-base-edit__wrapper__card-content',
            ]"
          >
            <div class="repository-base-edit__wrapper__card-content__header">
              {{ $t('content_bases.write_content') }}

              <unnnic-button
                :loading="submitting"
                @click="saveText"
                size="small"
                class="repository-base-edit__wrapper__card-content__header__save-button"
                :disabled="
                  !knowledgeBase.text.value.trim() ||
                  knowledgeBase.text.value === knowledgeBase.text.oldValue
                "
              >
                {{ $t('webapp.settings.save') }}
              </unnnic-button>
            </div>

            <textarea
              v-model="knowledgeBase.text.value"
              name=""
              id="textId"
              cols="30"
              rows="10"
              class="repository-base-edit__textarea"
              :placeholder="$t('content_bases.write_content_placeholder')"
            ></textarea>

            <div
              v-if="!knowledgeBase.text.value.trim() && false"
              class="repository-base-edit__wrapper__card-content__info"
            >
              <unnnic-icon icon="help" size="sm" scheme="neutral-cloudy" />

              <span v-html="$t('content_bases.write_content_help')"></span>
            </div>
          </div>
        </template>
      </div>

      <div
        :class="[
          'repository-base-edit__wrapper__card',
          'repository-base-edit__wrapper__card-test-container',
        ]"
      >
        <div class="repository-base-edit__wrapper__card-test-container__header">
          {{ $t('content_bases.quick_test') }}
        </div>

        <tests :content-base-uuid="$route.params.contentBaseUuid" />
      </div>
    </section>

    <unnnic-modal
      :show-modal="openModal"
      scheme="aux-yellow-500"
      modal-icon="warning"
      :text="$t('webapp.home.bases.edit-base_modal_alert_title')"
      :description="$t('webapp.home.bases.edit-base_modal_alert_description')"
      :close-icon="false"
      class="exit-content-base-modal"
    >
      <unnnic-button
        slot="options"
        class="create-repository__container__button"
        type="tertiary"
        @click="openModal = false"
      >
        {{ $t('webapp.home.bases.edit-base_modal_alert_discard') }}
      </unnnic-button>
      <unnnic-button
        slot="options"
        class="create-repository__container__button attention-button"
        type="primary"
        @click="discardUpdate()"
      >
        {{ $t('webapp.home.bases.edit-base_modal_alert_save') }}
      </unnnic-button>
    </unnnic-modal>
    <unnnic-alert
      v-if="isAlertOpen"
      :text="$t('content_bases.changes_saved')"
      scheme="feedback-green"
      seconds="5"
      @close="isAlertOpen = false"
    />
  </page-container>
</template>

<script>
import { get } from 'lodash';
import { mapActions } from 'vuex';
import { LANGUAGES } from '@/utils/index';
import router from '@/router/index';
import Tests from './Tests';
import { unnnicCallAlert } from '@weni/unnnic-system';
import RemoveBulmaMixin from '../../../utils/RemoveBulmaMixin';
import PageContainer from '../../../components/PageContainer';
import nexusaiAPI from '../../../api/nexusaiAPI';
import BasesFormFiles from './BasesFormFiles';

export default {
  name: 'RepositoryBaseEdit',
  components: {
    Tests,
    PageContainer,
    BasesFormFiles,
  },
  mixins: [RemoveBulmaMixin],
  data() {
    return {
      tab: 'files',

      loadingContentBase: false,
      loadingContentBaseText: false,

      contentBase: {
        title: '',
      },

      loadingTitle: false,
      loadingText: false,
      repositoryUUID: null,
      isSavedModalOpen: false,
      openModal: false,
      localNext: null,
      bases: [],
      submitting: false,
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
      languages: LANGUAGES,
      isAlertOpen: false,

      repositoryConfig: '',

      files: {
        status: null,
        next: null,
        data: [],
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

    removedFile(fileUuid) {
      this.files.data = this.files.data.filter(({ uuid }) => uuid !== fileUuid);
    },

    async loadFiles() {
      this.files.status = 'loading';

      const { data } = await nexusaiAPI.intelligences.contentBases.files.list({
        contentBaseUuid: this.$route.params.contentBaseUuid,
        next: this.files.next,
      });

      this.files.data = this.files.data.concat(
        data.results
          .map((file) => ({
            ...file,
            status: file.status === 'success' ? 'uploaded' : 'processing',
          }))
          .filter(
            ({ uuid }) => !this.files.data.some((alreadyIn) => alreadyIn.uuid === uuid),
          ),
      );

      this.files.next = data.next;

      this.files.status = null;

      if (!data.next) {
        this.files.status = 'complete';
      }
    },

    alertError(title) {
      unnnicCallAlert({
        props: { title, scheme: 'feedback-red', icon: 'alert-circle-1' },
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
    async saveText() {
      if (this.$route.name === 'repository-content-bases-new') {
        const response = await this.createQAKnowledgeBase({
          repositoryUUID: this.repositoryUUID,
          title: this.knowledgeBase.title,
        });
        this.knowledgeBase.oldTitle = response.data.title;

        this.destroyVerifying();

        this.$router.push({
          name: 'repository-content-bases-edit',
          params: {
            id: response.data.id,
          },
        });

        this.init();
      }

      const data = {
        id: this.knowledgeBase.text.id,
        repositoryUUID: this.repositoryUUID,
        knowledgeBaseId: this.$route.params.id,
        text: this.knowledgeBase.text.value,
        language: this.knowledgeBase.text.language,
      };

      try {
        this.submitting = true;

        if (this.knowledgeBase.text.uuid) {
          const { data: contentBaseTextData } = await nexusaiAPI.updateIntelligenceContentBaseText({
            contentBaseUuid: this.$route.params.contentBaseUuid,
            contentBaseTextUuid: this.knowledgeBase.text.uuid,
            text: this.knowledgeBase.text.value,
          });

          this.knowledgeBase.text.oldValue = contentBaseTextData.text;
        } else {
          const { data: contentBaseTextData } = await nexusaiAPI.createIntelligenceContentBaseText({
            contentBaseUuid: this.$route.params.contentBaseUuid,
            text: this.knowledgeBase.text.value,
          });

          this.knowledgeBase.text.uuid = contentBaseTextData.uuid;
          this.knowledgeBase.text.oldValue = contentBaseTextData.text;
        }

        this.isAlertOpen = true;
      } catch (error) {
        const errorMessage = get(error, 'response.data.text.0', '');

        if (errorMessage) {
          this.alertError(errorMessage);
        }
      } finally {
        this.submitting = false;
      }
    },
    discardUpdate() {
      this.openModal = false;

      if (this.localNext) {
        this.localNext();
      }
    },
    async saveClose() {
      await this.saveText();
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
        const { id, language, text, knowledge_base } = responseText.data.results[0];

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
    goToTests() {
      this.$router.push({
        name: 'repository-content-tests',
      });
    },
  },
  watch: {
    '$route.params.intelligenceUuid': {
      immediate: true,

      async handler() {
        this.loadingContentBase = true;
        this.loadingContentBaseText = true;

        const { data: contentBaseData } = await nexusaiAPI.readIntelligenceContentBase({
          intelligenceUuid: this.$route.params.intelligenceUuid,
          contentBaseUuid: this.$route.params.contentBaseUuid,
        });

        this.loadingContentBase = false;

        this.contentBase.title = contentBaseData.title;

        const { data: contentBaseTextsData } = await nexusaiAPI.listIntelligenceContentBaseTexts({
          contentBaseUuid: this.$route.params.contentBaseUuid,
        });

        const text = get(contentBaseTextsData, 'results.0.text', '');

        this.knowledgeBase.text.uuid = get(
          contentBaseTextsData,
          'results.0.uuid',
          '',
        );

        this.knowledgeBase.text.value = text === '--empty--' ? '' : text;
        this.knowledgeBase.text.oldValue = this.knowledgeBase.text.value;

        this.loadingContentBaseText = false;
      },
    },
  },
  computed: {
    tabs() {
      return [
        {
          name: 'files',
          text: this.$t('content_bases.tabs.files'),
          icon: 'news',
          counter: this.files.next ? '10+' : this.files.data.length,
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
  },

  destroyed() {
    this.destroyVerifying();
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

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

    &__counter {
      color: $unnnic-color-neutral-clean;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
      border-radius: $unnnic-border-radius-sm;
      background-color: $unnnic-color-neutral-soft;
      padding: 0.0625 * $unnnic-font-size $unnnic-spacing-xs;
      margin-left: auto;
    }

    &--active {
      outline-color: $unnnic-color-weni-600;
      color: $unnnic-color-weni-600;

      .base-tabs__tab__icon {
        color: $unnnic-color-weni-600;
      }

      .base-tabs__tab__counter {
        color: $unnnic-color-weni-600;
        background-color: $unnnic-color-weni-100;
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
.content-bases-page-container {
  padding: $unnnic-spacing-md $unnnic-font-size * 8;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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
  /deep/.input.size-md {
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

      width: 18.4375 * $unnnic-font-size;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;

      &__header {
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
          width: 10.625 * $unnnic-font-size;
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

  &__textarea {
    resize: none;
    flex: 1;
    padding: $unnnic-spacing-sm;
    padding-top: 4.375 * $unnnic-font-size;
    margin: 0;
    font-family: $unnnic-font-family-primary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-lg;

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

    color: $unnnic-color-neutral-dark;
    border: none;

    border-radius: $unnnic-border-radius-sm;

    // &:not(:last-child) {
    //   border-radius: $unnnic-border-radius-sm $unnnic-border-radius-sm 0 0;
    // }

    outline-style: solid;
    outline-color: $unnnic-color-neutral-cleanest;
    outline-width: $unnnic-border-width-thinner;
    outline-offset: -$unnnic-border-width-thinner;

    &:focus {
      outline-color: $unnnic-color-neutral-clean;
    }

    &::-webkit-scrollbar {
      margin-right: $unnnic-inset-sm;
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
