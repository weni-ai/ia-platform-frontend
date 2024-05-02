<template>
  <div class="new-sentence">
    <div>
      <h2 class="new-sentence__title">
        {{ $t('webapp.evaluate-manual.add_new_test_sentence') }}
      </h2>
      <span>
        {{ $t('webapp.evaluate-manual.create_a_bench_of_test') }}
      </span>
    </div>
    <div class="new-sentence__form">
      <form @submit.prevent="submitSentence()">
        <div class="new-sentence__form__wrapper">
          <div>
            <BField :message="errors.entities || errors.language">
              <ExampleTextWithHighlightedEntitiesInput
                id="tour-evaluate-step-2"
                ref="textInput"
                :isPreviousDisabled="true"
                v-model="text"
                :isStepBlocked="text.length === 0"
                :entities="entities"
                :placeholder="
                  $t('webapp.evaluate-manual.enter_your_sentence_here')
                "
                @submit="onEnter()"
                @textSelected="setTextSelected($event)"
              />
            </BField>
          </div>
          <div>
            <BField
              id="tour-evaluate-step-3"
              :isPreviousDisabled="true"
              :message="errors.non_field_errors"
              :isStepBlocked="(intent || '').length === 0"
            >
              <BAutocomplete
                v-model="intent"
                :data="filterIntents"
                :placeholder="$t('webapp.evaluate.intent')"
                openOnFocus
                dropdownPosition="bottom"
              />
            </BField>
          </div>
          <div class="new-sentence__form__wrapper__submit-btn">
            <BTooltip
              :label="validationErrors.join(', ')"
              :active="!isValid && validationErrors.length > 0"
              multilined
              type="is-dark"
            >
              <BButton
                id="tour-evaluate-step-4"
                ref="saveSentenceButton"
                :isNextDisabled="true"
                :isPreviousDisabled="true"
                :disabled="!shouldSubmit"
                :loading="submitting"
                :isStepBlocked="!blockedNextStepTutorial"
                type="is-primary"
                class="new-sentence__form__wrapper__submit-btn__button"
                @click="submitSentence()"
              >
                <slot v-if="!submitting">{{
                  $t('webapp.evaluate-manual.submit')
                }}</slot>
              </BButton>
            </BTooltip>
          </div>
        </div>
        <BField
          :errors="errors.entities"
          class="new-sentence__form__entities"
        >
          <div class="columns">
            <div class="column is-one-third">
              <EntitiesInput
                ref="entitiesInput"
                v-model="entities"
                :availableAddLabel="false"
                :repository="repository"
                :text="text"
                :textSelected="textSelected"
                :availableEntities="entitiesList"
                :availableLabels="availableLabels"
                :entitiesForEdit="[]"
                :testing="testing"
                @entityAdded="onEntityAdded()"
                @entityEdited="onEditEntity($event)"
              />
            </div>
          </div>
        </BField>
      </form>
    </div>
  </div>
</template>

<script>
import ExampleTextWithHighlightedEntitiesInput from '@/components/inputs/ExampleTextWithHighlightedEntitiesInput';
import EntitiesInput from '@/components/inputs/EntitiesInput';
import { mapActions, mapGetters } from 'vuex';
import { formatters } from '@/utils';

export default {
  name: 'NewEvaluateExample',
  components: {
    ExampleTextWithHighlightedEntitiesInput,
    EntitiesInput,
  },
  props: {
    language: {
      type: String,
      required: true,
    },
    intents: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      textSelected: null,
      text: '',
      intent: '',
      entities: [],
      errors: {},
      submitting: false,
      entitiesList: [],
      testing: true,
      blockedNextStepTutorial: false,
      intentError: {},
    };
  },
  computed: {
    ...mapGetters({
      repositoryVersion: 'getSelectedVersion',
      repository: 'getCurrentRepository',
    }),
    shouldSubmit() {
      return this.isValid && !this.submitting;
    },
    filterIntents() {
      return (this.intents || []).filter((intent) =>
        intent.startsWith(this.intent.toLowerCase()),
      );
    },
    validationErrors() {
      const errors = [];

      if (!this.text) {
        errors.push(this.$t('webapp.evaluate-manual.you_need_type_a_text'));
      }

      if (!this.intent) {
        errors.push(this.$t('webapp.evaluate-manual.intent_is_required'));
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
      const labelsFlat = this.entities.map((e) => e.label);
      return repositoryLabels
        .concat(labelsFlat)
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
    intent() {
      if (!this.intent || this.intent.length <= 0) return;
      this.intent = formatters.bothubItemKey()(this.intent.toLowerCase());
    },
  },
  mounted() {
    this.entitiesList = this.availableEntities;
  },
  methods: {
    ...mapActions(['newEvaluateExample']),
    onEnter() {
      if (this.shouldSubmit) this.submitSentence();
    },
    setTextSelected(value) {
      this.textSelected = value;
    },
    onEntityAdded() {
      if (this.$refs.textInput.clearSelected) {
        /* istanbul ignore next */
        this.$refs.textInput.clearSelected();
      }
    },
    onEditEntity(entity) {
      if (this.$refs.textInput.emitTextSelected) {
        /* istanbul ignore next */
        this.$refs.textInput.emitTextSelected({
          selectionStart: entity.start,
          selectionEnd: entity.end,
        });
      }
    },
    async submitSentence() {
      this.errors = {};
      this.submitting = true;
      if (this.$refs.entitiesInput.clearEntityForm) {
        this.$refs.entitiesInput.clearEntityForm();
      }

      try {
        await this.newEvaluateExample({
          repository: this.repository.uuid,
          repositoryVersion: this.repositoryVersion,
          ...this.data,
        });
        this.text = '';
        this.intent = '';
        this.entities = [];
        this.submitting = false;

        this.$emit('created');
        this.$emit('eventStep');
        this.blockedNextStepTutorial = !this.blockedNextStepTutorial;
        return true;
      } catch (error) {
        /* istanbul ignore next */
        const data = error.response && error.response.data;
        /* istanbul ignore next */
        if (data && data.non_field_errors && data.non_field_errors.length > 0) {
          /* istanbul ignore next */
          this.intentError = data;
          this.$buefy.toast.open({
            message: `${this.intentError.non_field_errors[0]}`,
            type: 'is-danger',
            duration: 5000,
          });
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
@import '@/assets/scss/colors.scss';
@import '@/assets/scss/variables.scss';

.new-sentence {
  width: 100%;
  margin: 2rem auto 0;

  &__title {
    font-size: 1.75rem;
    font-weight: $font-weight-medium;
    color: $color-fake-black;
    margin-bottom: $between-title-subtitle;
  }

  span {
    font-family: $font-family;
  }

  &__form {
    &__wrapper {
      display: grid;
      grid-template-columns: 1.5fr 1fr 0.1fr;
      align-items: center;
      grid-gap: 1rem;
      padding: 1rem 0;

      @media (max-width: $mobile-width) {
        grid-template-columns: 1fr;
      }

      &__submit-btn {
        align-self: center;
        justify-self: flex-end;

        &__button {
          min-width: 100px;
        }
      }
    }
  }
}
</style>
