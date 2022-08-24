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
        <div class="column is-6">
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
      </div>
      <div class="add-entity">
        <div class="">
          <unnnic-button
            :disabled="textSelected === null"
            iconLeft="add-1"
            class="button--full"
            type="secondary"
            size="large"
            @click.prevent.stop="addPendingEntity"
          >
            <span class="edit-sentence__add-entity-button-text">{{ entityButtonText }} </span>
          </unnnic-button>
        </div>
        <div class="columns edit-sentence__wrapper mx-0">
          <div
            v-for="(entity, index) in entitiesToEdit"
            :key="`entity-${index}`"
            class="column is-6 px-0 entity-input">
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
            class="column is-6 px-0 entity-input">
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
      </div>
      <div
        class="edit-sentence__btn-wrapper">
        <div class="column is-6 p-0 is-flex is-justify-content-space-between">
          <unnnic-button
            type="secondary"
            size="small"
            class="mr-4 edit-sentence__btn-wrapper__button"
            :disabled="!isValid || submitting"
            :tooltip-hover="!isValid ? validationErrors : null"
            :loading="submitting"
            @click="saveSentence">
            <slot v-if="!submitting">{{ $t('webapp.trainings.save_button') }}</slot>
          </unnnic-button>
          <unnnic-button
            class="edit-sentence__btn-wrapper__button"
            type="terciary"
            size="small"
            @click.prevent.stop="cancelEditSentence">
            {{ $t('webapp.trainings.cancel_button') }}
          </unnnic-button>
        </div>
        <div>
          <a
            href="https://docs.weni.ai/l/pt/bothub/testando-seu-dataset#adicionando_entidades"
            target="_blank"
          >
            {{ $t('webapp.trainings.entities_info') }}
          </a>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import EditExampleBase from './EditExampleBase';
import ExampleTextWithHighlightedEntitiesInput from '@/components/inputs/ExampleTextWithHighlightedEntitiesInput';

export default {
  name: 'EditExampleIntent',
  components: {
    ExampleTextWithHighlightedEntitiesInput,
  },
  data() {
    return {
      hideDropdown: true
    }
  },
  extends: EditExampleBase,
  methods: {
    cancelEditSentence() {
      this.$emit('cancel')
    },
    async saveSentence() {
      await this.onSubmit();
      this.cancelEditSentence();
    }
  }
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.edit-sentence {
  background: #F9F9F9;
  border: 1px solid #E2E6ED;
  border-radius: 4px;
  margin-top: 1rem;

  &__wrapper {
    max-width: 100%;
    margin: 0 .5rem;
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
    margin: 1rem;

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
  padding: 1rem;
  margin: 1rem;
  border: 1px solid #E2E6ED;
  border-radius: 8px;
}
.entity-input:nth-child(even) {
  padding-left: 1rem !important;
}
/deep/ .column.is-6 {
  flex: auto;
  max-width: 50%;
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
</style>
