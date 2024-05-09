<template>
  <div>
    <messages :msgs="msgs" />
    <component
      :is="grouped ? 'b-field' : 'div'"
      :grouped="grouped"
      :group-multiline="grouped">
      <b-field
        v-for="field in generalGroup"
        v-show="field.type !== 'hidden'"
        :key="field.name"
        :type="field.errors && 'is-danger'"
        :class="{[`field-${field.type}`]: true}">
        <div
          v-if="showLabels && field.type !== 'boolean'"
          slot="label"
          :class="{'field-label': true, [`field-${field.type}__title`]: true}">
          <unnnic-label class="my-0" :label="field.label" />
        </div>
        <component
          :v-if="field.inputComponent"
          :is="field.inputComponent"
          v-bind="field.inputProps"
          :label-placeholder="showLabels ? '' : field.label"
          :show-max-length="showLabels"
          v-model="formData[field.name]"
          :initial-data="initialData[field.name]"
          :label="field.label"
          :fetch="field.fetch"
          :help-text="hideHelp ? '' : field.helpText"
          :compact="!showLabels"
          :class="{
            'switchNewIntelligence': field.name === 'is_private' && newIntelligenceForms,
          }"
          :name="field.name"
          @input="update()"
        />
      </b-field>
      <entity-accordion :open.sync="isOpen">
        <div slot="header" class="level">
          <div class="badges-card__header">
            <p
              class="unnnic-form__label my-0"
            >
              {{ $t('webapp.settings.settings_accordion') }}
            </p>
          </div>
        </div>
        <div slot="icon" class="level example-accordion__btns-wrapper">
          <unnnic-icon-svg
            :icon="`${isOpen ? 'arrow-button-down-1' : 'arrow-right-1-1'}`"
            scheme="neutral-cleanest"
            size="xs"
          />
        </div>
        <div slot="body">
          <div class="group">
              <b-field
              v-for="field in advancedGroup"
              v-show="field.type !== 'hidden'"
              :key="field.name"
              :type="field.errors && 'is-danger'"
              :class="{[`field-${field.type}`]: true}">
              <div
                v-if="showLabels && field.type !== 'boolean'"
                slot="label"
                :class="{'field-label': true, [`field-${field.type}__title`]: true}">
              </div>
              <div
                v-if="showLabels && field.type !== 'boolean'"
                slot="label"
                :class="{'field-label': true, [`field-${field.type}__title`]: true}">
                <unnnic-label class="my-0" :label="field.label" />
              </div>
              <component
                :v-if="field.inputComponent"
                :is="field.inputComponent"
                v-bind="field.inputProps"
                :label-placeholder="showLabels ? '' : field.label"
                :show-max-length="showLabels"
                v-model="formData[field.name]"
                :initial-data="initialData[field.name]"
                :label="field.label"
                :fetch="field.fetch"
                :help-text="hideHelp ? '' : field.helpText"
                :compact="!showLabels"
                :name="field.name"
                @input="update()"
              />
            </b-field>
          </div>
        </div>
      </entity-accordion>
    </component>
  </div>
</template>

<script>
import Messages from '@/components/shared/Messages';
import HelpWidget from '@/components/shared/HelpWidget';
import StringInput from './inputs/StringInput';
import ChoiceInput from './inputs/ChoiceInput';
import BooleanInput from './inputs/BooleanInput';
import MultipleChoice from './inputs/MultipleChoice';
import TextInput from './inputs/TextInput';
import EmailInput from './inputs/EmailInput';
import PasswordInput from './inputs/PasswordInput';
import ImageInput from './inputs/ImageInput';
import EntityAccordion from '@/components/shared/accordion/EntityAccordion';


const relatedInputComponent = {
  field: StringInput,
  string: StringInput,
  slug: StringInput,
  choice: ChoiceInput,
  boolean: BooleanInput,
  'multiple choice': MultipleChoice,
  text: TextInput,
  email: EmailInput,
  password: PasswordInput,
  hidden: StringInput,
  textarea: TextInput,
  image: ImageInput,
};

