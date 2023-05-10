<template>
  <repository-view-base
    :repository="repository"
    :error-code="errorCode">
    <div v-if="!authenticated">
      <b-notification
        :closable="false"
        type="is-info">
        {{ $t('webapp.trainings.login') }}
      </b-notification>
      <login-form hide-forgot-password />
    </div>
    <authorization-request-notification
      v-else-if="repository && !repository.authorization.can_contribute"
      :available="!repository.available_request_authorization"
      :repository-uuid="repository.uuid"
      @onAuthorizationRequested="updateRepository(false)" />
    <div v-else-if="repository" class="translations">
      <div class="translations__title">
        <unnnic-card
          type="title"
          :title="$t('webapp.translate.title_status_page')"
          :hasInformationIcon="false"
          icon="translate-1"
          scheme="feedback-blue"
        />
        <p
          v-html="$t('webapp.translate.description_status_page')"
          class="translations__title-description column is-6 p-0"></p>
      </div>
      <hr class="translations__divider" />
      <p
        v-html="$t('webapp.translate.title_language_card')"
        class="translations__card-title">
      </p>
      <translations-status
        ref="translationsStatus"
        :repository="repository"
        :update="updateStatus"
        :query="statusQuery"
        :repository-uuid="repository.uuid"
        v-model="toLanguage"
        class="translations__status"
        @updated="statusUpdated"
        @addLanguage="newStatusCard"
      />
      <unnnic-modal-next
        v-if="openModal"
        type="alert"
        :title="$t('webapp.translate.new_status_card')"
        :actionPrimaryLabel="$t('webapp.translate.button_create_modal')"
        :actionSecondaryLabel="$t('webapp.home.cancel')"
        @click-action-secondary="openModal = false"
        actionPrimaryButtonType="secondary"
      >
        <template slot="description">
          {{ $t('webapp.translate.description_create_modal') }}
          <unnnic-select
            :label="$t('webapp.translate.select_language_label')"
            v-model="languages"
            class="select-add-modal"
          >
            <option
              v-for="[option, label] in languageList"
              :key="option"
              :value="option"
              @select="languages = option"
            >
              {{ label }}
            </option>
          </unnnic-select>
        </template>
      </unnnic-modal-next>
    </div>
    <template v-slot:loader>
      <translations-loader />
    </template>
  </repository-view-base>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import AuthorizationRequestNotification from '@/components/repository/AuthorizationRequestNotification';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import TranslationsStatus from '@/components/translate/NewTranslationsStatus';
import TranslationStatusInfo from '@/components/translate/TranslationStatusInfo';
import TranslationStatusSearch from '@/components/translate/TranslationStatusSearch';
import TranslationsList from '@/components/translate/TranslationsList';
import LoginForm from '@/components/auth/LoginForm';
import RepositoryBase from './Base';
import { LANGUAGES } from '@/utils';
import TranslationsLoader from '@/views/repository/loadings/Translations';

export default {
  name: 'RepositoryTranslations',
  components: {
    RepositoryViewBase,
    TranslationsStatus,
    TranslationsList,
    TranslationStatusInfo,
    AuthorizationRequestNotification,
    TranslationStatusSearch,
    LoginForm,
    TranslationsLoader
  },
  extends: RepositoryBase,
  props: {
    defaultLanguageField: {
      type: String,
      default: LANGUAGES[Object.keys(LANGUAGES)[0]],
    },
    repositoryUuid: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      toLanguage: null,
      statusQuery: null,
      updateStatus: false,
      availableLanguages: null,
      completedLanguages: null,
      translate: {
        from: null,
        to: null,
      },
      openModal: false,
      languages: this.defaultLanguageField,
      languagesStatus: null,
      selected: this.value,
    };
  },
  computed: {
    ...mapGetters([
      'authenticated',
      'getSelectedVersion'
    ]),
    languageList() {
      return Object.keys(LANGUAGES)
        .map(lang => ([lang, LANGUAGES[lang]]));
    },
    filteredLanguagesStatus() {
      if (!this.languagesStatus) {
        return [];
      }
      return Object.keys(this.languagesStatus)
        .map(language => ({
          language,
          status: this.languagesStatus[language],
          selected: this.selected === language,
        }))
        .filter(languageStatus => (!languageStatus.status.is_base_language))
        .sort((a, b) => (
          a.status.base_translations.percentage
          < b.status.base_translations.percentage));
    },
    computedLanguagesStatus() {
      if (!this.languagesStatus) {
        return [];
      }
      return Object.keys(this.languagesStatus)
        .map(language => ({
          language,
          status: this.languagesStatus[language],
          verbose: this.languages[language],
          selected: this.selected === language,
        }))
        .filter(languageStatus => (languageStatus.status.is_base_language
        || languageStatus.status.base_translations.percentage > 0));
    },
  },
  methods: {
    ...mapActions([
      'getRepository',
      'getRepositoryLanguagesStatus',
    ]),
    async updateTranslationsStatus() {
      this.loading = true;
      this.languagesStatus = null;
      try {
        const response = await this.getRepositoryLanguagesStatus({
          repositoryUUID: this.repositoryUuid,
          version: this.getSelectedVersion,
        });
        this.languagesStatus = response.data.languages_status;
      } catch (e) {
        this.languagesStatus = null;
      } finally {
        this.loading = false;
      }
    },
    select(language) {
      this.selected = language;
    },
    statusUpdated({ completed, available }) {
      this.completedLanguages = completed;
      this.availableLanguages = available;
    },
    exampleUpdated() {
      this.updateStatus = !this.updateStatus;
    },
    newStatusCard() {
      this.openModal = true;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.translations {
  font-family: $unnnic-font-family-secondary;
  color: $unnnic-color-neutral-dark;
  font-size: $unnnic-font-size-body-gt;

  &__title-description {
    margin-top: $unnnic-spacing-stack-sm;
  }

  &__divider {
    background: $unnnic-color-neutral-soft;
    margin: $unnnic-spacing-stack-lg 0;
    height: 1px;
  }

  &__card-title {
    margin-bottom: $unnnic-spacing-stack-sm;
  }

  &__container {
    display: flex;
    gap: $unnnic-spacing-stack-sm;
    flex-wrap: wrap;

    &__status-card, &__new-status-card {
      width: 332px;
      height: 106px;
      padding: 24px;
      border: 1px solid $unnnic-color-neutral-soft;
      border-radius: 8px;

      h2 {
        font-family: $unnnic-font-family-secondary;
        color: $unnnic-color-neutral-darkest;
        font-weight: 700;
        font-size: $unnnic-font-size-body-lg;
      }

      .unnnic-progress-bar.primary {
        background-color: #fff;
        box-shadow: none;
        padding: 0px;

        /deep/ .progress-bar-container .progress-container {
          min-width: 100px;
          height: 4px;
        }

        /deep/ .title {
          font-size: 12px;
        }
      }
    }

    &__new-status-card {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      .unnnic-icon {
        margin-bottom: $unnnic-spacing-stack-sm;
      }
    }
  }

  .select-add-modal {
    text-align: left;
    margin-top: $unnnic-spacing-stack-lg,
  }

  .unnnic-select {
    /deep/ .input {
      height: 46px;
    }
    /deep/ .dropdown {
      display: block;
    }
  }
  /deep/ .unnnic-modal.type-alert .title{
    padding-bottom: 0px
  }
}
</style>
