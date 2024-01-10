<template>
  <div class="content-bases-page-container">
    <section class="repository-base-edit">
      <section class="repository-base-edit__header">
        <unnnic-button
          size="small"
          type="tertiary"
          icon-center="arrow_left_alt"
          scheme="neutral-dark"
          @click="routerHandle('repository-content-bases')"
        />

        <div>
          <div class="repository-base-edit__header--content">
            <unnnic-skeleton-loading
              v-if="loadingTitle"
              tag="div"
              width="180px"
              height="28px"
            />

            <h1
              v-else
              ref="focusInput"
              class="repository-base-edit__title"
              contenteditable="true"
              @input="onTitleChange"
              id="titleId"
            >
              {{ provisoryTitle }}
            </h1>
          </div>
        </div>
      </section>
    </section>
    <section class="repository-base-edit__wrapper">
      <unnnic-skeleton-loading
        v-if="loadingText"
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
            @click="saveText()"
            size="small"
            class="repository-base-edit__wrapper__card-content__header__save-button"
            :disabled="!knowledgeBase.text.value.trim()"
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
        ></textarea>

        <div
          v-if="!knowledgeBase.text.value.trim()"
          class="repository-base-edit__wrapper__card-content__info"
        >
          <unnnic-icon icon="help" size="sm" scheme="neutral-cloudy" />

          <span v-html="$t('content_bases.write_content_help')"></span>
        </div>
      </div>
      <div
        :class="[
          'repository-base-edit__wrapper__card',
          'repository-base-edit__wrapper__card-test-container'
        ]"
      >
        <div class="repository-base-edit__wrapper__card-test-container__header">
          {{ $t('content_bases.quick_test') }}
        </div>

        <tests
          v-if="configTest"
          :config="configTest"
        />
      </div>
    </section>

    <unnnic-modal
      :show-modal="openModal"
      scheme="feedback-yellow"
      modal-icon="warning"
      :text="$t('webapp.home.bases.edit-base_modal_alert_title')"
      :description="$t('webapp.home.bases.edit-base_modal_alert_description')"
      :close-icon="false"
    >
      <unnnic-button
        slot="options"
        class="create-repository__container__button"
        type="terciary"
        @click="discardUpdate()"
      >
        {{ $t("webapp.home.bases.edit-base_modal_alert_discard") }}
      </unnnic-button>
      <unnnic-button
        slot="options"
        class="create-repository__container__button"
        type="primary"
        scheme="feedback-yellow"
        @click="saveClose()"
        :loading="submitting"
      >
        {{ $t("webapp.home.bases.edit-base_modal_alert_save") }}
      </unnnic-button>
    </unnnic-modal>
    <unnnic-alert
      v-if="isAlertOpen"
      :text="$t('content_bases.changes_saved')"
      scheme="feedback-green"
      seconds="5"
      @close="isAlertOpen = false"
    />
  </div>
</template>

<script>
import { get } from 'lodash';
import { mapActions } from 'vuex';
import { LANGUAGES } from '@/utils/index';
import router from '@/router/index';
import Tests from './Tests';
import { unnnicCallAlert } from '@weni/unnnic-system';
import LoadRepository from '../../../utils/LoadRepository';
import RemoveBulmaMixin from '../../../utils/RemoveBulmaMixin';

