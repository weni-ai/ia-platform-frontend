<template>
  <div>
    <UnnnicTable :items="list">
      <template v-slot:header>
        <UnnnicTableRow :headers="table.headers">
          <template v-slot:checkarea>
            <UnnnicCheckbox
              :value="generalValue"
              @change="changeGeneralCheckbox"
              :style="{ margin: '4px' }"
            />
          </template>
        </UnnnicTableRow>
      </template>

      <template v-slot:item="{ item }">
        <UnnnicTableRow :headers="table.headers">
          <template v-slot:sentence>
            <div
              @mouseenter="activeSentence(item)"
              @mouseleave="inactiveSentence(item)"
              :title="item.sentence"
              class="break-text example-accordion__sentence"
            >
              <span class="example-accordion__tag">[{{ item.language }}]</span>
              <HighlightedEntity
                :ref="item.id"
                :id="item.id"
                :text="item.text"
                :highlighted="item.highlighted"
                :entities="item.entities"
                :colorOnly="item.entitySelected"
                :state="isSentenceActive"
              />
            </div>
          </template>

          <template
            v-if="repository.authorization.can_contribute"
            v-slot:edit
          >
            <div :style="{ textAlign: 'center' }">
              <UnnnicButton
                size="small"
                type="secondary"
                iconCenter="pencil-write-1"
                @click.prevent.stop="editSentence(item.id)"
              />
            </div>
          </template>

          <template v-slot:delete>
            <div :style="{ textAlign: 'center' }">
              <UnnnicButton
                size="small"
                type="secondary"
                iconCenter="delete-1-1"
                @click.prevent.stop="deleteSentence(item)"
              />
            </div>
          </template>
        </UnnnicTableRow>
        <EditExampleIntent
          v-if="item.id === selectedItem"
          :entities="item.entities"
          :intentToEdit="item.intent"
          :editExample="true"
          :textToEdit="item.text"
          :sentenceId="item.id"
          :languageEdit="item.language"
          :getAllEntities="getEntitiesName"
          @saveList="updateList"
          @cancel="cancelEditSentence"
          @dispatchSave="saveSentence"
        />
      </template>
    </UnnnicTable>
    <UnnnicModal
      :showModal="openModal"
      :text="$t('webapp.trainings.delete_title')"
      scheme="feedback-red"
      modalIcon="alert-circle-1"
      @close="openModal = false"
    >
      <span
        slot="message"
        v-html="$t('webapp.trainings.delete_phrase_modal')"
      />
      <UnnnicButton
        slot="options"
        type="tertiary"
        @click="openModal = false"
      >
        {{ $t('webapp.home.cancel') }}
      </UnnnicButton>
      <UnnnicButton
        slot="options"
        type="primary"
        scheme="feedback-red"
        @click="confirmDelete()"
      >
        {{ $t('webapp.trainings.delete_title') }}
      </UnnnicButton>
    </UnnnicModal>
    <UnnnicModal
      :showModal="openSuccessModal"
      :text="$t('webapp.intent.delete_success_title')"
      scheme="feedback-green"
      modalIcon="check-circle-1-1"
      @close="openSuccessModal = false"
    >
      <span
        slot="message"
        v-html="$t('webapp.intent.delete_success_subtitle')"
      />
    </UnnnicModal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { getEntityColor } from '@/utils/entitiesColors';
import ExampleInfo from '@/components/shared/accordion/ExampleInfo';
import EditExampleIntent from '@/components/shared/accordion/EditExampleIntent';
import EditExample from '@/components/shared/accordion/EditExample';
import SentenceAccordion from '@/components/shared/accordion/SentenceAccordion';
import HighlightedEntity from '@/components/shared/HighlightedEntity';
import LanguageBadge from '@/components/shared/LanguageBadge';
import BadgesCard from '@/components/repository/BadgesCard';

