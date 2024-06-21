<template>
  <div>
    <form
      autocomplete="off"
      class="columns wrapper is-vcentered is-variable is-2 is-flex-wrap-wrap mt-3"
      @submit.prevent="onSubmit()"
      @keyup.enter="onEnter()"
    >
      <UnnnicFormElement
        class="form-element"
        :label="$t('webapp.phrase-suggestion.add_a_sentence')"
        :message="errors.text || errors.language"
      >
        <InputWithHightlights
          v-model="text"
          :entities="entities"
          :placeholder="$t('webapp.example.sentence')"
          :selected.sync="textSelected"
        />
      </UnnnicFormElement>

      <UnnnicFormElement
        class="form-element"
        :label="$t('webapp.trainings.intent')"
        :message="errors.intent"
      >
        <UnnnicAutocomplete
          v-model="intent"
          :data="filteredData"
          :placeholder="$t('webapp.example.intent')"
          :openWithFocus="true"
          @focus="onInputClick('intent')"
          @blur="onInputClick('intent')"
          :iconRight="
            isIntentInputActive ? 'arrow-button-up-1' : 'arrow-button-down-1'
          "
        />
      </UnnnicFormElement>

      <UnnnicFormElement
        class="form-element"
        :label="$t('webapp.create_repository.language_placeholder')"
        :message="errors.intent"
      >
        <SelectLanguage
          v-model="language"
          :placeholder="$t('webapp.translate.languages_select')"
        />
      </UnnnicFormElement>

      <UnnnicFormElement :message="errors.entities">
        <div
          class="entities-wrapper"
          :message="errors.entities"
        >
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

      <UnnnicButton
        id="tour-training-step-5"
        :isPreviousDisabled="true"
        :isNextDisabled="true"
        :disabled="!shouldSubmit"
        :loading="submitting"
        :isStepBlocked="!blockedNextStepTutorial"
        nativeType="submit"
        class="button-submit"
        type="secondary"
        size="large"
      >
        {{ $t('webapp.phrase-suggestion.submit') }}
      </UnnnicButton>
    </form>
  </div>
</template>

<script>
import ExampleTextWithHighlightedEntitiesInput from '@/components/inputs/ExampleTextWithHighlightedEntitiesInput';
import NewEntitiesInput from '@/components/inputs/EntitiesInput/NewEntitiesInput';

import { mapActions, mapGetters } from 'vuex';
import { formatters, LANGUAGES } from '@/utils';
import InputWithHightlights from '../../InputWithHightlights';
import { get } from 'lodash';
import SelectLanguage from '../../SelectLanguage.vue';

export default {
  name: 'AddSentenceForm',
  components: {
    ExampleTextWithHighlightedEntitiesInput,
    NewEntitiesInput,
    InputWithHightlights,
    SelectLanguage,
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
      isIntentInputActive: false,
      isLanguageInputActive: false,
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
      return (this.repository.intents_list || []).filter((intent) =>
        intent.startsWith(this.intent.toLowerCase()),
      );
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

        this.submitting = false;

        this.$emit('onSubmit', this.data);
        return true;
      } catch (error) {
        const message = get(error, 'response.data.detail', '');

        if (message) {
          this.$store.state.alert = {
            text: message,
            type: 'error',
          };
        }

        this.submitting = false;
      }

      return false;
    },
    onInputClick(target) {
      if (target === 'intent')
        this.isIntentInputActive = !this.isIntentInputActive;
      if (target === 'language')
        this.isLanguageInputActive = !this.isLanguageInputActive;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.form-element + .form-element {
  margin-top: $unnnic-spacing-sm;
}

.language-append {
  flex-grow: 0;
}

.wrapper {
  margin: 1rem 0;
}

.columns.is-variable .column {
  padding-left: 0;
  padding-right: 0;
}

:deep(.textarea),
:deep(.input) {
  border: 0.0625rem solid #e2e6ed;
  border-radius: 0.25rem;
  color: #4e5666;
  font-weight: 400;
  font-size: 0.875rem;
  box-sizing: border-box;
  width: 100%;
  padding: 0.75rem 1rem;
  height: 48px;
}

:deep(.unnnic-form__label) {
  font-family: 'Lato';
}

.button-submit {
  margin-top: $unnnic-spacing-md;
  width: 100%;
}
.entities-wrapper {
  margin-top: $unnnic-spacing-md;
  padding: 0 $unnnic-spacing-sm;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  border-radius: $unnnic-border-radius-md;
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
</style>
