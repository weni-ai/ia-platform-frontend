<template>
  <div>
      <intent-pagination
        v-if="examplesList"
        :item-component="sentencesTable"
        :list="examplesList"
        :repository="repository"
        :per-page="perPage"
        @itemDeleted="onItemDeleted()"
        @itemSave="dispatchSave"
        :show-intents="true"
        :load-all="true"
        @onUpdateSelected="updateSelected"
      />
      <div v-else>
        <p class="untrained">
          {{ $t('webapp.trainings.database_untrained') }}
        </p>
      </div>
    <br>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import IntentPagination from '../shared/IntentPagination';
import SentencesIntentTable from '@/components/repository/SentencesIntentTable';

const components = {
  IntentPagination
};

export default {
  name: 'ExamplesList',
  components,
  props: {
    query: {
      type: Object,
      default: () => ({}),
    },
    perPage: {
      type: Number,
      default: 10,
    },
    update: {
      type: Boolean,
      default: false,
    },
    textData: {
      type: String,
      default: '',
    },
    translationData: {
      type: Boolean,
      default: null,
    },
  },
  data() {
    return {
      examplesList: null,
      dateLastTrain: '',
      pageWasChanged: false,
      searchingExample: false,
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
    query() {
      this.updateExamples(true);
      const filterValue = Object.values(this.query);
      if (filterValue[0] !== '' || filterValue.length > 1) {
        this.searchingExample = true;
        return;
      }
      this.searchingExample = false;
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
    pageChanged() {
      this.pageWasChanged = !this.pageWasChanged;
    },
    dispatchSave() {
      this.updateExamples(true);
    },
    async updateExamples(force = false) {
      await this.getRepositoryStatus();
      if (this.repositoryStatus.count !== 0) {
        if (this.repositoryStatus.results[0].status !== 2
                    && this.repositoryStatus.results[0].status !== 3) {
          if (this.repositoryStatus.results[1] !== undefined) {
            this.dateLastTrain = (this.repositoryStatus.results[1].created_at).replace(/[A-Za-z]/g, ' ');
          }
        } else if (this.repositoryStatus.results[0] !== undefined) {
          this.dateLastTrain = (this.repositoryStatus.results[0].created_at).replace(/[A-Za-z]/g, ' ');
        }
      }
      if (this.repositoryStatus.count === 0) {
        return;
      }
      if (this.repositoryStatus.count === 1
                && (this.repositoryStatus.results[0].status !== 2
                    && this.repositoryStatus.results[0].status !== 3)) {
        return;
      }
      if (!this.examplesList || force) {
        this.examplesList = await this.searchExamples({
          repositoryUuid: this.repository.uuid,
          version: this.repository.repository_version_id,
          query: this.query,
          limit: this.perPage,
          endCreatedAt: this.dateLastTrain,
        });
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
      this.updateExamples(true);
    },
    updateSelected(params) {
      this.$emit('onUpdateSelected', params)
    },
  },
};
</script>

<style lang="scss" scoped>
.no-examples {
  margin: 8px;
}
.untrained {
      font-family: 'Lato';
      font-size: 14px;
      color: #3B414D;
      margin-top: 2rem;
    }
.divider {
      background: #E2E6ED;
      height: 1px;
      margin: 2rem 0;
    }
</style>
