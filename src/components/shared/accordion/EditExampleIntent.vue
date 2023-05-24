<template>
  <div class="edit-sentence">
    <form>
      <div class="columns edit-sentence__wrapper">
        <div class="column is-6">
            <p
              slot="label"
              class="unnnic-form__label"
              v-html="$t('webapp.example.sentence')" />
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
        <div class="column is-3">
          <unnnic-autocomplete
            size="sm"
            :message="errors.non_field_errors"
            :type="errors.non_field_errors
                    && errors.non_field_errors.length > 0 ? 'error' : 'normal'"
            :label="$t('webapp.example.intent')"
            v-model="intent"
            :data="filterIntents"
            :placeholder="$t('webapp.example.intent')"
            :openWithFocus="true"
            @input="intent = intentFormatters(intent)"
            @click.native="hideDropdown = false"
            :class="hideDropdown ? 'hidden' : ''"
          >
          </unnnic-autocomplete>
        </div>
        <div class="column is-3">
          <unnnic-select
            size="sm"
            :label="$t('webapp.inbox.language')"
            :placeholder="$t('webapp.inbox.language')"
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
        </div>
      </div>
      <div class="add-entity">
        <entity-accordion :open.sync="isOpen">
          <div slot="header" class="level">
            <div class="badges-card__header">
              <p
                class="unnnic-form__label"
              >
                {{ $t('webapp.home.entities_list') }}
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
            <div class="columns edit-sentence__wrapper mb-2">
              <div
                v-for="(entity, index) in entitiesToEdit"
                :key="`entity-${index}`"
                class="column is-6 pl-0 pt-0 entity-input">
                <p
                  slot="label"
                  class="unnnic-form__label"
                  v-html="$t('webapp.example.text_is', {text: highlightedText(entity) })" />
                <unnnic-autocomplete
                  size="sm"
                  :data="filterEntities(index, false)"
                  v-model="entity.entity"
                  :placeholder="$t('webapp.example.entity')"
                  :openWithFocus="true"
                  @input="entitiesToEdit[index].entity = intentFormatters(entity.entity)"
                  @icon-right-click="removeEntity(entity, index)"
                  @click.native="hideDropdown = false"
                  :class="hideDropdown ? 'hidden' : ''"
                  :iconRight="entity ? 'delete-1-1' : ''"
                />
              </div>
              <div
                v-for="(entity, index) in pendingEntities"
                :key="`pending-entity-${index}`"
                class="column is-6 pl-0 pt-0 entity-input">
                <p
                  slot="label"
                  class="unnnic-form__label"
                  v-html="$t('webapp.example.text_is', {text: highlightedText(entity) })" />
                <unnnic-autocomplete
                  size="sm"
                  :data="filterEntities(index, true)"
                  :custom-formatter="intentFormatters"
                  v-model="entity.entity"
                  :placeholder="$t('webapp.example.entity')"
                  :iconRight="entity ? 'delete-1-1' : ''"
                  class="edit-sentence-input"
                  @input="pendingEntities[index].entity = intentFormatters(entity.entity)"
                  @icon-right-click="removePendingEntity(entity, index)"
                  @click.native="hideDropdown = false"
                  :class="hideDropdown ? 'hidden' : ''"
                />
              </div>
              <b-field
                :message="errors.entities"
                type="is-danger" />
            </div>
            <unnnic-button
              iconLeft="add-1"
              class="button--full mb-3"
              type="terciary"
              size="small"
              @click.prevent.stop="addEntity"
            >
              <span class="edit-sentence__add-entity-button-text">{{ entityButtonText }} </span>
            </unnnic-button>
          </div>
        </entity-accordion>
        <unnnic-modal
          :showModal="entityModal"
          :text="$t('webapp.trainings.add_entity_modal_title')"
          :closeIcon="false"
        >
          <div slot="message" class="modal-header text-left">
            <unnnic-autocomplete
                :label="$t('webapp.trainings.add_entity_field_label')"
                ref="entityInputField"
                :data="getAllEntities"
                v-model="entity"
                :openWithFocus="true"
                :iconRight="isEntityInputActive ? 'arrow-button-up-1' : 'arrow-button-down-1'"
                @focus="onInputClick()"
                @blur="onInputClick()"
            />
            <div>
              <unnnic-label class="mt-5" :label="$t('webapp.trainings.add_entity_checkbox_title')"/>
              <div class="words-wrapper">
                <word-card
                  v-for="(word, index) in words"
                  :key="index"
                  class="word"
                  :checked="false"
                  :checkable="!word.hasEntity && entity.length > 0"
                  :text="word.text"
                  @onChange="onWordSelected"
                />
              </div>
            </div>
          </div>
          <unnnic-button slot="options" type="terciary" @click.prevent.stop="cancelEditEntity()">
            {{ $t("webapp.home.cancel") }}
          </unnnic-button>
          <unnnic-button
            slot="options"
            class="create-repository__container__button"
            type="secondary"
            @click.prevent.stop="setEntity()"
          >
            {{ $t("webapp.trainings.add_entity_finish_edit") }}
          </unnnic-button>
        </unnnic-modal>
      </div>
      <div
        class="edit-sentence__btn-wrapper">
        <div class="column p-0 is-flex is-justify-content-space-between">
          <unnnic-button
            class="mr-4 edit-sentence__btn-wrapper__button"
            type="terciary"
            size="small"
            @click.prevent.stop="cancelEditSentence">
            {{ $t('webapp.trainings.cancel_button') }}
          </unnnic-button>
          <unnnic-button
            type="secondary"
            size="small"
            class="edit-sentence__btn-wrapper__button"
            :disabled="!isValid || submitting"
            :tooltip-hover="!isValid ? validationErrors : null"
            :loading="submitting"
            @click.prevent.stop="saveSentence">
            <slot v-if="!submitting">{{ $t(saveButtonLabel) }}</slot>
          </unnnic-button>
        </div>
        <!-- <div>
          <a
            href="https://docs.weni.ai/l/pt/bothub/testando-seu-dataset#adicionando_entidades"
            target="_blank"
          >
            {{ $t('webapp.trainings.entities_info') }}
          </a>
        </div> -->
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
  name: 'EditExampleIntent',
  components: {
    ExampleTextWithHighlightedEntitiesInput,
    EntityAccordion,
    WordCard
  },
  props: {
    from: {
      type: String,
      default: null
    },
  },
  data() {
    return {
      hideDropdown: true,
      isOpen: false,
      entityModal: false,
      isEntityInputActive: false,
      selectedEntities: [],
      entity: '',
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
    },
    saveButtonLabel() {
      return this.$route.name === 'repository-database' ? 'webapp.trainings.database_save_button' : 'webapp.trainings.save_button'
    }
  },
  methods: {
    cancelEditSentence() {
      this.$emit('cancel')
    },
    async saveSentence() {
      const from = this.$route.name
      if (from === 'repository-suggestion') {
        this.$emit('dispatchSave', this.sentence)
        this.cancelEditSentence();
      } else if (from === 'repository-database') {
        this.$emit('dispatchToTraining', this.sentence);
        this.cancelEditSentence();
      } else {
        await this.onSubmit();
        this.cancelEditSentence();
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
