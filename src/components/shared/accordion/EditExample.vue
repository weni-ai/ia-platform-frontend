<template>
  <div class="edit-sentence">
    <form>
      <div class="columns edit-sentence__wrapper">
        <div class="column is-7">
          <BField
            :errors="errors.text || errors.language"
            :label="$t('webapp.example.sentence')"
          >
            <ExampleTextWithHighlightedEntitiesInput
              ref="textInput"
              v-model="text"
              :entities="allEntities"
              :placeholder="$t('webapp.example.enter_sentence')"
              size="normal"
              @textSelected="setTextSelected($event)"
              @entityEdited="onEditEntity($event)"
              @entityAdded="onEntityAdded()"
            />
          </BField>
        </div>
        <div class="column is-5">
          <BField
            :message="errors.non_field_errors"
            :type="{
              'is-danger':
                errors.non_field_errors && errors.non_field_errors.length > 0,
            }"
            :label="$t('webapp.example.intent')"
          >
            <BAutocomplete
              v-model="intent"
              :data="filterIntents"
              :placeholder="$t('webapp.example.intent')"
              dropdownPosition="bottom"
              openOnFocus
              @input="intent = intentFormatters(intent)"
            />
          </BField>
        </div>
      </div>
      <div class="edit-sentence__wrapper">
        <div class="edit-sentence__input__wrapper">
          <div
            v-for="(entity, index) in entitiesToEdit"
            :key="`entity-${index}`"
            class="edit-sentence__input"
          >
            <BField>
              <span
                slot="label"
                class="edit-sentence__input__label"
                v-html="
                  $t('webapp.example.text_is', {
                    text: highlightedText(entity),
                  })
                "
              />
              <BAutocomplete
                :data="filterEntities(index, false)"
                v-model="entity.entity"
                :placeholder="$t('webapp.example.entity')"
                dropdownPosition="bottom"
                iconRight="close"
                iconRightClickable
                openOnFocus
                class="edit-sentence-input"
                @input="
                  entitiesToEdit[index].entity = intentFormatters(entity.entity)
                "
                @icon-right-click="removeEntity(entity, index)"
              />
            </BField>
          </div>
          <div
            v-for="(entity, index) in pendingEntities"
            :key="`pending-entity-${index}`"
            class="edit-sentence__input"
          >
            <BField>
              <span
                slot="label"
                class="edit-sentence__input__label"
                v-html="
                  $t('webapp.example.text_is', {
                    text: highlightedText(entity),
                  })
                "
              />
              <BAutocomplete
                :data="filterEntities(index, true)"
                :customFormatter="intentFormatters"
                v-model="entity.entity"
                :placeholder="$t('webapp.example.entity')"
                dropdownPosition="bottom"
                iconRight="close"
                class="edit-sentence-input"
                iconRightClickable
                openOnFocus
                @input="
                  pendingEntities[index].entity = intentFormatters(
                    entity.entity,
                  )
                "
                @select="elevateToEntity(entity, index)"
                @icon-right-click="removePendingEntity(entity, index)"
              />
            </BField>
          </div>
        </div>
        <BField
          :message="errors.entities"
          type="is-danger"
        />
      </div>
      <div class="edit-sentence__btn-wrapper">
        <BButton
          :disabled="textSelected === null"
          rounded
          type="is-primary"
          @click.prevent.stop="addPendingEntity"
        >
          <span class="edit-sentence__add-entity-button-text"
            >{{ entityButtonText }}
          </span>
        </BButton>
        <div>
          <BButton
            class="edit-sentence__btn-wrapper__cancelButton"
            @click="cancelEditSentence"
          >
            {{ $t('webapp.trainings.cancel_button') }}
          </BButton>
          <BButton
            :disabled="!isValid || submitting"
            :tooltipHover="!isValid ? validationErrors : null"
            :loading="submitting"
            class="edit-sentence__btn-wrapper__saveButton"
            @click="onSubmit"
          >
            <slot v-if="!submitting">{{
              $t('webapp.trainings.save_button')
            }}</slot>
          </BButton>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import EditExampleBase from './EditExampleBase';
import ExampleTextWithHighlightedEntitiesInput from '@/components/inputs/ExampleTextWithHighlightedEntitiesInput';

export default {
  name: 'EditExample',
  components: {
    ExampleTextWithHighlightedEntitiesInput,
  },
  extends: EditExampleBase,
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

.edit-sentence {
  &__wrapper {
    max-width: 100%;
    margin: 0 1rem;
  }

  &__input {
    margin: 0 0.5rem;

    &__wrapper {
      display: flex;
      flex-wrap: wrap;
      padding: 0.25rem;
      width: 70%;
    }

    :deep(&__label) {
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
    margin: 0.5rem 0;
  }

  &__btn-wrapper {
    display: flex;
    justify-content: space-between;
    margin: 1rem 1.7rem 0.7rem 1.7rem;

    &__cancelButton {
      height: 2.25rem;
      width: 6rem;
      background-color: $color-primary;
      color: $color-white;
    }

    &__saveButton {
      height: 2.25rem;
      width: 6rem;
      background-color: $color-secondary;
      color: $color-white;
    }
  }
}
</style>
