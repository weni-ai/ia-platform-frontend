<template>
  <div>
    <Loading v-if="loading" />
    <p
      v-else-if="
        filteredLanguagesStatus.length === 0 &&
        computedLanguagesStatus.length !== 0
      "
      class="has-text-centered"
    >
      {{ $t('webapp.translate.no_translated') }}
    </p>
    <div class="translations__container">
      <div
        v-for="(language, index) in filteredLanguagesStatus"
        :key="index"
        :ref="`status-${language.language}`"
        class="translations__container__status-card"
        @click="select(language)"
      >
        <h2>{{ language.verbose }}</h2>
        <UnnnicProgressBar
          :value="
            Number(language.status.base_translations.percentage.toFixed(2))
          "
          inline
          :title="$t('webapp.translate.description_progress_bar')"
        />
      </div>
      <div
        class="translations__container__new-status-card"
        @click="newLanguage()"
      >
        <UnnnicIcon
          scheme="neutral-cleanest"
          icon="add-1"
          size="xl"
        />

        <div class="u font secondary body-md color-neutral-cloudy">
          {{ $t('webapp.translate.new_status_card') }}
        </div>
      </div>
    </div>

    <UnnnicModal
      v-if="isAddLanguageModalOpen"
      :text="$t('webapp.translate.new_status_card')"
      :closeIcon="false"
      class="add-language-modal"
    >
      <template>
        <UnnnicIntelligenceText
          tag="p"
          family="secondary"
          size="body-lg"
          color="neutral-cloudy"
          marginBottom="lg"
        >
          {{ $t('webapp.translate.description_create_modal') }}
        </UnnnicIntelligenceText>

        <UnnnicFormElement
          :label="$t('webapp.translate.select_language_label')"
          class="form-element"
        >
          <UnnnicSelect
            v-model="languageSelected"
            class="select-add-modal"
          >
            <option
              v-for="[option, label] in languageList"
              :key="option"
              :value="option"
              @select="languageSelected = option"
            >
              {{ label }}
            </option>
          </UnnnicSelect>
        </UnnnicFormElement>
      </template>

      <template slot="options">
        <UnnnicButton
          type="tertiary"
          @click="isAddLanguageModalOpen = false"
        >
          {{ $t('webapp.home.cancel') }}
        </UnnnicButton>

        <UnnnicButton
          type="secondary"
          @click="addLanguage"
        >
          {{ $t('webapp.translate.button_create_modal') }}
        </UnnnicButton>
      </template>
    </UnnnicModal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { formatters, languageListToDict, LANGUAGES } from '@/utils';
import Loading from '@/components/shared/Loading';

const components = {
  Loading,
};

