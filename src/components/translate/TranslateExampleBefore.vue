<template>
  <SentenceAccordion
    :open.sync="isOpen"
    slim
    pendingExample
  >
    <div
      slot="check"
      class="example-accordion__check"
    >
      <BCheckbox
        v-show="selectable"
        v-model="isSelected"
      />
    </div>

    <div slot="options">
      <BIcon
        :icon="`chevron-${isOpen ? 'up' : 'down'}`"
        class="example-accordion__icon"
        @click.native="isOpen = !isOpen"
      />
    </div>

    <div
      slot="header"
      class="level"
    >
      <div class="level-right example-accordion__text">
        <HighlightedText
          :text="text"
          :entities="entities"
          :highlighted="highlighted"
        />
      </div>
    </div>

    <div slot="body">
      <ExampleInfo
        v-if="!editing"
        :entitiesList="entitiesList"
        :highlighted.sync="highlighted"
        :intent="intent"
        class="example-accordion__info"
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

export default {
  name: 'TranslateExampleBefore',
  components: {
    SentenceAccordion,
    ExampleInfo,
    EditExample,
    HighlightedText,
    LanguageBadge,
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
    allEntities: {
      type: Array,
      default: () => [],
    },
    availableToExample: {
      type: Boolean,
      default: false,
    },
    entities: {
      type: Array,
      default: /* istanbul ignore next */ () => [],
    },
    intent: {
      type: String,
      default: '',
    },
    training: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      default: '',
    },
    open: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    selectable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      isOpen: false,
      deleteDialog: null,
      editing: false,
      highlighted: null,
      isSelected: this.selected,
    };
  },
  computed: {
    ...mapState({
      repository: (state) => state.Repository.selectedRepository,
    }),
    entitiesList() {
      return this.entities.map((entity) => ({
        class: this.getEntityClass(entity.entity),
        ...entity,
      }));
    },
  },
  watch: {
    isSelected() {
      this.$emit('update:selected', this.isSelected);
    },
    selected() {
      this.isSelected = this.selected;
    },
    open() {
      this.isOpen = this.open;
    },
    isOpen() {
      this.$emit('update:open', this.isOpen);
    },
  },
  methods: {
    ...mapActions(['deleteEvaluateExample', 'deleteExample']),
    getEntityClass(entity) {
      const color = getEntityColor(entity);
      return `entity-${color}`;
    },
    updateList() {
      this.$emit('updateList');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.example-accordion {
  &__icon {
    color: $color-grey-dark;
  }

  &__text {
    max-width: 100%;
  }

  &__tag {
    margin-right: 0.5rem;
  }

  &__btns-wrapper {
    display: flex;
    justify-content: flex-end;
  }

  &__info {
    min-height: 4rem;
  }

  &__check {
    min-width: 1.8rem;
    min-height: 1.3rem;
  }
}

.pendingExample {
  background-color: $color-fake-white;
}
</style>
