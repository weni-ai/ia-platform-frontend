<template>
  <div
    v-if="!edit"
    class="example"
  >
    <div>
      <div>
        {{ text }}
      </div>
      <div
        class="example__intent"
        v-html="`${$t('webapp.example.intent') + ': ' + intent}`"
      />
    </div>
    <div>
      <UnnnicButton
        size="small"
        type="secondary"
        iconCenter="pencil-write-1"
        @click.prevent.stop="editSentence"
      />
    </div>
  </div>
  <form
    v-else
    autocomplete="off"
    class="columns wrapper is-vcentered is-2 is-flex-wrap-wrap mt-3 mb-0 example"
    @submit.prevent="onSubmit()"
    @keyup.enter="onEnter()"
  >
    <div class="column is-12 p-0">
      <BField :message="errors.text || errors.language">
        <p
          slot="label"
          class="unnnic-form__label"
          v-html="$t('webapp.example.sentence')"
        />
        <ExampleTextWithHighlightedEntitiesInput
          class="textInput"
          ref="textInput"
          v-model="text"
          :entities="entities"
          :placeholder="$t('webapp.example.enter_sentence')"
          size="normal"
          @textSelected="setTextSelected($event)"
          @entityEdited="onEditEntity($event)"
          @entityAdded="onEntityAdded()"
        />
      </BField>
    </div>
    <div class="column is-12 mt-2 p-0">
      <BField
        id="tour-training-step-4"
        :isPreviousDisabled="true"
        :isStepBlocked="intent === ''"
        :message="errors.intent"
      >
        <UnnnicFormElement :label="$t('webapp.example.intent')">
          <Autocomplete
            v-model="intent"
            :options="filterIntents"
            :placeholder="$t('webapp.example.intent')"
            entityFormat
          />
        </UnnnicFormElement>
      </BField>
    </div>
    <div class="column is-12 mt-4 p-0">
      <BField
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
          :showHint="false"
          @entityAdded="onEntityAdded()"
        />
      </BField>
    </div>
    <div class="column p-0 mt-4 is-flex is-justify-content-space-between">
      <UnnnicButton
        class="mr-4 example__edit-button"
        type="tertiary"
        size="small"
        @click.prevent.stop="cancelEditSentence"
      >
        {{ $t('webapp.trainings.cancel_button') }}
      </UnnnicButton>
      <UnnnicButton
        type="secondary"
        size="small"
        class="example__edit-button"
        @click.prevent.stop="saveSentence"
      >
        {{ $t('webapp.trainings.save_button') }}
      </UnnnicButton>
    </div>
  </form>
</template>

<script>
import ExampleTextWithHighlightedEntitiesInput from '@/components/inputs/ExampleTextWithHighlightedEntitiesInput';
import SentenceAccordion from '@/components/shared/accordion/SentenceAccordion';
import LanguageBadge from '@/components/shared/LanguageBadge';
import ExampleEntitySmallInput from '@/components/example/ExampleEntitySmallInput';
import EditExampleBase from './EditExampleBase';
import NewEntitiesInput from '@/components/inputs/EntitiesInput/NewEntitiesInput';
import Autocomplete from '../../Autocomplete.vue';

export default {
  name: 'EditExampleAccordion',
  components: {
    SentenceAccordion,
    ExampleTextWithHighlightedEntitiesInput,
    LanguageBadge,
    ExampleEntitySmallInput,
    NewEntitiesInput,
    Autocomplete,
  },
  extends: EditExampleBase,
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    custom: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isOpen: this.open,
      allEntitiesInput: [],
      edit: false,
      isIntentInputActive: false,
      hideDropdown: true,
    };
  },
  computed: {
    addEntityHelpText() {
      if (this.textSelected === null)
        return this.$t('webapp.trainings.select_text');
      return this.entityButtonText;
    },
    allEntities() {
      return this.allEntitiesInput;
    },
    filterIntents() {
      if (this.intents !== null) {
        return this.repository.intents_list;
      }
      return [];
    },
  },
  watch: {
    open() {
      this.isOpen = this.open;
    },
    isOpen() {
      this.$emit('update:open', this.isOpen);
    },
    text() {
      this.$emit('textInput', this.text);
    },
    allEntitiesInput() {
      this.$emit('entitiesInput', this.allEntitiesInput);
    },
    intent() {
      this.$emit('intentInput', this.intent);
    },
  },
  methods: {
    editSentence() {
      this.edit = true;
    },
    onInputClick(target) {
      if (target === 'intent')
        this.isIntentInputActive = !this.isIntentInputActive;
    },
    cancelEditSentence() {
      this.$emit('cancel');
      this.edit = false;
    },
    saveSentence() {
      this.cancelEditSentence();
    },
  },
};
</script>

<style scoped lang="scss">
@import '~@/assets/scss/colors.scss';

.icon {
  color: $color-grey-dark;
}
.input-custom-style {
  max-height: 150px;
  max-width: 100px;
}
.edit-sentence {
  width: 100%;
  margin: 0 1rem 1rem 0;

  &__input {
    margin-right: 0.5rem;
    &__label {
      font-size: 12px;
    }
  }

  &__icon {
    background-color: $color-grey-dark;
    color: white;
  }

  &__icon-container {
    > * {
      margin-left: 0.25rem;
    }

    .icon {
      margin-top: 1.75rem;
    }

    &--intent {
      display: flex;
      align-items: center;
      height: 100%;
      .icon {
        margin-top: 0;
      }
    }
  }
  &__options {
    width: 40rem;
  }
}
.custom-accordion {
  max-width: 100%;
}
.example {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e2e6ed;
  font-size: 14px;
  color: #3b414d;
  text-align: left;

  &:not(:first-child) {
    margin-bottom: 0.5rem;
  }

  &__intent {
    font-family: 'Lato';
    font-size: 12px;
    color: #67738b;
  }

  &__edit-button {
    width: 50%;
  }
}
.modal-background {
  background-color: transparent;
}
.wrapper {
  margin: 1rem 0;
}

.columns.is-variable .column {
  padding-left: 0;
  padding-right: 0;
}

.textarea,
.input {
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

.unnnic-form__label {
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
.example-txt-w-highlighted-entities__entity__before {
  font-size: 0.875rem;
  border: 1px solid transparent;
}
.example-txt-w-highlighted-entities__entity__text {
  font-size: 0.875rem;
}
.hidden .unnnic-autocomplete__container-list {
  display: none;
}
.column {
  padding: 0.5rem;
}
.dropdown {
  display: block;
}
.example-txt-w-highlighted-entities__entity {
  padding: 0.6rem 0.9rem !important;
}
.input:focus,
.textarea:focus {
  box-shadow: none !important;
  border-color: #9caccc !important;
}
.self-adjust {
  min-height: 48px !important;
  padding: 0.75rem 1rem !important;
}
</style>
