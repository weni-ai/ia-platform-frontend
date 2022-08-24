<template>
<div>
  <unnnic-table :items="list.items" class="mt-4">
    <template v-slot:header>
      <unnnic-table-row :headers="table.headers">
        <template v-slot:checkarea>
          <unnnic-checkbox
            :value="generalValue"
            @change="changeGeneralCheckbox"
            :style="{ margin: '4px' }"
          />
        </template>
      </unnnic-table-row>
    </template>

    <template v-slot:item="{ item }">
      <unnnic-table-row :headers="table.headers">
        <template v-slot:checkarea>
          <unnnic-checkbox v-model="item.selected" :style="{ margin: '4px' }" />
        </template>

        <template v-slot:sentence>
          <div
            @mouseenter="activeSentence(item)"
            @mouseleave="inactiveSentence(item)"
            :title="item.sentence"
            class="break-text example-accordion__sentence"
          >
            <span class="example-accordion__tag">[{{ item.language }}]</span>
            <highlighted-entity
              :ref="item.id"
              :id="item.id"
              :text="item.text"
              :highlighted="item.highlighted"
              :entities="item.entities"
              :color-only="item.entitySelected"
              :state="isSentenceActive"
            />
            <span
              v-if="showIntents"
              class="ml-4 intent-label"
            >
              Intenção: {{ item.intent }}
            </span>
          </div>
        </template>

        <template v-slot:edit>
          <div :style="{ textAlign: 'center' }">
            <unnnic-button
              size="small"
              type="secondary"
              iconCenter="pencil-write-1"
              @click.prevent.stop="editSentence(item.id)"
            />
          </div>
        </template>

        <template v-slot:delete>
          <div :style="{ textAlign: 'center' }">
            <unnnic-button
              size="small"
              type="secondary"
              iconCenter="delete-1-1"
              @click.prevent.stop="deleteThisExample(item.id)"
            />
          </div>
        </template>
      </unnnic-table-row>
      <!-- <example-info
        v-if="!editing"
        :entities-list="entitiesList"
        :highlighted.sync="highlighted"
        :intent="intent"
      /> -->

      <edit-example-intent
        v-if="item.id === selectedItem"
        :entities="item.entities"
        :intent-to-edit="item.intent"
        :edit-example="true"
        :text-to-edit="item.text"
        :sentence-id="item.id"
        :language-edit="item.language"
        :get-all-entities="getEntitiesName"
        @saveList="updateList"
        @cancel="cancelEditSentence"
      />
    </template>
  </unnnic-table>
  <unnnic-modal
    :showModal="openModal"
    :text="$t('webapp.trainings.delete_title')"
    scheme="feedback-red"
    modal-icon="alert-circle-1"
    @close="openModal = false"
  >
    <span
    slot="message"
    v-html="$t('webapp.trainings.delete_phrase_modal')" />
    <unnnic-button slot="options" type="terciary" @click="openModal = false">
      {{ $t("webapp.home.cancel") }}
    </unnnic-button>
    <unnnic-button
      slot="options"
      type="primary"
      scheme="feedback-red"
      @click="confirmDelete()"
    >
      {{ $t("webapp.trainings.delete_title") }}
    </unnnic-button>
  </unnnic-modal>
  <unnnic-modal
    :showModal="openSuccessModal"
    :text="$t('webapp.intent.delete_success_title')"
    scheme="feedback-green"
    modal-icon="check-circle-1-1"
    @close="openSuccessModal = false"
  >
    <span
    slot="message"
    v-html="$t('webapp.intent.delete_success_subtitle')" />
  </unnnic-modal>
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
  name: 'SentencesIntentTable',
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
    entities: {
      type: Array,
      default: /* istanbul ignore next */ () => [],
    },
    intent: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: '',
    },
    entitySelected: {
      type: String,
      default: null,
    },
    list: {
      type: Object,
      default: () => {},
    },
    showIntents: {
      type: Boolean,
      default: false,
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
            id: 'checkarea',
            text: '',
            width: '32px',
            condensed: true,
          },
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
      selectedItem: null,
      openModal: false,
      sentenceId: null,
      openSuccessModal: false,
      isSentenceActive: false,
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
        (entityValue) => entityValue.value
      );
      return allEntitiesName;
    },
    generalValue() {
      if (!this.list.items.find((item) => item.selected)) {
        return false;
      }

      if (!this.list.items.find((item) => !item.selected)) {
        return true;
      }

      return 'less';
    },
    selectedItems() {
      return this.list.items.filter((item) => item.selected === true)
    },
  },
  watch: {
    selectedItems() {
      this.$emit('dispatchEvent', { event: 'onUpdateSelected', value: this.selectedItems });
    },
    sentence(value) {
      if (value) {
        const { id } = value
        // eslint-disable-next-line no-underscore-dangle
        this.$refs[id]._data.active = this.isSentenceActive
      }
    }
  },
  methods: {
    ...mapActions(['deleteEvaluateExample', 'deleteExample']),
    getEntityClass(entity) {
      const allEntitiesName = this.repository.entities.map(
        (entityValue) => entityValue.value
      );
      const color = getEntityColor(entity, allEntitiesName);
      return `entity-${color}`;
    },
    deleteThisExample(id) {
      this.openModal = true;
      this.sentenceId = id;
    },
    async confirmDelete() {
      try {
        await this.deleteExample({ id: this.sentenceId });
        this.$emit('dispatchEvent', { event: 'itemDeleted' });
        this.openModal = false;
        setTimeout(() => { this.openSuccessModal = true }, 2000);
      } catch {
        this.$emit('dispatchEvent', { event: 'error' });
      }
    },
    cancelEditSentence() {
      this.open = !this.open;
      this.editing = false;
      this.selectedItem = null;
    },
    editSentence(id) {
      this.selectedItem = id
      this.open = true;
      this.editing = true;
    },
    updateList() {
      this.$emit('updateList');
    },
    changeGeneralCheckbox(value) {
      this.list.items = this.list.items.map((item) => ({
        ...item,
        selected: value,
      }));
    },
    activeSentence(item) {
      const { id } = item
      // eslint-disable-next-line no-underscore-dangle
      this.$refs[id]._data.active = true
    },
    inactiveSentence(item) {
      const { id } = item
      // eslint-disable-next-line no-underscore-dangle
      this.$refs[id]._data.active = false
    }
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

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
  color: #67738B;
  padding-top: 1px;
}

/deep/ .scroll {
  padding-right: 0;
}

/deep/ .header .break-text {
  overflow: initial;
}
/deep/ .unnnic-table .header {
  padding: 0.75rem 1.5rem;
}
/deep/ .unnnic-table .item {
  padding: 0.75rem 1.5rem;
  border: 1px solid white;

  &:last-child {
    margin-bottom: 0;
  }
}
/deep/ .unnnic-table .item:hover {
  border: 1px solid $unnnic-color-neutral-soft;
}

</style>
