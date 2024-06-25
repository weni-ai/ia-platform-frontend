<template>
  <div>
    <form
      autocomplete="off"
      @submit.prevent="onSubmit()"
      @keyup.enter="onEnter()"
    >
      <div class="fields__container">
        <div class="fields__header">
          <UnnnicFormElement
            :label="$t('webapp.trainings.add_a_sentence')"
            :error="errors.text || errors.language"
          >
            <InputWithHightlights
              v-model="text"
              :entities="entities"
              :placeholder="$t('webapp.example.sentence')"
              :selected.sync="textSelected"
            />
          </UnnnicFormElement>

          <div>
            <div class="fields__label">
              {{ $t('webapp.trainings.intent') }}

              <UnnnicToolTip
                side="top"
                :text="$t('webapp.trainings.intent_info')"
                enabled
              >
                <UnnnicIcon
                  class="info"
                  icon="information-circle-4"
                  size="sm"
                  scheme="neutral-soft"
                />
              </UnnnicToolTip>
            </div>

            <UnnnicFormElement :message="errors.intent">
              <Autocomplete
                v-model="intent"
                :options="filteredData"
                :placeholder="$t('webapp.example.intent')"
              />
            </UnnnicFormElement>
          </div>

          <UnnnicFormElement
            :label="$t('webapp.create_repository.language_placeholder')"
            :message="errors.intent"
          >
            <SelectLanguage
              v-model="language"
              :placeholder="$t('webapp.translate.languages_select')"
            />
          </UnnnicFormElement>
        </div>

        <UnnnicFormElement :message="errors.entities">
          <div class="entities-wrapper">
            <NewEntitiesInput
              ref="entitiesInput"
              v-model="entities"
              :repository="repository"
              :text="text"
              :textSelected="textSelected"
              :availableEntities="entitiesList"
              :availableLabels="availableLabels"
              @entityAdded="onEntityAdded()"
            />
          </div>
        </UnnnicFormElement>
      </div>

      <UnnnicButton
        id="tour-training-step-5"
        :isPreviousDisabled="true"
        :isNextDisabled="true"
        :disabled="!shouldSubmit"
        :loading="submitting"
        :isStepBlocked="!blockedNextStepTutorial"
        nativeType="submit"
        class="button--full"
        type="secondary"
        size="large"
      >
        {{ $t('webapp.trainings.submit') }}
      </UnnnicButton>
    </form>

    <UnnnicAlert
      v-if="alertSuccess"
      title=""
      :text="$t('webapp.trainings.sentence_added')"
      :closeText="$t('webapp.inbox.add_log.close')"
      scheme="feedback-green"
      icon="check-circle-1-1"
      @click.native="alertSuccess = false"
    />
  </div>
</template>

<script>
import ExampleTextWithHighlightedEntitiesInput from '@/components/inputs/ExampleTextWithHighlightedEntitiesInput';
import NewEntitiesInput from '@/components/inputs/EntitiesInput/NewEntitiesInput';

import { mapActions, mapGetters } from 'vuex';
import { formatters, LANGUAGES } from '@/utils';
import InputWithHightlights from '../InputWithHightlights';
import SelectLanguage from '../SelectLanguage.vue';
import Autocomplete from '../Autocomplete.vue';

