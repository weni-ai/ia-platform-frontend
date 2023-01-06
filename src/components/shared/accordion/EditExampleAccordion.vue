<template>
  <div class="example">
    <div>
      <div>
        {{ text }}
      </div>
      <div class="example__intent" v-html="`${ $t('webapp.example.intent') + ': ' + intent}`" />
    </div>
    <div>
      <unnnic-button
        size="small"
        type="secondary"
        iconCenter="pencil-write-1"
        @click.prevent.stop="editSentence(item.id)"
      />
    </div>
  </div>
</template>

<script>
import ExampleTextWithHighlightedEntitiesInput from '@/components/inputs/ExampleTextWithHighlightedEntitiesInput';
import SentenceAccordion from '@/components/shared/accordion/SentenceAccordion';
import LanguageBadge from '@/components/shared/LanguageBadge';
import ExampleEntitySmallInput from '@/components/example/ExampleEntitySmallInput';
import EditExampleBase from './EditExampleBase';

export default {
  name: 'EditExampleAccordion',
  components: {
    SentenceAccordion,
    ExampleTextWithHighlightedEntitiesInput,
    LanguageBadge,
    ExampleEntitySmallInput,
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
    };
  },
  computed: {
    addEntityHelpText() {
      if (this.textSelected === null) return this.$t('webapp.trainings.select_text');
      return this.entityButtonText;
    },
    allEntities() {
      return this.allEntitiesInput;
    },
    filterIntents() {
      if (this.intents !== null) {
        return this.repository.intents_list.filter(intent => intent
          .toString()
          .toLowerCase()
          .indexOf(this.intent.toLowerCase()) >= 0);
      }
      return [];
    },
    optionsIntents() {
      return this.filterIntents.map(intent => intent);
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
};
</script>

<style lang="scss">
@import '~@/assets/scss/colors.scss';

.icon {
  color: $color-grey-dark;
}
.input-custom-style{
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
    &__options{
    width: 40rem;
  }
}
.custom-accordion{
  max-width: 100%;
}
.example {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #E2E6ED;
  font-size: 14px;
  color: #3B414D;
  text-align: left;
  margin-bottom: .5rem;

  &__intent {
    font-family: 'Lato';
    font-size: 12px;
    color: #67738B;
  }
}
.modal-background {
    background-color: transparent;
  }
</style>
