<template>
  <div>
    <h3
      class="evaluate-result-example-list__title">
      {{ $t('webapp.result.sentence_details') }}
    </h3>
    <div
      v-if="busy"
      class="evaluate-result-example-list__loading">
      <loading/>
    </div>
    <p v-else-if="error">{{ $t('webapp.result.error') }}</p>
    <div v-else-if="resultExampleList && resultExampleList.length > 0">
      <p>
        {{ $t('webapp.result.sentence_details_text') }}
      </p>
      <evaluate-result-example-item
        v-for="(item, i) in resultExampleList"
        id="tour-evaluate_result-step-0"
        :key="i"
        :text="item.text"
        :intent="item.intent"
        :confidence="item.intent_prediction.confidence"
        :intent-success="(item.intent_status || item.status) === 'success'"
        :success="isSuccess(item)"
        :intent-prediction="item.intent_prediction"
        :entities="item.true_entities || []"
        :added-entities="item.false_positive_entities || []"
        :swapped-entities="item.swapped_error_entities || []"/>
      <div class="evaluate-result-example-list__pagination">
        <b-pagination
          v-if="resultExampleList.length > 0"
          :range-before="4"
          :range-after="4"
          :total="total"
          :current.sync="page"
          :per-page="limit"
          aria-next-label="Next page"
          aria-previous-label="Previous page"
          aria-page-label="Page"
          aria-current-label="Current page"/>
      </div>
    </div>
    <p v-else>{{ $t('webapp.result.do_not_log') }}</p>
    <tour
      v-if="activeTutorial === 'evaluate' && resultExampleList.length > 0"
      :step-count="1"
      name="evaluate_result"/>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import EvaluateResultExampleItem from '@/components/repository/repository-evaluate/results/EvaluateResultExampleItem';
import Loading from '@/components/shared/Loading';
import Tour from '@/components/Tour';

export default {
  name: 'EvaluateResultExampleList',
  components: {
    EvaluateResultExampleItem,
    Loading,
    Tour,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      resultExampleList: [],
      limit: 10,
      busy: false,
      error: null,
      pages: 0,
      page: 1,
    };
  },
  computed: {
    ...mapState({
      repository: state => state.Repository.selectedRepository,
    }),
    ...mapGetters([
      'activeTutorial',
    ]),
    total() {
      return this.limit * this.pages;
    },
  },
  watch: {
    page() {
      this.updateList();
    },
  },
  mounted() {
    this.updateList();
  },
  methods: {
    isSuccess(item) {
      return (item.intent_status || item.status) === 'success' && (!item.entity_status || item.entity_status === 'success');
    },
    ...mapActions([
      'getAllResultsLog',
    ]),
    async updateList() {
      this.busy = true;
      try {
        const response = await this.getAllResultsLog({
          repositoryUuid: this.repository.uuid,
          resultId: this.id,
          page: this.page,
        });
        const data = response.data.log;
        this.resultExampleList = data.results;
        this.pages = data.total_pages;
        this.error = null;
      } catch (error) {
        this.error = error;
      } finally {
        this.busy = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.evaluate-result-example-list {
  width: 100%;

  &__title {
    margin-top: 1rem;
    font-weight: 700;
  }

  &__loading {
    width: 100%;
    text-align: center;
  }

  &__pagination {
    min-width: 100%;
    display: block;
    margin: 1rem auto;
    max-width: 600px;
    display: flex;
    justify-content: flex-end;
  }
}
.no-examples {
  margin: 8px;
}
</style>