export default {
  name: 'NewExampleForm',
  components: {
    ExampleTextWithHighlightedEntitiesInput,
    NewEntitiesInput,
    InputWithHightlights,
    SelectLanguage,
    Autocomplete,
  },
  props: {
    repository: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      textSelected: null,
      text: '',
      language: this.repository.language,
      intent: '',
      entities: [],
      errors: {},
      submitting: false,
      entitiesList: [],
      blockedNextStepTutorial: false,
      hideDropdown: true,
      isLanguageInputActive: false,
      alertSuccess: false,
      addEntity: false,
    };
  },
  computed: {
    ...mapGetters({
      repositoryVersion: 'getSelectedVersion',
    }),
    shouldSubmit() {
      return this.isValid && !this.submitting;
    },
    filteredData() {
      return this.repository.intents_list || [];
    },
    validationErrors() {
      const errors = [];

      if (!this.text) {
        errors.push(this.$t('webapp.trainings.empty_text_error'));
      }

      if (!this.intent) {
        errors.push(this.$t('webapp.trainings.intent_error'));
      }

      return errors;
    },
    isValid() {
      return this.validationErrors.length === 0;
    },
    availableEntities() {
      const repositoryEntities = this.repository.entities_list || [];
      const entitiesFlat = this.entities.map((e) => e.entity);
      return repositoryEntities
        .concat(entitiesFlat)
        .filter((entity, index, current) => current.indexOf(entity) === index);
    },
    availableLabels() {
      const repositoryLabels = this.repository.labels_list || [];

      return repositoryLabels
        .filter((label) => !!label)
        .filter((label, index, current) => current.indexOf(label) === index);
    },
    data() {
      const { text, language, intent, entities } = this;

      return {
        text,
        language,
        intent,
        entities,
      };
    },
  },
  watch: {
    async intent() {
      if (!this.intent || this.intent.length <= 0) return;
      await this.$nextTick();
      this.intent = formatters.bothubItemKey()(this.intent.toLowerCase());
    },

    text() {
      this.textSelected = null;
    },
  },
  mounted() {
    this.entitiesList = this.availableEntities;
  },
  methods: {
    ...mapActions(['newExample']),
    onEnter() {
      if (this.shouldSubmit) this.onSubmit();
    },
    setTextSelected(value) {
      this.textSelected = value;
    },
    onEntityAdded() {
      this.textSelected = null;

      this.$emit('eventStep');
    },
    async onSubmit() {
      this.errors = {};
      this.submitting = true;

      try {
        await this.newExample({
          repository: this.repository.uuid,
          repositoryVersion: this.repository.repository_version_id,
          ...this.data,
        });

        this.blockedNextStepTutorial = !this.blockedNextStepTutorial;

        this.text = '';
        this.intent = '';
        this.entities = [];
        this.submitting = false;

        this.alertSuccess = true;
        this.$emit('created');
        this.$emit('eventStep');
        return true;
      } catch (error) {
        /* istanbul ignore next */

        const errorResponse = error.response;
        const errorText = error.response.data;
        /* istanbul ignore next */
        if (
          errorText.detail[0] === 'Enter a valid value that has letters in it'
        ) {
          this.$buefy.toast.open({
            message: this.$t('webapp.trainings.error_caracter_type'),
            type: 'is-danger',
          });
        }
        if (
          errorResponse &&
          errorText.detail[0] !== 'Enter a valid value that has letters in it'
        ) {
          /* istanbul ignore next */
          this.$buefy.toast.open({
            message: this.$t(
              'webapp.trainings.intention_or_sentence_already_exist',
            ),
            type: 'is-danger',
          });
          this.errors = errorResponse;
        }
        /* istanbul ignore next */
        this.submitting = false;
      }
      return false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
.fields {
  &__container {
    margin-block: $unnnic-spacing-md;
  }

  &__header {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: $unnnic-spacing-md;
    gap: $unnnic-spacing-sm;

    $normal-column-width: 15.3125 * $unnnic-font-size;
    $large-column-width: 31.6875 * $unnnic-font-size;

    > * {
      flex: 1;
      min-width: $normal-column-width;
    }

    > *:first-child {
      flex: 100;
      min-width: $large-column-width;
    }
  }

  &__label {
    display: flex;
    gap: $unnnic-spacing-xs;

    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

    margin-bottom: $unnnic-spacing-xs;
  }
}

:deep(.unnnic-form__label) {
  font-family: 'Lato';
}

.button--full {
  width: 100%;
}
.entities-wrapper {
  padding: 0 1rem;
  border: 1px solid #e2e6ed;
  border-radius: 8px;
}
:deep(.example-txt-w-highlighted-entities__entity__before) {
  font-size: 0.875rem;
  border: 1px solid transparent;
}
:deep(.example-txt-w-highlighted-entities__entity__text) {
  font-size: 0.875rem;
}
:deep(.hidden .unnnic-autocomplete__container-list) {
  display: none;
}
:deep(.column) {
  padding: 0.5rem;
}
:deep(.dropdown) {
  display: block;
}
:deep(.example-txt-w-highlighted-entities__entity) {
  padding: 0.6rem 0.9rem;
}
:deep(.alert) {
  word-spacing: 0;
}

:deep(.unnnic-tooltip-label) {
  max-width: 350px;
}
</style>
