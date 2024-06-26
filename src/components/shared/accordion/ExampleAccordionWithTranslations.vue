<template>
  <Component
    ref="accordion"
    :is="editing ? 'edit-example-accordion' : 'sentence-accordion'"
    :open.sync="open"
    :entities="entities"
    :intentToEdit="intent"
    :textToEdit="text"
    :sentenceId="id"
    :languageEdit="language"
    :getAllEntities="allEntities"
    align="top"
    editExample
    @cancel="onCancelEdit"
    @saveList="onSaveList"
  >
    <div slot="check">
      <LanguageBadge
        :language="language"
        :main="language === repository.language"
      />
    </div>
    <div
      v-if="!editing"
      slot="header"
      class="example-item__header"
    >
      <HighlightedText
        :text="text"
        :entities="entities"
        :highlighted="highlighted"
      />
      <div class="example-item__entities">
        <EntityTag
          v-for="entity in entities"
          :entityName="entity.entity"
          :key="entity.entity"
          :highlighted="highlighted === entity.entity"
          :group="entity.group"
          @mouseenter.native.stop="highlighted = entity.entity"
          @mouseleave.native.stop="highlighted = null"
        />
      </div>
    </div>
    <div
      v-show="!editing"
      slot="options"
      class="example-item__intent example-item__faded"
    >
      <strong class="example-item__faded">
        {{ $t('webapp.evaluate.intent') }}:
      </strong>
      &nbsp; {{ intent }}
    </div>
    <div
      slot="options"
      class="example-item__faded example-item__options"
    >
      <WordSuggestionButton
        v-show="!editing && isSuggestion"
        :getSentence="sentenceDetail"
      />
      <BIcon
        v-show="!editing"
        :icon="editing ? 'check' : 'pencil'"
        :class="{
          clickable: true,
          'icon-disabled': editingTranslation,
          'example-item__options__icon': !editing,
        }"
        size="is-small"
        @click.native.stop="handleEdit"
      />
      <BIcon
        class="clickable example-item__options__icon"
        size="is-small"
        icon="delete"
        @click.native.stop="deleteThisExample"
      />
    </div>

    <div slot="body">
      <Loading v-show="loadingTranslations" />
      <p
        v-if="translationLoadError"
        class="has-text-centered"
      >
        {{ $t('webapp.translate.error_load_translation') }}
        <a @click="loadTranslations"> {{ $t('webapp.translate.retry') }} </a>
      </p>
      <p
        v-else-if="translations && translations.length === 0"
        class="has-text-centered"
      >
        {{ $t('webapp.translate.no_translation') }}
      </p>
      <div
        v-for="(translation, index) in translations || []"
        :key="translation.id"
      >
        <ExampleTranslation
          :allEntities="availableEntities"
          :disableEdit="
            editing ||
            (editingTranslation && translation.id !== editingTranslation)
          "
          v-bind="translation"
          @edit="onEditTranslationChange"
          @edited="onEdited"
          @deleted="translationDeleted(translation.id)"
        />
        <div
          v-if="index < (translations || []).length - 1"
          class="example-item__separator"
        />
      </div>
    </div>
  </Component>
</template>

<script>
import Vue from 'vue';
import SentenceAccordion from '@/components/shared/accordion/SentenceAccordion';
import ExampleTranslation from '@/components/shared/accordion/ExampleTranslation';
import HighlightedText from '@/components/shared/HighlightedText';
import LanguageBadge from '@/components/shared/LanguageBadge';
import EntityTag from '@/components/repository/repository-evaluate/example/EntityTag';
import EditExample from '@/components/shared/accordion/EditExample';
import Loading from '@/components/shared/Loading';
import EditExampleAccordion from '@/components/shared/accordion/EditExampleAccordion';
import { mapActions, mapGetters } from 'vuex';
import WordSuggestionButton from '@/components/shared/WordSuggestionButton';

