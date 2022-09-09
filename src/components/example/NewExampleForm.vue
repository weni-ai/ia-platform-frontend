<template>
  <div>
    <form
      autocomplete="off"
      class="columns wrapper is-vcentered is-variable is-2 is-flex-wrap-wrap mt-3"
      @submit.prevent="onSubmit()"
      @keyup.enter="onEnter()"
    >
      <div class="column is-12 mb-2">
        <b-field
          :message="errors.text || errors.language"
        >
          <p
              slot="label"
              class="unnnic-form__label"
              v-html="$t('webapp.trainings.add_a_sentence')" />
          <example-text-with-highlighted-entities-input
            id="tour-training-step-1"
            ref="textInput"
            :is-previous-disabled="true"
            :is-step-blocked="textSelected === null"
            v-model="text"
            :entities="entities"
            :placeholder="$t('webapp.example.sentence')"
            size="normal"
            @textSelected="setTextSelected($event)"
            @submit="onEnter()"
          >
            <!-- <language-append-select-input
              slot="append"
              v-model="language"
              class="language-append"
            /> -->
          </example-text-with-highlighted-entities-input>
        </b-field>
      </div>
      <div class="column is-12">
        <b-field class="entities-wrapper" :message="errors.entities">
          <p
            slot="label"
            class="unnnic-form__label"
          >
            {{ $t('webapp.trainings.entities') }}
            <unnnic-tool-tip
              side="right"
              :text="$t('webapp.trainings.add_entity_info')"
              enabled
            >
              <unnnic-icon
                class="info"
                icon="information-circle-4"
                size="sm"
                scheme="neutral-soft"
              />
            </unnnic-tool-tip>
          </p>
          <new-entities-input
            class="mb-3"
            ref="entitiesInput"
            v-model="entities"
            :repository="repository"
            :text="text"
            :text-selected="textSelected"
            :available-entities="entitiesList"
            :available-labels="availableLabels"
            @entityAdded="onEntityAdded()"
          />
        </b-field>
      </div>
      <div class="column is-6 pr-4">
        <b-field
          id="tour-training-step-4"
          :is-previous-disabled="true"
          :is-step-blocked="intent === ''"
          :message="errors.intent">
         <unnnic-autocomplete
            :label="$t('webapp.trainings.intent')"
            v-model="intent"
            :data="filteredData"
            :placeholder="$t('webapp.example.intent')"
            :openWithFocus="true"
            @focus="onInputClick('intent')"
            @blur="onInputClick('intent')"
            :iconRight="isIntentInputActive ? 'arrow-button-up-1' : 'arrow-button-down-1'"
          />
        </b-field>
      </div>
      <div class="column is-6">
        <b-field
          id="tour-training-step-4"
          :is-previous-disabled="true"
          :is-step-blocked="intent === ''"
          :message="errors.intent">
           <!-- <unnnic-autocomplete
              :label="$t('webapp.create_repository.language_placeholder')"
              v-model="language"
              :data="languageLabels"
              :placeholder="$t('webapp.translate.languages_select')"
              :openWithFocus="true"
              @click.native="hideDropdown = false"
              @focus="onInputClick('language')"
              @blur="onInputClick('language')"
              :class="hideDropdown ? 'hidden' : ''"
              :iconRight="isLanguageInputActive ? 'arrow-button-up-1' : 'arrow-button-down-1'"
            /> -->
          <unnnic-select
            :placeholder="$t('webapp.translate.languages_select')"
            :label="$t('webapp.create_repository.language_placeholder')"
            v-model="language"
          >
            <option
              v-for="[option, label] in languageList"
              :key="option"
              :value="option"
              @select="language = option"
            >
              {{ label }}
            </option>
          </unnnic-select>
        </b-field>
      </div>
      <div class="column is-12 mt-4">
        <b-field>
          <unnnic-button
            id="tour-training-step-5"
            :is-previous-disabled="true"
            :is-next-disabled="true"
            :disabled="!shouldSubmit"
            :loading="submitting"
            :is-step-blocked="!blockedNextStepTutorial"
            native-type="submit"
            class="button--full"
            type="secondary"
            size="large"
          >
            {{ $t('webapp.trainings.submit') }}
          </unnnic-button>
        </b-field>
      </div>
    </form>
    <!-- <div class="columns is-variable is-1">
      <div class="column is-three-fifths">
        <b-field :message="errors.entities">
          <entities-input
            ref="entitiesInput"
            v-model="entities"
            :repository="repository"
            :text="text"
            :text-selected="textSelected"
            :available-entities="entitiesList"
            :available-labels="availableLabels"
            @entityAdded="onEntityAdded()"
          />
        </b-field>
      </div>
    </div> -->
    <unnnic-alert
      v-if="alertSuccess"
      title=""
      text="Frase adicionada para treinamento"
      closeText="Fechar"
      scheme="feedback-green"
      icon="check-circle-1-1"
      @click.native="alertSuccess = false"
    />
  </div>