export default {
  name: 'TranslationsStatus',
  components,
  props: {
    repositoryUuid: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      default: null,
    },
    update: {
      type: Boolean,
      default: false,
    },
    query: {
      type: Object,
      default: () => {},
    },
    repository: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      languagesStatus: null,
      selected: this.value,
      loading: false,
      isAddLanguageModalOpen: false,
      languageSelected: '',
    };
  },
  computed: {
    ...mapGetters({
      version: 'getSelectedVersion',
    }),
    languages() {
      if (!this.languagesStatus) return {};
      return languageListToDict(Object.keys(this.languagesStatus));
    },
    languageCount() {
      if (!this.languagesStatus) return 0;
      return Object.keys(this.languagesStatus).length;
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
    filteredLanguagesStatus() {
      return this.computedLanguagesStatus
        .filter((language) => {
          if (language.status.is_base_language) return false;

          if (!this.query) return true;

          if (this.query.search && this.query.search.length > 0) {
            const search = new RegExp(
              formatters.bothubItemKey()(this.query.search),
            );
            if (!search.test(formatters.bothubItemKey()(language.verbose)))
              return false;
          }

          if (
            this.query['max-percentage'] &&
            language.status.base_translations.percentage >
              this.query['max-percentage']
          )
            return false;
          if (
            this.query['min-percentage'] &&
            language.status.base_translations.percentage <
              this.query['min-percentage']
          )
            return false;
          return true;
        })
        .sort((a, b) =>
          a.status.base_translations.percentage <
          b.status.base_translations.percentage
            ? 1
            : -1,
        );
    },
    languageList() {
      return Object.keys(LANGUAGES).map((lang) => [lang, LANGUAGES[lang]]);
    },
  },
  watch: {
    async ownerNickname() {
      await this.updateTranslationsStatus();
    },
    async repositorySlug() {
      await this.updateTranslationsStatus();
    },
    computedLanguagesStatus() {
      const completed = this.computedLanguagesStatus
        .filter(
          (status) =>
            !status.status.is_base_language &&
            status.status.base_translations.percentage >= 100,
        )
        .map((status) => status.verbose);
      this.$emit('updated', {
        completed,
        available: this.computedLanguagesStatus.map(
          (language) => language.verbose,
        ),
      });
      return completed;
    },
    selected() {
      this.$emit('input', this.selected);
    },
    update() {
      this.updateTranslationsStatus();
    },
  },
  async mounted() {
    await this.updateTranslationsStatus();
  },
  methods: {
    ...mapActions(['getRepositoryLanguagesStatus']),
    percentageStyle(percentage) {
      return {
        width: `${Math.min(percentage, 100)}%`,
      };
    },
    async updateTranslationsStatus() {
      this.loading = true;
      this.languagesStatus = null;
      try {
        const response = await this.getRepositoryLanguagesStatus({
          repositoryUUID: this.repositoryUuid,
          version: this.version,
        });
        this.languagesStatus = response.data.languages_status;
      } catch (e) {
        this.languagesStatus = null;
      } finally {
        this.loading = false;
      }
    },
    select(language) {
      this.selected = language.language;
      this.$router.push({
        name: 'repository-translate',
        params: {
          language: language.language,
          name: language.verbose,
          baseLanguage: this.repository.language,
        },
      });
    },
    newLanguage() {
      // this.$emit('addLanguage')
      this.isAddLanguageModalOpen = true;
    },
    addLanguage() {
      this.$router.push({
        name: 'repository-translate',
        params: {
          language: this.languageSelected,
          name: this.languages[this.languageSelected],
          baseLanguage: this.repository.language,
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/utilities.scss';
@import '~@/assets/scss/colors.scss';
@import '~@weni/unnnic-system/dist/unnnic.css';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.add-language-modal {
  ::v-deep .unnnic-modal-container-background-body {
    padding-top: $unnnic-spacing-giant;
  }

  ::v-deep .unnnic-modal-container-background-body-description-container {
    padding-bottom: $unnnic-spacing-xs;
  }

  .form-element {
    text-align: initial;
  }
}

.list-enter-active,
.list-leave-active {
  transition: all 1s;
}
.list-enter,
.list-leave-to {
  opacity: 0.4;
  float: bottom;
  transform: translateY(-5%);
}

.list-item:not(:last-child) {
  margin-bottom: 1rem;
}

.card {
  background-color: $color-white;
  box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  border: 1px solid $color-border;
  cursor: pointer;
  transition: box-shadow 0.2s ease, background-color 0.2s ease;
  border-radius: 4px;

  &:hover,
  &.selected {
    background-color: white;
    box-shadow: 0 0 8px rgba(100, 100, 100, 0.3);
  }

  &-percentage {
    background-color: $color-primary;
    height: 100%;
    &__wrapper {
      background-color: $color-grey-light;
      width: 100%;
      height: 1.563rem;
    }
  }

  &-count {
    text-align: right;
    color: $color-grey-dark;
  }

  &-language {
    display: flex;
    align-items: center;
    margin: 8px 0;
    justify-content: center;

    > * {
      margin-right: 8px;

      &:last-child {
        margin-right: 0;
      }
    }
  }
}
.translations {
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
      cursor: pointer;

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
}
.unnnic-select {
  :deep(.input) {
    height: 46px;
  }
  :deep(.dropdown) {
    display: block;
  }
}
</style>