export default {
  name: 'ExampleAccordionWithTranslations',
  components: {
    SentenceAccordion,
    HighlightedText,
    LanguageBadge,
    EntityTag,
    EditExample,
    ExampleTranslation,
    EditExampleAccordion,
    Loading,
    WordSuggestionButton,
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
      default: () => [],
    },
    intent: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: '',
    },
    repository: {
      type: Object,
      default: null,
    },
    isSuggestion: {
      type: Boolean,
      default: false,
    },
    isAccordionOpen: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      open: false,
      editing: false,
      highlighted: null,
      translations: null,
      loadingTranslations: false,
      editingTranslation: null,
      translationLoadError: false,
    };
  },
  computed: {
    ...mapGetters({
      repositoryVersion: 'getSelectedVersion',
    }),
    allEntities() {
      if (!this.repository || !this.repository.entities) return [];
      return this.repository.entities.map((entity) => entity.value);
    },
    availableEntities() {
      return this.entities.map((entity) => entity.entity);
    },
    sentenceDetail() {
      const detail = {
        id: this.id,
        text: this.text,
        intent: this.intent,
        language: this.language,
      };
      return detail;
    },
  },
  watch: {
    open() {
      if (this.open && !this.translations) {
        this.loadTranslations();
      }
    },
    isAccordionOpen() {
      this.open = false;
    },
  },
  methods: {
    ...mapActions(['deleteExample', 'getTranslations']),
    async onEdited(edited) {
      const index = this.translations.findIndex(
        (translation) => translation.id === edited.id,
      );
      if (index < 0) return;
      Vue.set(this.translations, index, edited);
    },
    onEditTranslationChange({ id, editing }) {
      this.editingTranslation = editing ? id : null;
    },
    onSaveList() {
      this.$emit('updateList');
    },
    translationDeleted(id) {
      this.translations = this.translations.filter(
        (translation) => translation.id !== id,
      );
    },
    handleEdit() {
      this.editing = !this.editing;
    },
    async loadTranslations() {
      this.$emit('loadedTranslations');
      this.loadingTranslations = true;
      this.translationLoadError = false;
      const translationsList = await this.getTranslations({
        repositoryUuid: this.repository.uuid,
        repositoryVersion: this.repositoryVersion,
        original_example_id: this.id,
      });
      try {
        this.translations = await translationsList.getAllItems();
      } catch (e) {
        this.translationLoadError = true;
      } finally {
        this.loadingTranslations = false;
      }
    },
    deleteThisExample() {
      return new Promise((resolve, reject) => {
        this.deleteDialog = this.$buefy.dialog.confirm({
          message: this.$t('webapp.trainings.delete_phrase_modal'),
          confirmText: this.$t('webapp.trainings.delete_button'),
          cancelText: this.$t('webapp.trainings.cancel_button'),
          type: 'is-danger',
          onConfirm: async () => {
            try {
              await this.deleteExample({ id: this.id });
              this.$emit('deleted');
            } catch (e) {
              reject();
            }
          },
          onCancel: () => {
            reject();
          },
        });
      });
    },
    onCancelEdit() {
      this.editing = false;
      this.$emit('updateList');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';

.example-item {
  &__header {
    > * :not(:last-child) {
      margin-bottom: 0.5rem;
    }
  }

  &__separator {
    background-color: $color-grey;
    width: 100%;
    height: 2px;
  }

  &__entities {
    > * {
      margin-right: 0.3rem;
    }
  }

  &__faded {
    color: $color-grey-dark;
    font-family: $font-family;

    strong {
      margin-right: 0.5rem;
    }
  }

  &__intent {
    display: flex;
    margin-right: 1rem;
    text-align: right;
    white-space: nowrap;
  }

  &__options {
    display: flex;
    align-items: center;
    > * {
      margin-left: 0.4rem;
    }
    &__icon:hover {
      color: $color-fake-grey;
      transition: 1s;
    }
  }
}
:deep(.unnnic-tag) {
  strong {
    margin: 0 0.4rem !important;
  }
}
</style>