</template>

<script>
import ExampleTextWithHighlightedEntitiesInput from '@/components/inputs/ExampleTextWithHighlightedEntitiesInput';
import NewEntitiesInput from '@/components/inputs/EntitiesInput/NewEntitiesInput';
import LanguageAppendSelectInput from '@/components/inputs/LanguageAppendSelectInput';

import { mapActions, mapGetters } from 'vuex';
import { formatters, LANGUAGES, languageListToDict } from '@/utils';
import LanguageSelect from '../inputs/LanguageSelect';
import LanguageSelectInput from '../inputs/LanguageSelectInput';


export default {
  name: 'NewExampleForm',
  components: {
    ExampleTextWithHighlightedEntitiesInput,
    NewEntitiesInput,
    LanguageAppendSelectInput,
    LanguageSelect,
    LanguageSelectInput
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
      alertSuccess: false
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
      return (this.repository.intents_list || []).filter(intent => intent
        .startsWith(this.intent.toLowerCase()));
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
      const entitiesFlat = this.entities.map(e => e.entity);
      return repositoryEntities
        .concat(entitiesFlat)
        .filter((entity, index, current) => (current.indexOf(entity) === index));
    },
    availableLabels() {
      const repositoryLabels = this.repository.labels_list || [];

      return repositoryLabels
        .filter(label => !!label)
        .filter((label, index, current) => (current.indexOf(label) === index));
    },
    data() {
      const {
        text,
        language,
        intent,
        entities,
      } = this;

      return {
        text,
        language,
        intent,
        entities,
      };
    },
    languageList() {
      return Object.keys(LANGUAGES)
        .map(lang => ([lang, LANGUAGES[lang]]));
    },
  },
  watch: {
    async intent() {
      if (!this.intent || this.intent.length <= 0) return;
      await this.$nextTick();
      this.intent = formatters.bothubItemKey()(this.intent.toLowerCase());
    },
  },
  mounted() {
    this.entitiesList = this.availableEntities;
  },
  methods: {
    ...mapActions([
      'newExample',
    ]),
    onEnter() {
      if (this.shouldSubmit) this.onSubmit();
    },
    setTextSelected(value) {
      this.textSelected = value;
    },
    onEntityAdded() {
      if (this.$refs.textInput.clearSelected) {
        /* istanbul ignore next */
        this.$refs.textInput.clearSelected();
      }
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

        this.alertSuccess = true
        this.$emit('created');
        this.$emit('eventStep');
        return true;
      } catch (error) {
        /* istanbul ignore next */

        const errorResponse = error.response;
        const errorText = error.response.data;
        /* istanbul ignore next */
        if (errorText.detail[0] === 'Enter a valid value that has letters in it') {
          this.$buefy.toast.open({
            message: this.$t('webapp.trainings.error_caracter_type'),
            type: 'is-danger'
          });
        }
        if (errorResponse && errorText.detail[0] !== 'Enter a valid value that has letters in it') {
          /* istanbul ignore next */
          this.$buefy.toast.open({
            message: this.$t('webapp.trainings.intention_or_sentence_already_exist'),
            type: 'is-danger'
          });
          this.errors = errorResponse;
        }
        /* istanbul ignore next */
        this.submitting = false;
      }
      return false;
    },
    onInputClick(target) {
      if (target === 'intent') this.isIntentInputActive = !this.isIntentInputActive
      if (target === 'language') this.isLanguageInputActive = !this.isLanguageInputActive
    },
  },
};
</script>

<style lang="scss" scoped>

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

/deep/ .textarea, /deep/ .input {
  border: .0625rem solid #e2e6ed;
  border-radius: .25rem;
  color: #4e5666;
  font-weight: 400;
  font-size: .875rem;
  box-sizing: border-box;
  width: 100%;
  padding: .75rem 1rem;
  height: 48px;
}

/deep/ .unnnic-form__label {
  font-family: 'Lato';
}

.button--full {
  width: 100%;
}
.entities-wrapper {
  padding: 1.5rem;
  border: 1px solid #E2E6ED;
  border-radius: 8px;
}
/deep/ .example-txt-w-highlighted-entities__entity__before {
  font-size: .875rem;
  border: 1px solid transparent;
}
/deep/ .example-txt-w-highlighted-entities__entity__text {
  font-size: .875rem;
}
/deep/ .hidden .unnnic-autocomplete__container-list{
  display: none;
}
/deep/ .column {
  padding: .5rem;
}
/deep/ .dropdown {
  display: block;
}
/deep/ .example-txt-w-highlighted-entities__entity {
  padding: 0.6rem 0.9rem;
}
/deep/ .alert {
  word-spacing: 0;
}

</style>
