<template>
  <div>
    <paginated-list
      v-if="examplesList"
      :item-component="exampleItemElem"
      :list="examplesList"
      :repository="repository"
      :per-page="perPage"
      :pending-example="pendingExample"
      @itemSave="dispatchSave"
      @itemDeleted="onItemDeleted($event)" />

    <br>
    <p
      v-if="examplesList && examplesList.empty && !isTrain"
      class="no-examples"
      v-html="$t('webapp.trainings.no_sentences_to_train')"/>

  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import PaginatedList from '@/components/shared/PaginatedList';
import ExampleItem from '@/components/example/ExampleItem';

const components = {
  PaginatedList,
};

export default {
  name: 'ExamplesPendingTraining',
  components,
  props: {
    query: {
      type: Object,
      default: () => ({}),
    },
    perPage: {
      type: Number,
      default: 12,
    },
    update: {
      type: Boolean,
      default: false,
    },
    pendingExample: {
      type: Boolean,
      default: true,
    },
    isTrain: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      examplesList: null,
      exampleItemElem: ExampleItem,
      repositoryStatus: null,
      createdAtLastTrain: '',
      dateNow: '',
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
    },
    update() {
      this.updateExamples(true);
    },
    repository() {
      this.updateExamples(true);
    },
  },
  mounted() {
    this.updateExamples();
  },
  methods: {
    ...mapActions([
      'searchExamples',
      'getRepositoryStatusTraining',
    ]),
    dispatchSave() {
      this.updateExamples(true);
    },
    async updateExamples(force = false) {
      await this.getRepositoryStatus();
      if (this.repositoryStatus.count !== 0) {
        const date = new Date();
        this.createdAtLastTrain = (this.repositoryStatus.results[0].created_at).replace(/[A-Za-z]/g, ' ');
        this.dateNow = date.toISOString().replace(/[A-Za-z]/g, ' ');
      }

      if (!this.examplesList || force) {
        this.examplesList = await this.searchExamples({
          repositoryUuid: this.repository.uuid,
          version: this.repositoryVersion,
          query: this.query,
          limit: this.perPage,
          startCreatedAt: this.createdAtLastTrain,
          endCreatedAt: this.dateNow,
        });
        const hasPhrases = await this.examplesList.updateItems();
        if (hasPhrases.length !== 0) {
          this.$emit('noPhrases');
        }
      }
    },
    async getRepositoryStatus() {
      const { data } = await this.getRepositoryStatusTraining({
        repositoryUUID: this.repository.uuid,
        repositoryVersion: this.repositoryVersion,
      });
      this.repositoryStatus = data;
    },
    onItemDeleted() {
      this.$emit('exampleDeleted');
    },
  },
};
</script>

<style lang="scss" scoped>
.no-examples {
  margin: 0;
}
</style>