<template>
  <SentenceAccordion :open.sync="open">
    <div
      slot="header"
      class="level"
    >
      <div class="example-accordion__tag level-left">
        <LanguageBadge :language="language" />
      </div>
      <div class="level-right example-accordion__text">
        <HighlightedText
          v-if="!editing || !open"
          :text="text"
          :highlighted="highlighted"
          :entities="entities"
          :colorOnly="entitySelected"
        />
      </div>
    </div>
    <div
      slot="options"
      class="level example-accordion__btns-wrapper"
    >
      <div
        v-if="
          repository.authorization && repository.authorization.can_contribute
        "
        class="level-right"
      >
        <div class="level-item">
          <a
            v-if="!editing || !open"
            :href="`#delete-example-${id}`"
            class="has-text-danger"
            @click.prevent.stop="editSentence()"
          >
            <BIcon
              icon="pencil"
              size="is-small"
              class="example-accordion__icon example__icon"
            />
          </a>
        </div>
      </div>
      <div
        v-if="
          repository.authorization && repository.authorization.can_contribute
        "
        class="level-right"
      >
        <div class="level-item">
          <a
            :href="`#delete-example-${id}`"
            class="has-text-danger"
            @click.prevent.stop="deleteThisExample()"
          >
            <BIcon
              icon="delete"
              size="is-small"
              class="example-accordion__icon example__icon"
            />
          </a>
        </div>
      </div>
    </div>
    <div slot="body">
      <ExampleInfo
        v-if="!editing"
        :entitiesList="entitiesList"
        :highlighted.sync="highlighted"
        :colorOnly="entitySelected"
        :intent="intent"
      />

      <EditExample
        v-else
        :entities="entitiesList"
        :intentToEdit="intent"
        :editExample="true"
        :textToEdit="text"
        :sentenceId="id"
        :languageEdit="language"
        :getAllEntities="getEntitiesName"
        @saveList="updateList"
        @cancel="cancelEditSentence"
      />
    </div>
  </SentenceAccordion>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { getEntityColor } from '@/utils/entitiesColors';
import ExampleInfo from '@/components/shared/accordion/ExampleInfo';
import EditExample from '@/components/shared/accordion/EditExample';
import SentenceAccordion from '@/components/shared/accordion/SentenceAccordion';
import HighlightedText from '@/components/shared/HighlightedText';
import LanguageBadge from '@/components/shared/LanguageBadge';
import BadgesCard from '@/components/repository/BadgesCard';

export default {
  name: 'SentencesEntityList',
  components: {
    SentenceAccordion,
    ExampleInfo,
    EditExample,
    HighlightedText,
    LanguageBadge,
    BadgesCard,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
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
  },
  data() {
    return {
      open: false,
      deleteDialog: null,
      remove: true,
      highlighted: null,
      editing: false,
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
  methods: {
    ...mapActions(['deleteEvaluateExample', 'deleteExample']),
    getEntityClass(entity) {
      const allEntitiesName = this.repository.entities.map(
        (entityValue) => entityValue.value,
      );
      const color = getEntityColor(entity, allEntitiesName);
      return `entity-${color}`;
    },
    deleteThisExample() {
      this.deleteDialog = this.$buefy.dialog.confirm({
        title: this.$t('webapp.trainings.delete_title'),
        message: this.$t('webapp.trainings.delete_phrase_modal'),
        confirmText: this.$t('webapp.trainings.delete_button'),
        cancelText: this.$t('webapp.trainings.cancel_button'),
        inputAttrs: {
          textAlign: 'center',
        },
        type: 'is-danger',
        onConfirm: async () => {
          await this.deleteExample({ id: this.id });
          this.$emit('dispatchEvent', { event: 'itemDeleted' });
        },
      });
    },
    cancelEditSentence() {
      this.open = !this.open;
      this.editing = false;
    },
    editSentence() {
      this.open = true;
      this.editing = true;
    },
    updateList() {
      this.$emit('updateList');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';

.example-accordion {
  &__text {
    max-width: 100%;
    font-family: $font-family;
  }

  &__tag {
    margin-right: 0.5rem;
  }

  &__icon {
    color: $color-grey-dark;
  }

  &__btns-wrapper {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
