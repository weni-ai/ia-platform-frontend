<template>
  <div class="edit-sentence">
    <form>
      <div class="columns edit-sentence__wrapper">
        <div class="column is-6">
          <p
            slot="label"
            class="unnnic-form__label"
            v-html="$t('webapp.example.version_name')">
          </p>
          <example-text-with-highlighted-entities-input
            ref="textInput"
            v-model="text"
            :entities="allEntities"
            :placeholder="$t('webapp.example.enter_sentence')"
            size="normal"
            @textSelected="setTextSelected($event)"
            @entityEdited="onEditEntity($event)"
            @entityAdded="onEntityAdded()"
          />
        </div>
        <div class="column is-6">
          <div class="edit-sentence__label">
            <p
              slot="label"
              class="unnnic-form__label"
              v-html="$t('webapp.example.principal_version_label')">
            </p>
            <unnnic-tool-tip
              side="top"
              :text="$t('webapp.example.principal_version_info')"
              enabled
            >
              <unnnic-icon
                class="info"
                icon="information-circle-4"
                size="sm"
                scheme="neutral-soft"
              />
            </unnnic-tool-tip>
          </div>
          <unnnic-switch
            :textRight="$t('webapp.example.principal_version_text')"
            v-model="enable2FA" />
        </div>
      </div>
      <div
        class="edit-sentence__btn-wrapper">
        <div class="column p-0 is-flex is-justify-content-space-between">
          <unnnic-button
            class="mr-4 edit-sentence__btn-wrapper__button"
            type="terciary"
            size="small"
            @click.prevent.stop="cancelEditVersion">
            {{ $t('webapp.trainings.cancel_button') }}
          </unnnic-button>
          <unnnic-button
            type="secondary"
            size="small"
            class="edit-sentence__btn-wrapper__button"
            :disabled="!isValid || submitting"
            :tooltip-hover="!isValid ? validationErrors : null"
            :loading="submitting"
            @click.prevent.stop="saveVersion">
            <slot v-if="!submitting">{{ $t('webapp.trainings.save_button') }}</slot>
          </unnnic-button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import EditExampleBase from './EditExampleBase';
import ExampleTextWithHighlightedEntitiesInput from '@/components/inputs/ExampleTextWithHighlightedEntitiesInput';
import EntityAccordion from '@/components/shared/accordion/EntityAccordion';
import WordCard from '@/components/shared/accordion/WordCard';


export default {
  name: 'EditExampleVersion',
  components: {
    ExampleTextWithHighlightedEntitiesInput,
    EntityAccordion,
    WordCard
  },
  props: {
    from: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      hideDropdown: true,
      isOpen: false,
      entityModal: false,
      isEntityInputActive: false,
      selectedEntities: [],
      entity: ''
    }
  },
  extends: EditExampleBase,
  computed: {
    words() {
      return this.text
        .split(' ')
        .map((word, index) => ({
          text: word,
          hasEntity: (this.pendingEntities.filter(e => this.text.substring(e.start, e.end) === word) || '').length > 0,
          start: this.text.indexOf(word),
          end: this.text.indexOf(word) + word.length
        }))
    },
    sentence() {
      const {
        sentenceId,
        text,
        language,
        intent,
        allEntities,
      } = this;

      return {
        id: sentenceId,
        text,
        language,
        intent,
        entities: allEntities,
      };
    }
  },
  methods: {
    cancelEditVersion() {
      this.$emit('cancel')
    },
    async saveVersion() {
      if (this.from !== 'suggestions') {
        await this.onSubmit();
        this.cancelEditVersion();
      } else {
        this.$emit('dispatchSave', this.version)
        this.cancelEditVersion();
      }
    },
    addEntity() {
      if (this.textSelected) {
        this.addPendingEntity();
      } else {
        this.entityModal = true
      }
    },
    onWordSelected(event) {
      const start = this.text.indexOf(event.text);
      const end = start + event.text.length

      if (event.value) {
        this.selectedEntities.push({
          end,
          entity: this.entity,
          start,
        });
      } else {
        this.selectedEntities = this.selectedEntities.filter(e => e.start !== start)
      }
    },
    cancelEditEntity() {
      this.selectedEntities = []
      this.entityModal = false
      this.entity = ''
    },
    setEntity() {
      this.pendingEntities.push(...this.selectedEntities)
      this.pendingEntities = this.pendingEntities.map(entity => ({
        ...entity,
        class: ''
      }))

      this.cancelEditEntity();
    },
    onInputClick() {
      this.isEntityInputActive = !this.isEntityInputActive
    }
  }
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.edit-sentence {
  background: transparent;
  border-top: 1px solid #E2E6ED;
  border-radius: 4px;
  margin-top: 1rem;

  &__wrapper {
    max-width: 100%;
    margin: 0;
    flex-wrap: wrap;
  }

  &__input {
     margin: 0 .5rem;

     &__wrapper {
       display: flex;
       flex-wrap: wrap;
       padding: 0.25rem;
       width: 70%;
     }

     &__label /deep/ {
       font-weight: normal;
     }
  }

  &__add-entity-button-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    max-width: 50vw;
  }

  &-input {
    margin: .5rem 0;
  }

  &__btn-wrapper{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1rem .5rem;

    &__button{
      width: 50%;
    }

    a {
      font-family: 'Lato';
      font-weight: 400;
      font-size: 12px;
      color: #67738B;
      text-decoration: underline
    }
  }
  &__label {
    display: flex;

    p {
      margin-right: $unnnic-spacing-stack-xs;
    }
  }
}
.button--full {
  width: 100%;
}
.add-entity {
  padding: .4rem 1rem;
  margin: .5rem .5rem 1rem;
  border: 1px solid #E2E6ED;
  border-radius: 8px;
}
.entity-input:nth-child(even) {
  padding-left: .5rem !important;
  padding-right: 0 !important;
}

.words-wrapper {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.word {
  width: 48%;
  margin: 0 !important;
}

/deep/ .column.is-6 {
  flex: auto;
  max-width: 50%;
  padding: .5rem;
}
/deep/ .column.is-3 {
  flex: auto;
  padding: .5rem;
}
/deep/ .textarea {
    border: .0625rem solid #e2e6ed;
    border-radius: .25rem;
    color: #4e5666;
    font-weight: 400;
    font-size: .75rem;
    box-sizing: border-box;
    width: 100%;
    padding: .5rem 1rem;
    height: 38px !important;
}

/deep/ .input {
  height: auto;
}
/deep/ .example-txt-w-highlighted-entities__entity {
  font-size: .75rem;
  border: 2px solid transparent;
}
/deep/ .hidden .unnnic-autocomplete__container-list{
  display: none;
}
/deep/ .unnnic-form__label {
  font-family: Lato;
}
/deep/ .unnnic-form__label strong {
  color: #67738B;
  font-weight: 400;
  text-decoration: solid #67738B underline;
}
/deep/ .unnnic-autocomplete__container-list {
  z-index: 2;
}
/deep/ .example-txt-w-highlighted-entities__entity {
  padding: 0.5rem 0.9rem;
}
/deep/ .expander__body, /deep/ .expander__trigger {
  padding: 0;
}
/deep/ .dropdown {
  display: block;
}
/deep/ .unnnic-modal-container-background-body-alert_icon {
  display: none;
}

/deep/ .unnnic-modal-container-background-body {
  padding-top: 2rem;
}
/deep/ .expander__trigger__icon {
  margin-top: 2px;
}
/deep/ .unnnic-modal-container-background-body-description {
  padding-bottom: 0;
}
</style>
