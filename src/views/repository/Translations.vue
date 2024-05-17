<template>
  <RepositoryViewBase
    :repository="repository"
    :errorCode="errorCode"
  >
    <div v-if="!authenticated">
      <BNotification
        :closable="false"
        type="is-info"
      >
        {{ $t('webapp.trainings.login') }}
      </BNotification>
      <LoginForm hideForgotPassword />
    </div>
    <AuthorizationRequestNotification
      v-else-if="repository && !repository.authorization.can_contribute"
      :available="!repository.available_request_authorization"
      :repositoryUuid="repository.uuid"
      @onAuthorizationRequested="updateRepository(false)"
    />
    <div
      v-else-if="repository"
      class="translations"
    >
      <UnnnicIntelligenceHeader
        class="repository-analyze-text__header"
        :title="$t('webapp.translate.title_status_page')"
        icon="translate-1"
        iconScheme="feedback-blue"
        :description="$t('webapp.translate.description_status_page')"
      />

      <UnnnicDivider ySpacing="lg" />

      <UnnnicIntelligenceText
        tag="p"
        family="secondary"
        size="body-gt"
        color="neutral-dark"
        marginBottom="sm"
      >
        {{ $t('webapp.translate.title_language_card') }}
      </UnnnicIntelligenceText>

      <TranslationsStatus
        ref="translationsStatus"
        :repository="repository"
        :update="updateStatus"
        :query="statusQuery"
        :repositoryUuid="repository.uuid"
        v-model="toLanguage"
        class="translations__status"
        @updated="statusUpdated"
        @addLanguage="newStatusCard"
      />

      <!-- <unnnic-modal
        v-if="isAddLanguageModalOpen"
        type="alert"
        :text="$t('webapp.translate.new_status_card')"
        :close-icon="false"
        class="add-language-modal"
      >
        <template>
          <unnnic-intelligence-text
            tag="p"
            family="secondary"
            size="body-lg"
            color="neutral-cloudy"
            margin-bottom="lg"
          >
            {{ $t('webapp.translate.description_create_modal') }}
          </unnnic-intelligence-text>

          <unnnic-form-element
            :label="$t('webapp.translate.select_language_label')"
          >
            <unnnic-select
              v-model="languages"
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
          </unnnic-form-element>
        </template>

        <template slot="options">
          <unnnic-button
            type="tertiary"
            @click="isAddLanguageModalOpen = false"
          >
            {{ $t('webapp.home.cancel') }}
          </unnnic-button>

          <unnnic-button type="secondary">
            {{ $t('webapp.translate.button_create_modal') }}
          </unnnic-button>
        </template>
      </unnnic-modal> -->
    </div>
    <template v-slot:loader>
      <TranslationsLoader />
    </template>
  </RepositoryViewBase>
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
    TranslationsLoader,
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
      isAddLanguageModalOpen: false,
      languages: this.defaultLanguageField,
      languagesStatus: null,
      selected: this.value,
    };
  },
  computed: {
    ...mapGetters(['authenticated', 'getSelectedVersion']),
    languageList() {
      return Object.keys(LANGUAGES).map((lang) => [lang, LANGUAGES[lang]]);
    },
    filteredLanguagesStatus() {
      if (!this.languagesStatus) {
        return [];
      }
      return Object.keys(this.languagesStatus)
        .map((language) => ({
          language,
          status: this.languagesStatus[language],
          selected: this.selected === language,
        }))
        .filter((languageStatus) => !languageStatus.status.is_base_language)
        .sort(
          (a, b) =>
            a.status.base_translations.percentage <
            b.status.base_translations.percentage,
        );
    },
    computedLanguagesStatus() {
      if (!this.languagesStatus) {
        return [];
      }
      return Object.keys(this.languagesStatus)
        .map((language) => ({
          language,
          status: this.languagesStatus[language],
          verbose: this.languages[language],
          selected: this.selected === language,
        }))
        .filter(
          (languageStatus) =>
            languageStatus.status.is_base_language ||
            languageStatus.status.base_translations.percentage > 0,
        );
    },
  },
  methods: {
    ...mapActions(['getRepository', 'getRepositoryLanguagesStatus']),
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
      this.isAddLanguageModalOpen = true;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.translations {
  font-family: $unnnic-font-family-secondary;
  color: $unnnic-color-neutral-dark;
  font-size: $unnnic-font-size-body-gt;

  &__card-title {
    margin-bottom: $unnnic-spacing-stack-sm;
  }

  &__container {
    display: flex;
    gap: $unnnic-spacing-stack-sm;
    flex-wrap: wrap;

    &__status-card,
    &__new-status-card {
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

        :deep(.progress-bar-container .progress-container) {
          min-width: 100px;
          height: 4px;
        }

        :deep(.title) {
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

  .unnnic-select {
    :deep(.input) {
      height: 46px;
    }
    :deep(.dropdown) {
      display: block;
    }
  }
  :deep(.unnnic-modal.type-alert .title) {
    padding-bottom: 0px;
  }
}
</style>