export default {
  name: 'GeneratedSentencesTable',
  components: {
    SentenceAccordion,
    ExampleInfo,
    EditExampleIntent,
    EditExample,
    HighlightedEntity,
    LanguageBadge,
    BadgesCard,
  },
  props: {
    text: {
      type: String,
      default: '',
    },
    list: {
      type: Array,
      default: () => [],
    },
    entities: {
      type: Array,
      default: /* istanbul ignore next */ () => [],
    },
  },
  data() {
    return {
      open: false,
      deleteDialog: null,
      remove: true,
      highlighted: null,
      editing: false,
      table: {
        headers: [
          {
            id: 'sentence',
            text: this.$t('webapp.intent.table_sentence'),
            flex: 1,
          },
          {
            id: 'edit',
            text: this.$t('webapp.intent.table_edit'),
            width: '40px',
          },
          {
            id: 'delete',
            text: this.$t('webapp.intent.table_delete'),
            width: '40px',
          },
        ],
      },
      openModal: false,
      sentence: null,
      openSuccessModal: false,
      isSentenceActive: false,
      selectedItem: null,
    };
  },

  computed: {
    ...mapState({
      repository: (state) => state.Repository.selectedRepository,
    }),
    entitiesList() {
      return this.entities.map((entity) => ({
        value: entity.value,
        class: this.getEntityClass(entity.entity),
        group: entity.group,
        ...entity,
      }));
    },
    getEntitiesName() {
      const allEntitiesName = this.repository.entities.map(
        (entityValue) => entityValue.value,
      );
      return allEntitiesName;
    },
  },
  watch: {
    sentence(value) {
      if (value) {
        const { id } = value;
        // eslint-disable-next-line no-underscore-dangle
        this.$refs[id]._data.active = this.isSentenceActive;
      }
    },
  },
  methods: {
    getEntityClass(entity) {
      const allEntitiesName = this.repository.entities.map(
        (entityValue) => entityValue.value,
      );
      const color = getEntityColor(entity, allEntitiesName);
      return `entity-${color}`;
    },
    deleteSentence(item) {
      this.openModal = true;
      this.sentence = item;
    },
    confirmDelete() {
      this.$emit('onDeleteSentence', this.sentence);
      this.openModal = false;
    },
    activeSentence(item) {
      const { id } = item;
      // eslint-disable-next-line no-underscore-dangle
      this.$refs[id]._data.active = true;
    },
    inactiveSentence(item) {
      const { id } = item;
      // eslint-disable-next-line no-underscore-dangle
      this.$refs[id]._data.active = false;
    },
    cancelEditSentence() {
      this.open = !this.open;
      this.editing = false;
      this.$refs[this.selectedItem].active = false;
      this.selectedItem = null;
    },
    editSentence(id) {
      this.selectedItem = id;
      this.open = true;
      this.editing = true;
      this.$refs[id].active = true;
    },
    updateList() {
      this.$emit('updateList');
    },
    saveSentence(event) {
      this.$emit('onSaveSentence', event);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';
@import '@/assets/scss/variables.scss';
@import '@weni/unnnic-system/dist/unnnic.css';
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.example-accordion {
  &__text {
    max-width: 100%;
    font-family: $font-family;
  }

  &__tag {
    margin-right: 0.5rem;
    font-weight: 900;
    font-size: 14px;
    color: #d0d3d9;
  }

  &__icon {
    color: $color-grey-dark;
  }

  &__btns-wrapper {
    display: flex;
    justify-content: flex-end;
  }

  &__sentence {
    color: $unnnic-color-neutral-darkest;
    display: flex;
  }
}

.intent-label {
  font-family: 'Lato';
  font-size: 12px;
  color: #67738b;
  padding-top: 1px;
}

:deep(.scroll) {
  padding-right: 0;
}

:deep(.header .break-text) {
  overflow: initial;
}
:deep(.unnnic-table .header) {
  padding: 0.75rem 1.5rem;
}
:deep(.unnnic-table .item) {
  padding: 0.75rem 1.5rem;
  border: 1px solid white;

  &:last-child {
    margin-bottom: 0;
  }
}
:deep(.unnnic-table .item:hover) {
  border: 1px solid $unnnic-color-neutral-soft;
}
</style>
