<template>
  <div class="evaluate-example-list">
    <paginated-list
      v-if="examplesList"
      :item-component="exampleItemElem"
      :list="examplesList"
      :repository="repository"
      :is-searching="searchingExample"
      @itemDeleted="onItemDeleted($event)"
      @itemSave="onItemSave()" />
    <p
      v-if="examplesList && examplesList.empty"
      class="no-examples">{{ $t('webapp.evaluate.no_sentences') }}</p>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import PaginatedList from '@/components/shared/PaginatedList';
import ExampleAccordion from '@/components/shared/accordion/ExampleAccordion';


export default {
  name: 'EvaluateExampleList',
  components: {
    PaginatedList,
  },
  props: {
    query: {
      type: Object,
      default: () => ({}),
    },
    language: {
      type: String,
      default: null,
    },
    update: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      examplesList: null,
      exampleItemElem: ExampleAccordion,
      allEntities: [],
      searchingExample: false,
    };
  },
  computed: {
    ...mapGetters({
      repositoryVersion: 'getSelectedVersion',
      repository: 'getCurrentRepository',
    }),
  },
  watch: {
    query() {
      this.updateExamples(true);
      const filterValue = Object.values(this.query);
      if (filterValue[0] !== '' || filterValue.length > 2) {
        this.searchingExample = true;
        return;
      }
      this.searchingExample = false;
    },
    repository() {
      this.updateExamples(true);
    },
    repositoryVersion() {
      this.updateExamples(true);
    },
    update() {
      this.updateExamples(true);
    },
  },
  mounted() {
    this.updateExamples();
    this.getEntitiesName();
  },
  methods: {
    ...mapActions([
      'searchEvaluateExamples',
    ]),
    async getEntitiesName() {
      const allEntitiesName = await this.repository.entities.map(
        entityValue => entityValue.value,
      );
      this.allEntities = allEntitiesName;
    },
    async updateExamples(force = false) {
      if (!this.examplesList || force) {
        this.examplesList = await this.searchEvaluateExamples({
          repositoryUUID: this.repository.uuid,
          version: this.repositoryVersion,
          query: this.query,
        });
      }
    },
    onItemDeleted() {
      this.$emit('deleted');
    },
    onItemSave() {
      this.updateExamples(true);
    },
  },
};
</script>

<style lang="scss" scoped>
.evaluate-example-list {
  width: 100%;
  margin: 0 auto;
}

.no-examples {
  margin-left: 14px;
}
</style>