export default {
  name: 'RepositoryBaseEdit',
  components: {
    Tests
  },
  mixins: [LoadRepository, RemoveBulmaMixin],
  data() {
    return {
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
          value: '',
          oldValue: '',
          language: '',
          oldLanguage: '',
          lastUpdate: ''
        }
      },
      destroyVerifying: null,
      provisoryTitle: '',
      languages: LANGUAGES,
      isAlertOpen: false,

      repositoryConfig: '',
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

    alertError(title) {
      unnnicCallAlert({ props: { title, scheme: 'feedback-red', icon: 'alert-circle-1', }, seconds: 5 });
    },

    onTitleChange(event) {
      this.knowledgeBase.title = event.srcElement.textContent;
    },
    routerHandle(path) {
      if (path !== this.$router.currentRoute.name) {
        this.$router.push({
          name: `${path}`
        });
      }
    },
    async saveText() {
      if (this.$route.name === 'repository-content-bases-new') {
        const response = await this.createQAKnowledgeBase({
          repositoryUUID: this.repositoryUUID,
          title: this.knowledgeBase.title
        });
        this.knowledgeBase.oldTitle = response.data.title;

        this.destroyVerifying();

        this.$router.push({
          name: 'repository-content-bases-edit',
          params: {
            id: response.data.id
          }
        });

        this.init();
      }

      const data = {
        id: this.knowledgeBase.text.id,
        repositoryUUID: this.repositoryUUID,
        knowledgeBaseId: this.$route.params.id,
        text: this.knowledgeBase.text.value,
        language: this.knowledgeBase.text.language
      };


      try {
        this.submitting = true;

        const responseEditKnowledgeBase = await this.editQAKnowledgeBase({
          repositoryUUID: this.repositoryUUID,
          id: this.$route.params.id,
          title: this.knowledgeBase.title
        });

        this.knowledgeBase.oldTitle = responseEditKnowledgeBase.data.title;

        if (data.text) {
          const action = data.id ? this.updateQAText : this.createQAText;

          const responseText = await action(data);

          if (!this.knowledgeBase.text.id) {
            this.knowledgeBase.text.id = responseText.data.id;
          }

          this.knowledgeBase.text.oldValue = responseText.data.text;
          this.knowledgeBase.text.oldLanguage = responseText.data.language;
          this.knowledgeBase.text.lastUpdate = responseText.data.last_update;
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
        id: this.$route.params.id
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
        page: 0
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
      const day = date
        .getDate()
        .toString()
        .padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const minutes = date
        .getMinutes()
        .toString()
        .padStart(2, '0');
      const hour = date
        .getHours()
        .toString()
        .padStart(2, '0');
      return `${this.$t('webapp.home.bases.edit-base-saved-at')} ${day}/${month}/${year} ${this.$t(
        'webapp.home.bases.edit-base-saved-time'
      )} ${hour}h${minutes}`;
    },
    goToTests() {
      this.$router.push({
        name: 'repository-content-tests'
      });
    }
  },
  watch: {
    // eslint-disable-next-line
    repository: {
      handler() {
        if (
          !this.repository?.language
          || !this.repository?.uuid
          || this.repository?.uuid === 'null'
        ) {
          return false;
        }

        this.repositoryUUID = this.repository.uuid;

        return true;
      },

      deep: true,
      immediate: true
    },
    async repositoryUUID() {
      if (this.$route.name === 'repository-content-bases-edit') {
        this.init();
      } else {
        this.provisoryTitle = this.$t('webapp.home.bases.edit-base-notitle');
        this.knowledgeBase.title = this.provisoryTitle;
        this.knowledgeBase.text.language = this.repository.language;
        this.knowledgeBase.text.oldLanguage = this.repository.language;
      }
    }
  },
  computed: {
    configTest() {
      if (this.$store.state.User.me.language && this.repositoryConfig) {
        return [this.$store.state.User.me.language, this.repositoryConfig].join('⇝');
      }

      return '';
    },

    hasUpdates() {
      if (this.knowledgeBase.title !== this.knowledgeBase.oldTitle) {
        return true;
      }

      if (this.knowledgeBase.text.language !== this.knowledgeBase.text.oldLanguage) {
        return true;
      }

      return this.knowledgeBase.text.value !== this.knowledgeBase.text.oldValue;
    }
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
  },

  destroyed() {
    this.destroyVerifying();
  }
};
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

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
  &__title {
    border: none;
    margin-right: $unnnic-inset-nano;
    padding: 0;
    margin: 0;

    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-title-sm;
    line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-bold;

    &:focus {
      border: none;
      border-radius: 2pt;
      box-shadow: 0 0 0 1pt grey;
      outline: none;
      transition: 0.1s;
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
        border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-cleanest;
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
        padding-block: $unnnic-spacing-xs ($unnnic-spacing-xs - $unnnic-border-width-thinner);
        padding-inline: $unnnic-spacing-sm - $unnnic-border-width-thinner;

        background-color: $unnnic-color-neutral-light;
        border: $unnnic-border-width-thinner solid $unnnic-color-neutral-cleanest;
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
      content: "\10A50";
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
