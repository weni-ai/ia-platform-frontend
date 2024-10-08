<template>
  <div class="example">
    <div class="example-text">
      <HighlightedText
        :text="text"
        :entities="entities"
        :highlighted="highlighted"
        size="large"
      />
    </div>
    <div
      v-if="entitiesList.length > 0"
      class="example-entities"
    >
      <EntityTag
        v-for="(entity, i) in entitiesList"
        :key="i"
        :entityName="entity"
        :highlighted="highlighted === entity"
        @mouseenter.native.stop="highlighted = entity"
        @mouseleave.native.stop="highlighted = null"
      />
    </div>
    <div class="example-infos level is-mobile">
      <div class="level-left">
        <div
          v-if="intent"
          class="level-item has-text-grey"
        >
          <strong>{{ $t('webapp.translate.intent') }}&nbsp;</strong>
          <span>{{ intent }}</span>
        </div>
        <div class="level-item has-text-grey-light">
          {{ created_at | moment('from') }}
        </div>
      </div>
      <div
        v-if="
          repository.authorization &&
          (repository.authorization.can_contribute ||
            repository.authorization.can_translate)
        "
        class="level-right"
      >
        <div class="level-item">
          <button
            id="tour-translate-step-3"
            :is-next-disabled="true"
            :is-previous-disabled="true"
            :is-step-blocked="blockedNextStepTutorial"
            class="button is-primary"
            @click="toggleFormOpen()"
          >
            <span>{{ $t('webapp.translate.translate_sentence') }}</span>
            <BIcon icon="chevron-down" />
          </button>
        </div>
      </div>
    </div>
    <BCollapse :open="formOpen">
      <div class="translate-form">
        <NewTranslateForm
          :exampleId="id"
          :translateTo="translateTo"
          :extraEntitiesList="entitiesList"
          :repository="repository"
          @translated="onTranslated()"
          @eventStep="dispatchStep()"
        />
      </div>
    </BCollapse>
  </div>
</template>

<script>
import { getEntitiesList } from '@/utils';
import { getEntityColor } from '@/utils/entitiesColors';
import { mapActions, mapGetters } from 'vuex';
import HighlightedText from '@/components/shared/HighlightedText';
import EntityTag from '@/components/repository/repository-evaluate/example/EntityTag';
import NewTranslateForm from './NewTranslateForm';

export default {
  name: 'TranslateExample',
  components: {
    HighlightedText,
    NewTranslateForm,
    EntityTag,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      default: '...',
    },
    intent: {
      type: String,
      default: '',
    },
    entities: {
      type: Array,
      default: /* istanbul ignore next */ () => [],
    },
    created_at: {
      type: String,
      default: '',
    },
    repository: {
      type: Object,
      default: /* istanbul ignore next */ () => ({}),
    },
    language: {
      type: String,
      required: true,
    },
    translateTo: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      deleteDialog: null,
      formOpen: false,
      highlighted: null,
      eventClick: false,
      blockedNextStepTutorial: true,
    };
  },
  computed: {
    ...mapGetters(['activeTutorial']),
    entitiesList() {
      return getEntitiesList(this.entities);
    },
  },
  watch: {
    formOpen() {
      if (this.formOpen === true && this.activeTutorial === 'translate') {
        this.$nextTick(() => {
          this.dispatchStep();
        });
      }
    },
  },
  methods: {
    ...mapActions(['deleteExample']),
    getEntityClass(entity) {
      const color = getEntityColor(
        entity,
        this.repository.entities || this.repository.entities_list,
        this.entities,
      );
      return `entity-${color}`;
    },
    dispatchClick() {
      this.eventClick = !this.eventClick;
    },
    toggleFormOpen() {
      /* istanbul ignore next */
      this.formOpen = !this.formOpen;
      this.blockedNextStepTutorial = false;
    },
    dispatchStep() {
      this.$emit('dispatchEvent', { event: 'dispatchStep' });
    },
    onTranslated() {
      /* istanbul ignore next */
      this.$buefy.toast.open({
        message: this.$t('webapp.translate.example_translated'),
        type: 'is-success',
      });
      /* istanbul ignore next */
      this.$emit('dispatchEvent', 'translated');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/utilities.scss';

.example {
  $radius: 8px;

  margin: 16px 8px;
  background-color: $white-bis;
  border-radius: $radius;
  overflow: visible;

  &:hover {
    .example-text {
      background-color: $white;
      box-shadow: 0 2px 8px rgba(100, 100, 100, 0.5);
    }
  }

  &-text {
    background-color: $white-ter;
    border-radius: $radius;
    transition: box-shadow 0.2s ease;
    font-size: 1.25rem;
    padding: 8px 16px;
    margin-bottom: 4px;
  }

  &-entities,
  &-infos {
    padding: 4px 8px 4px 16px;
  }

  &-entities {
    > * {
      margin: 0 8px 0 0;

      &:last-child {
        margin: 0;
      }
    }
  }
}

.translate-form {
  padding: 8px 16px 16px;
}
</style>
