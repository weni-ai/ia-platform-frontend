<template>
  <div>
    <!-- <paginated-list
      :item-component="translationItemElem"
      :list="translationsList"
      :repository="repository"
      @itemDeleted="examplesDeleted()"/>
    <p
      v-if="translationsList.empty"
      class="no-examples">{{ $t('webapp.translate.no_translation') }},
      <a
        class="outline-text"
        @click="goToTranslate()">{{ $t('webapp.translate.click_here') }}</a>
    </p> -->
    <intent-pagination
      :item-component="sentencesTable"
      :list="translationsList"
      :repository="repository"
      @itemSave="updateTranslations()"
      @itemDeleted="examplesDeleted()"
    />
      <div v-if="translationsList.total === 0">
        <p
        class="no-examples">{{ $t('webapp.translate.no_translation', {language: toLanguage}) }}
        </p>
      </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import PaginatedList from '@/components/shared/PaginatedList';
import TranslationItem from './TranslationItem';
import IntentPagination from '@/components//shared/IntentPagination';
import TranslateExampleTable from './TranslateExampleTable';


const components = {
  PaginatedList,
  IntentPagination
};

export default {
  name: 'TranslationsList',
  components,
  props: {
    repository: {
      type: Object,
      required: true,
    },
    toLanguage: {
      type: String,
      default: undefined,
    },
    query: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      translationsList: null,
      translationItemElem: TranslationItem,
      sentencesTable: TranslateExampleTable
    };
  },
  computed: {
    ...mapGetters({
      repositoryVersion: 'getSelectedVersion',
    }),
  },
  watch: {
    toLanguage() { this.updateTranslations(); },
    query() { this.updateTranslations(); },
  },
  async mounted() {
    await this.updateTranslations();
  },
  methods: {
    ...mapActions([
      'getTranslations',
    ]),
    async updateTranslations() {
      this.translationsList = await this.getTranslations({
        ...this.query,
        repositoryUuid: this.repository.uuid,
        to_language: this.toLanguage,
        repositoryVersion: this.repositoryVersion,
      });
      this.$emit('listPhrase', this.translationsList);
    },
    goToTranslate() {
      this.$router.push({
        name: 'repository-translate',
      });
    },
    examplesDeleted() {
      this.updateTranslations();
      this.$emit('exampleUpdated');
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";
.no-examples {
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-gt;
  color: $unnnic-color-neutral-dark;
}
</style>
