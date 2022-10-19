<template>
  <div>
    <p
      v-if="examplesList && examplesList.empty && !isTrain"
      class="no-examples"
      v-html="$t('webapp.trainings.no_sentences_to_train')"/>

      <intent-pagination
        v-if="examplesList"
        :item-component="sentencesTable"
        :list="examplesList"
        :repository="repository"
        :per-page="perPage"
        @itemDeleted="onItemDeleted()"
        @itemSave="dispatchSave"
        :show-intents="true"
        @onUpdateSelected="updateSelected"
      />

  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import PaginatedList from '@/components/shared/PaginatedList';
import ExampleItem from '@/components/example/ExampleItem';
import IntentPagination from '../shared/IntentPagination';
import SentencesIntentTable from '@/components/repository/SentencesIntentTable';

const components = {
  PaginatedList,
  IntentPagination
};

export default {
  name: 'ExamplesPendingTraining',
  components,
  props: {
    perPage: {
      type: Number,
      default: 50,
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
      error: null,
      pageWasChanged: false,
      sentencesTable: SentencesIntentTable,
    };
  },
  computed: {
    ...mapGetters({
      repositoryVersion: 'getSelectedVersion',
      repository: 'getCurrentRepository',
    }),
  },
  watch: {
    update() {
      this.updateExamples(true);
    },
    repository() {
      this.updateExamples(true);
    },
    async examplesList() {
      await this.$nextTick();
      this.$emit('onUpdateList', this.examplesList)
    }
  },
  mounted() {
    this.updateExamples();
  },
  methods: {
    ...mapActions([
      'searchExamples',
      'setRequirements',
      'getRepositoryStatusTraining',
    ]),
    dispatchSave() {
      this.updateExamples(true);
      this.$emit('onEditSentence')
    },
    pageChanged() {
      this.pageWasChanged = !this.pageWasChanged;
    },
    async updateExamples(force = false) {
      await this.getRepositoryStatus();
      if (this.repositoryStatus.count !== 0) {
        const date = new Date();
        if (this.repositoryStatus.results[0].status !== 2
          && this.repositoryStatus.results[0].status !== 3) {
          if (this.repositoryStatus.results[1] !== undefined) {
            this.createdAtLastTrain = (this.repositoryStatus.results[1].created_at).replace(/[A-Za-z]/g, ' ');
          }
        } else if (this.repositoryStatus.results[0] !== undefined) {
          this.createdAtLastTrain = (this.repositoryStatus.results[0].created_at).replace(/[A-Za-z]/g, ' ');
        }
        this.dateNow = date.toISOString().replace(/[A-Za-z]/g, ' ');
      }

      if (!this.examplesList || force) {
        this.examplesList = await this.searchExamples({
          repositoryUuid: this.repository.uuid,
          version: this.repository.repository_version_id,
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
        repositoryVersion: this.repository.repository_version_id,
      });
      this.repositoryStatus = data;
    },
    onItemDeleted() {
      this.$emit('exampleDeleted');
    },
    updateSelected(params) {
      this.$emit('onUpdateSelected', params)
    },
  },
};
</script>

<style lang="scss" scoped>
.no-examples {
  margin: 0;
  font: 14px 'Lato';
}
</style>
