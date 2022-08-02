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
      <div class="columns edit-sentence__wrapper">
          <div
            v-for="(entity, index) in entitiesToEdit"
            :key="`entity-${index}`"
            class="column is-6">
            <p
              slot="label"
              class="unnnic-form__label"
              v-html="$t('webapp.example.text_is', {text: highlightedText(entity) })" />
            <unnnic-autocomplete
              :data="filterEntities(index, false)"
              v-model="entity.entity"
              :placeholder="$t('webapp.example.entity')"
              dropdown-position="bottom"
              open-on-focus
              @input="entitiesToEdit[index].entity = intentFormatters(entity.entity)"
              @icon-right-click="removeEntity(entity, index)"
              @click.native="hideDropdown = false"
              :class="hideDropdown ? 'hidden' : ''"
            >
            </unnnic-autocomplete>
          </div>
          <div
            v-for="(entity, index) in pendingEntities"
            :key="`pending-entity-${index}`"
            class="column is-6">
            <p
              slot="label"
              class="unnnic-form__label"
              v-html="$t('webapp.example.text_is', {text: highlightedText(entity) })" />
            <unnnic-autocomplete
              :data="filterEntities(index, true)"
              :custom-formatter="intentFormatters"
              v-model="entity.entity"
              :placeholder="$t('webapp.example.entity')"
              dropdown-position="bottom"
              icon-right="close"
              class="edit-sentence-input"
              icon-right-clickable
              open-on-focus
              @input="pendingEntities[index].entity = intentFormatters(entity.entity)"
              @select="elevateToEntity(entity, index)"
              @icon-right-click="removePendingEntity(entity, index)"
              @click.native="hideDropdown = false"
              :class="hideDropdown ? 'hidden' : ''"
            >
            </unnnic-autocomplete>
          </div>
          <b-field
            :message="errors.entities"
            type="is-danger" />
        </div>
      <div
        class="edit-sentence__btn-wrapper">
        <div>
          <unnnic-button
            type="secondary"
            size="small"
            class="mr-3 edit-sentence__btn-wrapper__button"
            :disabled="!isValid || submitting"
            :tooltip-hover="!isValid ? validationErrors : null"
            :loading="submitting"
            @click="onSubmit">
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
    margin: 0 1rem;
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
    margin: 1rem 1.7rem 0.7rem 1.7rem;

    &__button{
      width: 128px;
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
/deep/ .column.is-6 {
  flex: auto;
  max-width: 50%;
}
/deep/ .textarea {
  // background: #fff;
  border: .0625rem solid #e2e6ed;
  border-radius: .25rem;
  color: #4e5666;
  font-weight: 400;
  font-size: .875rem;
  box-sizing: border-box;
  width: 100%;
}
/deep/ .example-txt-w-highlighted-entities__entity {
  font-size: .875rem;
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
  font-weight: 900;
}
</style>
