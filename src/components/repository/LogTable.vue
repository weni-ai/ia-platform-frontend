<template>
  <div>
    <UnnnicTable
      :items="orderedList"
      class="mt-4"
    >
      <template v-slot:header>
        <UnnnicTableRow :headers="table.headers">
          <template v-slot:checkarea>
            <UnnnicCheckbox
              :value="generalValue"
              @change="changeGeneralCheckbox"
              :style="{ margin: '4px' }"
            />
          </template>
          <template v-slot:edit>
            <span>
              {{ $t('webapp.inbox.intent') }}
            </span>
            <UnnnicIconSvg
              size="xs"
              :icon="`sort-${sorts.intent}`"
              :scheme="
                sorts.intent === 'default' ? 'neutral-clean' : 'brand-weni-soft'
              "
              clickable
              @click="sort('intent')"
            />
          </template>
          <template v-slot:delete>
            <span>
              {{ $t('webapp.inbox.confidence') }}
            </span>
            <UnnnicIconSvg
              size="xs"
              :icon="`sort-${sorts.confidence}`"
              :scheme="
                sorts.confidence === 'default'
                  ? 'neutral-clean'
                  : 'brand-weni-soft'
              "
              clickable
              @click="sort('confidence')"
            />
          </template>
        </UnnnicTableRow>
      </template>

      <template v-slot:item="{ item }">
        <UnnnicTableRow :headers="table.headers">
          <template v-slot:checkarea>
            <UnnnicCheckbox
              v-model="item.selected"
              @change="dispatchSelectedItems"
              :style="{ margin: '4px' }"
            />
          </template>

          <template v-slot:sentence>
            <div
              @mouseenter="activeSentence(item)"
              @mouseleave="inactiveSentence(item)"
              @click.prevent.stop="editSentence(item.id)"
              :title="item.sentence"
              class="break-text example-accordion__sentence"
            >
              <UnnnicIconSvg
                :icon="`${
                  open && selectedItem === item.id
                    ? 'arrow-button-down-1'
                    : 'arrow-button-right-1'
                }`"
                scheme="neutral-cleanest"
                size="xs"
                clickable
                class="mr-2"
              />
              <span class="example-accordion__tag"
                >[{{ item.nlp_log.language }}]</span
              >
              <HighlightedEntity
                :ref="item.id"
                :id="item.id"
                :text="item.text"
                :highlighted="item.highlighted"
                :entities="item.nlp_log.entities.other || []"
                :colorOnly="item.entitySelected"
                :state="isSentenceActive"
              />
              <span
                v-if="showIntents"
                class="ml-4 intent-label"
              >
                {{ $t('webapp.translate.intent') + ' ' + item.intent }}
              </span>
            </div>
          </template>

          <template v-slot:edit>
            <div :style="{ textAlign: 'left' }">
              <!-- <unnnic-button
                size="small"
                type="secondary"
                iconCenter="pencil-write-1"
                @click.prevent.stop="editSentence(item.id)"
              /> -->
              <span>{{ item.nlp_log.intent.name }}</span>
            </div>
          </template>

          <template v-slot:delete>
            <div :style="{ textAlign: 'left' }">
              <!-- <unnnic-button
                size="small"
                type="secondary"
                iconCenter="delete-1-1"
                @click.prevent.stop="deleteThisExample(item.id)"
              /> -->
              <span>{{ item.confidence }}</span>
            </div>
          </template>
        </UnnnicTableRow>

        <!-- <edit-example-intent
          v-if="open && item.id === selectedItem"
          :entities="item.entities"
          :intent-to-edit="item.intent"
          :edit-example="true"
          :text-to-edit="item.text"
          :sentence-id="item.id"
          :language-edit="item.language"
          :get-all-entities="getEntitiesName"
          @saveList="updateList"
          @cancel="cancelEditSentence"
        /> -->
        <LogAccordion
          v-if="open && item.id === selectedItem"
          :nlp_log="item.nlp_log"
          :id="item.id"
          :text="item.text"
          :created_at="item.created_at"
          :version_name="item.version_name"
          @event_nlp="nlp = $event"
          @event_addLog="addLogStructure($event)"
          @event_removeLog="removeLogStructure($event)"
        />
      </template>
    </UnnnicTable>
    <!-- <unnnic-modal
    :showModal="openModal"
    :text="$t('webapp.trainings.delete_title')"
    scheme="feedback-red"
    modal-icon="alert-circle-1"
    @close="openModal = false"
  >
    <span
    slot="message"
    v-html="$t('webapp.trainings.delete_phrase_modal')" />
    <unnnic-button slot="options" type="tertiary" @click="openModal = false">
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
  </unnnic-modal> -->
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { getEntityColor } from '@/utils/entitiesColors';
import { getWordIndex } from '@/utils';
import EditExampleIntent from '@/components/shared/accordion/EditExampleIntent';
import HighlightedEntity from '@/components/shared/HighlightedEntity';
import LogAccordion from '@/components/shared/accordion/LogAccordion';

export default {
  name: 'LogTable',
  components: {
    EditExampleIntent,
    HighlightedEntity,
    LogAccordion,
  },
  props: {
    text: {
      type: String,
      default: '',
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
            flex: 8,
          },
          {
            id: 'edit',
            text: this.$t('webapp.inbox.intent'),
            flex: 3,
          },
          {
            id: 'delete',
            text: this.$t('webapp.inbox.confidence'),
            flex: 2,
          },
        ],
      },
      sorts: {
        intent: 'default',
        confidence: 'default',
      },
      ordering: '',
      selectedItem: null,
      openModal: false,
      sentenceId: null,
      openSuccessModal: false,
      isSentenceActive: false,
      orderedList: null,
    };
  },

  computed: {
    ...mapState({
      repository: (state) => state.Repository.selectedRepository,
    }),
    // entities() {
    //   return Object.keys(this.list.nlp_log.entities).map(key => this.nlp_log.entities[key].map(
    //     (entity) => {
    //       if (entity.start && entity.end) return entity;
    //       const { start, end } = getWordIndex(entity.value, this.text);
    //       return {
    //         start,
    //         end,
    //         ...entity,
    //       };
    //     },
    //   )).flat();
    // },
    // entitiesList() {
    //   return this.entities
    //     .map((entity, index) => ({
    //       value: this.entities[index],
    //       class: this.getEntityClass(this.entities[index]),
    //       ...entity,
    //     }));
    // },
    // toExample() {
    //   return {
    //     repository: this.repository.uuid,
    //     repository_version: this.nlp_log.repository_version,
    //     text: this.text,
    //     language: this.nlp_log.language,
    //     entities: this.entities.map(entity => ({
    //       entity: entity.entity,
    //       start: entity.start,
    //       end: entity.end,
    //     })),
    //     intent: this.intent,
    //     is_corrected: this.isCorrected,
    //   };
    // },
    getEntitiesName() {
      const allEntitiesName = this.repository.entities.map(
        (entityValue) => entityValue.value,
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
      return this.orderedList.filter((item) => item.selected === true);
    },
    formattedConfidence() {
      return this.list.items.map((item) => ({
        ...item,
        confidence: `${parseFloat(item.nlp_log.intent.confidence * 100).toFixed(
          0,
        )}%`,
      }));
    },
  },
  watch: {
    sentence(value) {
      if (value) {
        const { id } = value;
        this.$refs[id].active = this.isSentenceActive;
      }
    },
    sorts: {
      handler(value) {
        if (value.intent === 'desc') {
          this.orderedList = this.formattedConfidence.sort((x, y) => {
            const a = x.nlp_log.intent.name.toUpperCase();
            const b = y.nlp_log.intent.name.toUpperCase();
            // eslint-disable-next-line no-nested-ternary
            return a === b ? 0 : a > b ? 1 : -1;
          });
        }
        if (value.intent === 'asc') {
          this.orderedList = this.formattedConfidence.sort((x, y) => {
            const a = x.nlp_log.intent.name.toUpperCase();
            const b = y.nlp_log.intent.name.toUpperCase();
            // eslint-disable-next-line no-nested-ternary
            return a === b ? 0 : a > b ? -1 : 1;
          });
        }
        if (value.confidence === 'desc') {
          this.orderedList = this.formattedConfidence.sort(
            (a, b) => a.nlp_log.intent.confidence - b.nlp_log.intent.confidence,
          );
        }
        if (value.confidence === 'asc') {
          this.orderedList = this.formattedConfidence.sort(
            (a, b) => b.nlp_log.intent.confidence - a.nlp_log.intent.confidence,
          );
        }
        if (value.intent === 'default' || value.confidence === 'default') {
          this.orderedList = this.formattedConfidence;
        }
      },
      deep: true,
    },
    async formattedConfidence() {
      await this.$nextTick();
      this.orderedList = this.formattedConfidence;
    },
    orderedList() {
      this.dispatchSelectedItems();
    },
  },
  methods: {
    ...mapActions(['deleteEvaluateExample', 'deleteExample']),
    getEntityClass(entity) {
      const allEntitiesName = this.repository.entities.map(
        (entityValue) => entityValue.value,
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
        setTimeout(() => {
          this.openSuccessModal = true;
        }, 2000);
      } catch {
        this.$emit('dispatchEvent', { event: 'error' });
      }
    },
    cancelEditSentence() {
      this.open = !this.open;
      this.editing = false;
      this.$refs[this.selectedItem].active = false;
      this.selectedItem = null;
    },
    editSentence(id) {
      this.selectedItem = id;
      this.open = !this.open;
      this.editing = true;
      this.$refs[id].active = true;
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
      const { id } = item;
      if (!this.editing) {
        this.$refs[id].active = true;
      }
    },
    inactiveSentence(item) {
      const { id } = item;
      if (!this.editing) {
        this.$refs[id].active = false;
      }
    },
    sort(name) {
      ['intent', 'confidence'].forEach((key) => {
        if (key === name) {
          // eslint-disable-next-line no-nested-ternary
          this.sorts[key] =
            this.sorts[key] === 'default'
              ? 'asc'
              : this.sorts[key] === 'asc'
              ? 'desc'
              : 'default';

          this.ordering = {
            default: '',
            asc: key,
            desc: `-${key}`,
          }[this.sorts[key]];
        } else {
          this.sorts[key] = 'default';
        }
      });

      // this.reload();
    },
    dispatchSelectedItems() {
      this.$emit('dispatchEvent', {
        event: 'onUpdateSelected',
        value: this.selectedItems,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import '~@weni/unnnic-system/dist/unnnic.css';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

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
    align-items: center;
  }
}

.intent-label {
  font-family: 'Lato';
  font-size: 12px;
  color: #67738b;
  padding-top: 1px;
}

:deep(.test > .item) {
  background-color: blue;
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
:deep(.test .unnnic-table .item) {
  background: black;
}
:deep(.highlighted-text--size-normal) {
  font-size: $unnnic-font-size-body-gt;
}
</style>
