<template>
  <div>
    <entity-accordion :open.sync="isOpen">
      <div slot="header" class="level">
        <div class="badges-card__header">
          <p
            class="unnnic-form__label"
          >
            {{ $t('webapp.trainings.entities') }}
            <unnnic-tool-tip
              side="top"
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
        </div>
      </div>
      <div slot="icon" class="level example-accordion__btns-wrapper">
        <unnnic-icon-svg
          :icon="`${isOpen ? 'arrow-button-down-1' : 'arrow-right-1-1'}`"
          size="xs"
        />
      </div>
      <div slot="body">
        <div class="columns is-flex-wrap-wrap mt-0">
          <entity-form
            v-for="entity in preparedEntities"
            :key="entity.localId"
            v-model="entity.entity"
            :available-entities="allEntities"
            :entity-class="getEntityClass(entity)"
            :text="text"
            :selected-text-start="entity.start"
            :selected-text-end="entity.end"
            :new-entity="entity.selectedEntity"
            @removeEntity="() => removeEntity(entity)"
          />
        </div>
        <unnnic-button
          id="tour-training-step-2"
          ref="addEntityBtn"
          :is-next-disabled="true"
          :is-previous-disabled="true"
          :is-step-blocked="!blockedNextStepTutorial"
          :disabled="!text"
          iconLeft="add-1"
          class="button--full mt-5"
          type="terciary"
          size="large"
          @click.prevent.stop="addEntity()"
        >
          <span class="add-entity-button-text">
            <span v-if="textSelectedValue">
              {{ $t('webapp.trainings.add_entity_for') }} "{{ textSelectedValue }}"
            </span>
            <span v-else>{{ $t('webapp.trainings.add_entity') }}</span>
          </span>
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
            v-model="entity"
            :data="allEntities"
            :openWithFocus="true"
            :iconRight="isEntityInputActive ? 'arrow-button-up-1' : 'arrow-button-down-1'"
            @focus="onInputClick()"
            @blur="onInputClick()"
        />
        <div>
          <unnnic-label  class="mt-5" :label="$t('webapp.trainings.add_entity_checkbox_title')" />
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
</template>

<script>
import { getEntityColor } from '@/utils/entitiesColors';
import { generateTemporaryId, formatters } from '@/utils';
import { mapGetters } from 'vuex';
import _ from 'lodash';
import EntityForm from './EntityForm';
import EntityAccordion from '@/components/shared/accordion/EntityAccordion';
import WordCard from '@/components/shared/accordion/WordCard';

export default {
  name: 'NewEntitiesInput',
  components: {
    EntityForm,
    EntityAccordion,
    WordCard
  },
  props: {
    value: {
      type: Array,
      default: () => ([]),
    },
    repository: {
      type: [Object, String],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    textSelected: {
      type: Object,
      default: null,
    },
    availableEntities: {
      type: Array,
      default: () => ([]),
    },
    entitiesForEdit: {
      type: Array,
      default: () => ([]),
    },
  },
  data() {
    return {
      entities: _.cloneDeep(this.value),
      errors: '',
      blockedNextStepTutorial: false,
      isOpen: false,
      entityModal: false,
      entity: '',
      isEntityInputActive: false,
      selectedEntities: []
    };
  },
  computed: {
    ...mapGetters({
      repositoryVersion: 'getSelectedVersion',
    }),
    textSelectedValue() {
      if (!this.textSelected) {
        return null;
      }

      const { start, end } = this.textSelected;
      return formatters.bothubItemKey()(this.text.substring(start, end));
    },
    preparedEntities() {
      return [...this.entities].sort((a, b) => (a.start - b.start));
    },
    allEntities() {
      if (!(this.repository && this.repository.entities)) return [];
      return this.repository.entities.map(entity => entity.value);
    },
    words() {
      return this.text
        .split(' ')
        .map((word, index) => ({
          text: word,
          hasEntity: (this.entities.filter(e => this.text.substring(e.start, e.end) === word) || '').length > 0,
          start: this.text.indexOf(word),
          end: this.text.indexOf(word) + word.length
        }))
    },
  },
  watch: {
    preparedEntities(value) {
      this.$emit('input', value);
    },
    text(text, oldText) {
      this.validateEntities(text, oldText);
    },
    entity() {
      this.entity = formatters.bothubItemKey()(this.entity);
    },
  },
  methods: {
    removeEntity(entity) {
      this.entities = this.entities.filter(e => e.localId !== entity.localId);
    },
    getEntityClass(entity) {
      const color = getEntityColor(entity);
      return `entity-${color}`;
    },
    addEntity() {
      if (this.textSelectedValue) {
        const temporaryEntityId = generateTemporaryId();

        this.entities.push({
          ...this.textSelected,
          entity: this.textSelectedValue,
          localId: temporaryEntityId,
        });

        this.blockedNextStepTutorial = !this.blockedNextStepTutorial;
        this.$emit('entityAdded');
      } else {
        this.entityModal = true
      }
    },
    validateEntities(text, oldText) {
      /*
        Entity follow text,
        based in https://github.com/RasaHQ/rasa-nlu-trainer/blob/master/src/components-v1/TextEditor.js
      */
      this.entities.forEach((entity, i) => {
        const oldEntityText = oldText.substring(entity.start, entity.end);

        const findClosestStart = (lastMatch) => {
          if (lastMatch === undefined) {
            const index = text.indexOf(oldEntityText);
            return index === -1
              ? index
              : findClosestStart(index);
          }

          const from = lastMatch + oldEntityText.length;
          const index = text.indexOf(oldEntityText, from);

          if (index === -1) {
            return lastMatch;
          }

          const prevDiff = Math.abs(entity.start - lastMatch);
          const nextDiff = Math.abs(entity.start - index);

          return prevDiff < nextDiff
            ? lastMatch
            : findClosestStart(index);
        };

        const start = findClosestStart();
        if (start === -1) {
          this.entities[i] = false;
          return false;
        }

        this.entities[i].start = start;
        this.entities[i].end = start + oldEntityText.length;
        return true;
      });
      this.entities = this.entities.filter(value => !!value);
    },
    onInputClick() {
      this.isEntityInputActive = !this.isEntityInputActive
    },
    onWordSelected(event) {
      const temporaryEntityId = generateTemporaryId();
      const start = this.text.indexOf(event.text);
      const end = start + event.text.length

      if (event.value) {
        this.selectedEntities.push({
          end,
          entity: this.entity,
          localId: temporaryEntityId,
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
      this.entities.push(...this.selectedEntities)
      this.entities = this.entities.map(entity => ({
        ...entity,
        selectedEntity: entity.entity
      }))

      this.blockedNextStepTutorial = !this.blockedNextStepTutorial;
      this.$emit('entityAdded');
      this.cancelEditEntity();
    }
  },
};
</script>

<style scoped lang="scss">
  .add-entity-button-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    max-width: 40vw;
  }
  .button--full {
  width: 100%;
}

.entities-wrapper {
  padding: 0 1rem;
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

/deep/ .unnnic-modal-container-background-body-alert_icon {
  display: none;
}

/deep/ .unnnic-modal-container-background-body {
  padding-top: 1rem;
}
</style>