const components = {
  Messages,
  HelpWidget,
  EntityAccordion
};

export default {
  name: 'FormGenerator',
  components,
  props: {
    schema: {
      required: true,
      type: Object,
    },
    availableMaxLength: {
      type: Boolean,
      default: true,
    },
    errors: {
      type: Object,
      default: () => ({}),
    },
    showLabels: {
      type: Boolean,
      default: true,
    },
    initialData: {
      type: Object,
      default: () => ({}),
    },
    grouped: {
      type: Boolean,
      default: false,
    },
    settings: {
      type: Boolean,
      default: false,
    },
    hideHelp: {
      type: Boolean,
      default: null,
    },
    newIntelligenceForms: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formData: {},
      isOpen: false
    };
  },
  computed: {
    fields() {
      const fields = Object.keys(this.schema)

      return fields
        .map((name) => {
          const {
            type,
            label,
            style,
            help_text: helpText,
            fetch,
            ...inputProps
          } = this.schema[name];

          const shouldHide = style && typeof style.show === 'boolean' && !style.show;
          const shouldShowSettings = this.settings && style && typeof style.only_settings === 'boolean' && style.only_settings;

          if (!shouldShowSettings && shouldHide) return false;
          return {
            type,
            name,
            label,
            helpText,
            inputProps,
            inputComponent: relatedInputComponent[type],
            errors: this.errors[name],
            fetch,
          };
        })
        .filter(field => !!field)
    },
    advancedGroup() {
      const items = this.fields
      return items.splice(5)
    },
    generalGroup() {
      const items = this.fields
      this.swapElements(this.fields, 2, 3)
      this.swapElements(this.fields, 4, 3)
      return items.slice(0, 5)
    },
    msgs() {
      /* istanbul ignore next */
      return (this.errors.non_field_errors
        && this.errors.non_field_errors.map(text => ({ text, class: 'error' }))) || [];
    },
    helpArticleId() {
      return runtimeVariables.get('VITE_BOTHUB_WEBAPP_LIGHTHOUSE_ALGORITHM_ARTICLE_ID');
    },
  },
  mounted() {
    this.update();
  },
  methods: {
    update() {
      this.$emit('input', this.formData);
    },
    hasHelpIcon(field) {
      return field.name === 'algorithm';
    },
    swapElements(array, indexA, indexB) {
      const from = array[indexA];
      array[indexA] = array[indexB];
      array[indexB] = from;
    }
  },
};
</script>

<style lang="scss" scoped>

$labeled-spacing: 1.563rem;
$unlabeled-spacing: 0.625rem;
$default-spacing: 0.5rem;
$max-length-height: 0.938rem;

.switchNewIntelligence{
  padding-top: calc(4.2rem - #{$unlabeled-spacing});
}
.field-message {

  &--labeled {
    margin-bottom: calc(#{$labeled-spacing} - #{$default-spacing});

    &__maxLength {
      max-width: 90%;
    }
  }

  &--unlabeled {
    margin-bottom: $unlabeled-spacing;

    &__maxLength {
      max-width: 90%;
    }
  }
}

.field {
  margin-bottom: 1.5rem;
}

.field-label {
    display: flex;
    align-items: center;
}
.field-image {
  margin-left: 1.563rem;
  &__title {
    justify-content: center;
    margin: 0;
  }
}
.field-textarea {
  min-width: 70%;
}

.group {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;

  & .field-choice {
    width: 100%;
    margin-top: 1.5rem;
  }
  & .field-boolean {
    margin-bottom: 0;
    margin-right: 8rem;
  }
}

::v-deep {
  .input {
    height: 46px;
  }
  .dropdown {
    display: block;
  }

  .expander {
    font-family: 'Lato';
    border: 1px solid #E2E6ED;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 2rem;

    &__body {
      padding: 0;
    }

    &__trigger {
      padding-top: 0;
    }
  }
}
</style>
