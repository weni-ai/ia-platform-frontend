<template>
  <div>
    <loading
      v-if="loading" />
    <!-- <transition-group
      name="list"
      mode="out-in"
      tag="div"> -->
      <div class="translations__container">
        <div
          v-for="(language, index) in filteredLanguagesStatus"
          :key="index"
          :ref="`status-${language.language}`"
          class="translations__container__status-card column is-4"
          @click="select(language)">
          <!-- <div class="columns is-vcentered">
            <p class="card-language has-text-centered column is-2">
              <span>{{ verbose }}</span>
            </p>
            <div
              :class="{ selected }"
              class="column is-9">
              <div class="card-percentage__wrapper">
                <div
                  :style="percentageStyle(status.base_translations.percentage)"
                  class="card-percentage" />
              </div>
            </div>
            <strong class="column has-text-centered is-1">
              {{ Number(status.base_translations.percentage.toFixed(2)) }}%
            </strong>
          </div> -->
          <h2>{{ language.verbose }}</h2>
          <unnnic-progress-bar
            :value="Number(language.status.base_translations.percentage.toFixed(2))"
            inline
            :title="$t('webapp.translate.description_progress_bar')" />
        </div>
        <unnnic-card
          clickable
          :text="$t('webapp.translate.new_status_card')"
          type="blank"
          icon="add-1"
          class="translations__container__new-status-card column is-4"
          @click.native="newLanguage()"
        />
      </div>
    <!-- </transition-group> -->
    <!-- <p
      v-show="!loading && filteredLanguagesStatus.length > 0"
      class="card-count">
      {{ $t('webapp.translate.showing',
            { available: languageCount, count: filteredLanguagesStatus.length }) }}
    </p> -->
    <unnnic-modal-next
        v-if="openModal"
        type="alert"
        :title="$t('webapp.translate.new_status_card')"
        :actionPrimaryLabel="$t('webapp.translate.button_create_modal')"
        :actionSecondaryLabel="$t('webapp.home.cancel')"
        @click-action-secondary="openModal = false"
        @click-action-primary="addLanguage"
        actionPrimaryButtonType="secondary"
      >
        <template slot="description">
          {{ $t('webapp.translate.description_create_modal') }}
          <unnnic-select
            :label="$t('webapp.translate.select_language_label')"
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
          </unnnic-select>
        </template>
      </unnnic-modal-next>
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
  },
  data() {
    return {
      languagesStatus: null,
      selected: this.value,
      loading: false,
      openModal: false,
      languageSelected: ''
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
        .map(language => ({
          language,
          status: this.languagesStatus[language],
          verbose: this.languages[language],
          selected: this.selected === language,
        }))
        .filter(languageStatus => (languageStatus.status.is_base_language
        || languageStatus.status.base_translations.percentage > 0));
    },
    filteredLanguagesStatus() {
      return this.computedLanguagesStatus.filter((language) => {
        if (language.status.is_base_language) return false;

        if (!this.query) return true;

        if (this.query.search && this.query.search.length > 0) {
          const search = new RegExp(formatters.bothubItemKey()(this.query.search));
          if (!search.test(formatters.bothubItemKey()(language.verbose))) return false;
        }

        if (this.query['max-percentage']
          && language.status.base_translations.percentage > this.query['max-percentage']) return false;
        if (this.query['min-percentage']
          && language.status.base_translations.percentage < this.query['min-percentage']) return false;
        return true;
      })
        .sort((a, b) => (
          a.status.base_translations.percentage
          < b.status.base_translations.percentage ? 1 : -1));
    },
    languageList() {
      return Object.keys(LANGUAGES)
        .map(lang => ([lang, LANGUAGES[lang]]));
    },
  },
  watch: {
    async ownerNickname() { await this.updateTranslationsStatus(); },
    async repositorySlug() { await this.updateTranslationsStatus(); },
    computedLanguagesStatus() {
      const completed = this.computedLanguagesStatus
        .filter(status => !status.status.is_base_language
          && status.status.base_translations.percentage >= 100)
        .map(status => status.verbose);
      this.$emit('updated', {
        completed,
        available: this.computedLanguagesStatus.map(language => language.verbose),
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
    ...mapActions([
      'getRepositoryLanguagesStatus',
    ]),
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
      this.$router.push({ name: 'repository-translate', params: { language: language.language, name: language.verbose, baseLanguage: this.computedLanguagesStatus[0].language } });
    },
    newLanguage(){
      // this.$emit('addLanguage')
      this.openModal = true
    },
    addLanguage() {
      this.$router.push({ name: 'repository-translate', params: { language: this.languageSelected, name: this.languages[this.languageSelected], baseLanguage: this.computedLanguagesStatus[0].language } })
    }
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/utilities.scss';
@import '~@/assets/scss/colors.scss';
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";
.list-enter-active, .list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to {
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
  transition:
    box-shadow .2s ease,
    background-color .2s ease;
  border-radius: 4px;

  &:hover,
  &.selected {
    background-color: white;
    box-shadow: 0 0 8px rgba(100, 100, 100, .3);
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

    &__status-card, &__new-status-card {
      /* width: 332px; */
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
        margin-bottom: 12px;
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
          color: $unnnic-color-neutral-cloudy;
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

.unnnic-modal {
  /deep/ .container {
    padding-top: 4px;
  }

  /deep/ .unnnic-form__label {
    margin: $unnnic-spacing-stack-lg 0px $unnnic-spacing-stack-xs;
  }
}

/deep/ .unnnic-modal.type-alert .container .actions {
  margin-top: $unnnic-spacing-stack-lg;
}

.unnnic-select {
  text-align: left;
  /deep/ .input {
    height: 46px;
  }
  /deep/ .dropdown {
    display: block;
  }
}

</style>
