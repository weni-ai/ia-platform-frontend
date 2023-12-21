<template>
  <repository-view-base class="mb-6" :repository="repository" :error-code="errorCode">
    <section class="repository-base-edit">
      <section class="repository-base-edit__header">
        <span @click="routerHandle('repository-content-bases')">
          <unnnic-icon-svg icon="keyboard-arrow-left-1" />
        </span>
        <div>
          <div class="repository-base-edit__header--content">
            <h1
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
      <div class="repository-base-edit__wrapper__card column is-8 pb-4">
        <div class="repository-base-edit__wrapper__card__header">
          <h1
          class="u font secondary body-lg bold"
          v-html="'Escrever conteúdo'"
          />
          <unnnic-button :loading="submitting" @click="saveText()" class="ml-auto">
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
        />
      </div>
      <div
        class="repository-base-edit__wrapper__card column is-4 p-0"
      >
        <tests />
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
      :text="$t('webapp.home.bases.adjustments_modal_description')"
      scheme="feedback-green"
      seconds="5"
      @close="isAlertOpen = false"
    />
  </repository-view-base>
</template>

<script>
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import RepositoryBase from '../Base';
import { mapActions } from 'vuex';
import { LANGUAGES } from '@/utils/index';
import router from '@/router/index';
import Tests from './Tests';

export default {
  name: 'RepositoryBaseEdit',
  components: {
    RepositoryViewBase,
    Tests
  },
  extends: RepositoryBase,
  data() {
    return {
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
      isAlertOpen: false
    };
  },
  methods: {
    ...mapActions([
      'createQAKnowledgeBase',
      'getQAKnowledgeBase',
      'getQATexts',
      'createQAText',
      'updateQAText',
      'editQAKnowledgeBase'
    ]),
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
        this.isAlertOpen = true;
      }

      this.submitting = false;
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

      if (responseText.data.results.length) {
        const { id, language, text } = responseText.data.results[0];

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
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.repository-base-edit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  &__header {
    display: flex;
    align-items: flex-start;
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
    font-family: $unnnic-font-family-primary;
    font-size: $unnnic-font-size-title-sm;
    margin-right: $unnnic-inset-nano;
    padding: 0 4px;
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

  &__textarea {
    width: 100%;
    resize: none;
    height: 90%;
    margin-top: $unnnic-spacing-sm;
    font-family: $unnnic-font-family-primary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-lg;
    line-height: 29px;
    // text-align: justify;
    color: $unnnic-color-neutral-dark;
    border: none;
    &:focus {
      border: none;
      outline: none;
    }
    &::-webkit-scrollbar {
      margin-right: $unnnic-inset-sm;
    }
  }
  .input.size-md {
    height: 46px;
  }
  /deep/.input.size-md {
    height: 46px;
  }

  &__wrapper {
    display: flex;
    gap: $unnnic-spacing-sm;
    margin-top: $unnnic-spacing-md;

    &__card {
      border: 1px solid #E2E6ED;
      border-radius: 8px;
      padding: $unnnic-spacing-sm;

      &__header {
        display: flex;
        align-items: center;
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
