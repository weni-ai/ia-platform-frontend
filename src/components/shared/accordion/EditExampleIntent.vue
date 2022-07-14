<template>
  <div class="edit-sentence">
    <form>
      <div class="columns edit-sentence__wrapper">
        <div class="column is-6">
          <unnnic-input
              :errors="errors.text || errors.language"
              :label="$t('webapp.example.sentence')"
              ref="textInput"
              v-model="text"
              :entities="allEntities"
              :placeholder="$t('webapp.example.enter_sentence')"
              @textSelected="setTextSelected($event)"
              @entityEdited="onEditEntity($event)"
              @entityAdded="onEntityAdded()"
            >
            <!-- <example-text-with-highlighted-entities-input
              ref="textInput"
              v-model="text"
              :entities="allEntities"
              :placeholder="$t('webapp.example.enter_sentence')"
              size="normal"
              @textSelected="setTextSelected($event)"
              @entityEdited="onEditEntity($event)"
              @entityAdded="onEntityAdded()"
            /> -->
          </unnnic-input>
        </div>
        <div class="column is-6">
          <unnnic-input
            :message="errors.non_field_errors"
            :type="{ 'is-danger': errors.non_field_errors && errors.non_field_errors.length > 0 }"
            :label="$t('webapp.example.intent')"
            v-model="intent"
            :data="filterIntents"
            :placeholder="$t('webapp.example.intent')"
            dropdown-position="bottom"
            open-on-focus
            @input="intent = intentFormatters(intent)"
          >
            <!-- <b-autocomplete
              v-model="intent"
              :data="filterIntents"
              :placeholder="$t('webapp.example.intent')"
              dropdown-position="bottom"
              open-on-focus
              @input="intent = intentFormatters(intent)" /> -->
          </unnnic-input>
        </div>
      </div>
      <div class="edit-sentence__wrapper">
        <div
          class="edit-sentence__input__wrapper">
          <div
            v-for="(entity, index) in entitiesToEdit"
            :key="`entity-${index}`"
            class="edit-sentence__input column is-6">
            <unnnic-input >
              <span
                slot="label"
                v-html="$t('webapp.example.text_is', {text: highlightedText(entity) })" />
              <b-autocomplete
                :data="filterEntities(index, false)"
                v-model="entity.entity"
                :placeholder="$t('webapp.example.entity')"
                dropdown-position="bottom"
                icon-right="close"
                icon-right-clickable
                open-on-focus
                @input="entitiesToEdit[index].entity = intentFormatters(entity.entity)"
                @icon-right-click="removeEntity(entity, index)"
              />
            </unnnic-input>
          </div>
          <div
            v-for="(entity, index) in pendingEntities"
            :key="`pending-entity-${index}`"
            class="edit-sentence__input column is-6">
            <unnnic-input
                v-model="entity.entity"
                :placeholder="$t('webapp.example.entity')"
                dropdown-position="bottom"
                icon-right="close"
                icon-right-clickable
                open-on-focus
                @input="pendingEntities[index].entity = intentFormatters(entity.entity)"
                @select="elevateToEntity(entity, index)"
                @icon-right-click="removePendingEntity(entity, index)"
            >
              <!-- <span
                slot="label"
                class="edit-sentence__input__label"
                v-html="$t('webapp.example.text_is', {text: highlightedText(entity) })" />
              <b-autocomplete
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
              /> -->
            </unnnic-input>
          </div>
        </div>
        <b-field
          :message="errors.entities"
          type="is-danger" />
      </div>
      <div
        class="edit-sentence__btn-wrapper">
        <!-- <unnnic-button
          :disabled="textSelected === null"
          rounded
          type="is-primary"
          @click.prevent.stop="addPendingEntity"
        >
          <span class="edit-sentence__add-entity-button-text">{{ entityButtonText }} </span>
        </unnnic-button> -->
        <div>
          <unnnic-button
            type="secondary"
            class="mr-6"
            :disabled="!isValid || submitting"
            :tooltip-hover="!isValid ? validationErrors : null"
            :loading="submitting"
            @click="onSubmit">
            <slot v-if="!submitting">{{ $t('webapp.trainings.save_button') }}</slot>
          </unnnic-button>
          <unnnic-button
            type="terciary"
            @click.prevent.stop="cancelEditSentence">
            {{ $t('webapp.trainings.cancel_button') }}
          </unnnic-button>
        </div>
        <div>
          <a
            href="https://docs.weni.ai/l/pt/bothub/testando-seu-dataset#adicionando_entidades"
            target="_blank"
          >
            Como adicionar novas entidades a partir da frase?
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
  extends: EditExampleBase,
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.edit-sentence {

  &__wrapper {
    max-width: 100%;
    margin: 0 1rem;
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

    &__cancelButton{
      height: 2.25rem;
      width: 6rem;
      background-color:$color-primary;
      color: $color-white;
    }

    &__saveButton{
      height: 2.25rem;
      width: 6rem;
      background-color:$color-secondary;
      color: $color-white;
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

</style>
