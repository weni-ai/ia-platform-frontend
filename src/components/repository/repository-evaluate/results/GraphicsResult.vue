<template>
  <div class="graphics-results">
    <div class="graphics-results__wrapper">
      <h2 class="graphics-results__title">
        {{ $t('webapp.result.evaluate_output') }}
        <span v-if="version">
          ({{ $t('webapp.result.test') }} #{{ version }})
        </span>
      </h2>
      <p>
        {{ $t('webapp.result.evaluate_output_text') }}
        <a
          :href="checkDocLanguage.results"
          target="_blank"
          >{{ $t('webapp.result.documentation') }}</a
        >.
      </p>

      <UnnnicButton
        @click="exportResults"
        class="button-export-result"
      >
        {{ $t('webapp.trainings.export_results') }}
      </UnnnicButton>

      <div class="graphics-results__info">
        <h3 class="graphics-results__title">
          {{ $t('webapp.result.recall_reports') }}
        </h3>
        <p>{{ $t('webapp.result.recall_reports_text') }}</p>
        <p>
          {{ $t('webapp.result.see_more_in') }}
          <a
            :href="checkDocLanguage.precision_recall"
            target="_blank"
            >{{ $t('webapp.result.documentation') }}</a
          >.
        </p>
      </div>

      <div>
        <h5 class="graphics-results__subtitle">
          {{ $t('webapp.result.intent_report') }}
        </h5>
        <div
          v-if="!loadingIntentsChart"
          class="graphics-results__charts__loading"
        >
          <Loading />
        </div>
        <canvas
          id="intentsChart"
          class="graphics-results__charts"
        />
      </div>
      <div>
        <h5 class="graphics-results__subtitle">
          {{ $tc('webapp.result.entity', 2) }}
        </h5>
        <div
          v-if="!loadingEntitiesChart"
          class="graphics-results__charts__loading"
        >
          <Loading />
        </div>
        <canvas
          id="entitiesChart"
          ref="entitiesChart"
          class="graphics-results__charts"
        />
      </div>
    </div>
    <div>
      <div class="graphics-results__info">
        <h3 class="graphics-results__title">
          {{ $t('webapp.result.intent_confusion_matrix') }}
        </h3>
        <p>
          {{ $t('webapp.result.intent_confusion_matrix_text') }}
          <a
            :href="checkDocLanguage.matrix"
            target="_blank"
            >{{ $t('webapp.result.documentation') }}</a
          >.
        </p>
      </div>
      <div
        class="graphics-results__charts"
        id="matrixChart"
      >
        <div
          v-if="!chartData.matrix_chart"
          class="graphics-results__charts__loading"
        >
          <Loading />
        </div>
        <img
          v-if="chartData.matrix_chart"
          :src="chartData.matrix_chart"
          alt="chart1"
        />
      </div>
    </div>
    <div>
      <div class="graphics-results__info">
        <h3 class="graphics-results__title">
          {{ $t('webapp.result.intent_confidence_distribution') }}
        </h3>
        <p>{{ $t('webapp.result.intent_confidence_distribution_text') }}</p>
        <p>
          {{ $t('webapp.result.see_more_in') }}
          <a
            :href="checkDocLanguage.confidence"
            target="_blank"
            >{{ $t('webapp.result.documentation') }}</a
          >.
        </p>
      </div>
      <div
        class="graphics-results__charts"
        id="confidenceChart"
      >
        <div
          v-if="!chartData.confidence_chart"
          class="graphics-results__charts__loading"
        >
          <Loading />
        </div>
        <img
          v-if="chartData.confidence_chart"
          :src="chartData.confidence_chart"
          alt="chart2"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { toPng } from 'dom-to-image-more';
import { saveAs } from 'file-saver';
import Chart from 'chart.js';
import Loading from '@/components/shared/Loading';
import I18n from '@/utils/plugins/i18n';
import JSZip from 'jszip';

export default {
  name: 'GraphicsResult',
  components: {
    Loading,
  },
  props: {
    chartData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      loadingEntitiesChart: false,
      loadingIntentsChart: false,
    };
  },
  computed: {
    ...mapState({
      version: (state) => state.Repository.evaluateResultVersion,
    }),
    checkDocLanguage() {
      if (I18n.locale === 'pt-BR') {
        return {
          results:
            'https://docs.weni.ai/l/pt/ia/testandosuainteligencia#resultados',
          precision_recall:
            'https://docs.weni.ai/l/pt/ia/testandosuainteligencia#relat_rios_de_precis_o_e_revoca_o',
          matrix:
            'https://docs.weni.ai/l/pt/ia/testandosuainteligencia#matriz_de_confus_o_de_inten_es',
          confidence:
            'https://docs.weni.ai/l/pt/ia/testandosuainteligencia#distribui_o_de_confian_a_de_inten_es',
        };
      }
      return {
        results:
          'https://docs.weni.ai/l/en/ai/testing-your-intelligence#results',
        precision_recall:
          'https://docs.weni.ai/l/en/ai/testing-your-intelligence#precision_and_recall_reports',
        matrix:
          'https://docs.weni.ai/l/en/ai/testing-your-intelligence#intent_confusion_matrix',
        confidence:
          'https://docs.weni.ai/l/en/ai/testing-your-intelligence#intent_confidence_distribution',
      };
    },
  },
  watch: {
    chartData() {
      this.updateCharts();
    },
  },
  methods: {
    exportResults() {
      const base64FromDataURL = (dataURL) => {
        const separator = ';base64,';

        return dataURL.slice(dataURL.search(separator) + separator.length);
      };

      const renderFileFromDomQuerySelector = async (
        filename,
        querySelector,
      ) => {
        const dataURL = await toPng(document.querySelector(querySelector));

        return {
          filename,
          base64: base64FromDataURL(dataURL),
        };
      };

      const normalizeFileName = (string, extension) => {
        return (
          string.normalize('NFD').replace(/[\u0300-\u036f]/g, '') +
          '.' +
          extension
        );
      };

      Promise.all([
        renderFileFromDomQuerySelector(
          normalizeFileName(this.$t('webapp.result.intent_report'), 'png'),
          '#intentsChart',
        ),

        renderFileFromDomQuerySelector(
          normalizeFileName(this.$tc('webapp.result.entity'), 'png'),
          '#entitiesChart',
        ),

        renderFileFromDomQuerySelector(
          normalizeFileName(
            this.$t('webapp.result.intent_confusion_matrix_text'),
            'png',
          ),
          '#matrixChart',
        ),

        renderFileFromDomQuerySelector(
          normalizeFileName(
            this.$t('webapp.result.intent_confidence_distribution'),
            'png',
          ),
          '#confidenceChart',
        ),
      ]).then(async (values) => {
        const zip = new JSZip();

        values.forEach(({ filename, base64 }) => {
          zip.file(filename, base64, { base64: true });
        });

        const content = await zip.generateAsync({ type: 'blob' });

        saveAs(content, 'result.zip');
      });
    },

    updateCharts() {
      this.loadingIntentsChart = true;
      this.loadingEntitiesChart = true;
      this.createIntentChart();
      this.createEntitiesChart();
    },
    createIntentChart() {
      const ctx = document.getElementById('intentsChart');

      if (!ctx) return;

      const intentsName = [];
      const intentsPrecision = [];
      const intentsRecall = [];
      if (this.chartData) {
        this.chartData.intents_list.forEach((element) => {
          intentsName.push(element.intent);
          intentsPrecision.push(element.score.precision * 100);
          intentsRecall.push(element.score.recall * 100);
        });
      }
      new Promise(() => {
        // eslint-disable-next-line
        const intentChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: intentsName,
            datasets: [
              {
                label: 'Precision',
                data: intentsPrecision,
                backgroundColor: '#009E96',
              },
              {
                label: 'Recal',
                data: intentsRecall,
                backgroundColor: '#4E4871',
              },
            ],
          },
          options: {
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                    callback(value) {
                      return `${value}%`;
                    },
                  },
                },
              ],
              xAxes: [
                {
                  barPercentage: 0.6,
                },
              ],
            },
          },
        });
      }).then((resolve) => {
        this.loadingIntentsChart = false;
        resolve();
      });
    },
    createEntitiesChart() {
      const ctx = document.getElementById('entitiesChart');

      if (!ctx) return;

      const entitiesName = [];
      const entitiesPrecision = [];
      const entitiesRecall = [];
      if (this.chartData) {
        this.chartData.entities_list.forEach((entity) => {
          entitiesName.push(entity.entity);
          entitiesPrecision.push(entity.score.precision * 100);
          entitiesRecall.push(entity.score.recall * 100);
        });
      }
      new Promise(() => {
        // eslint-disable-next-line
        const entitieChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: entitiesName,
            datasets: [
              {
                label: 'Precision',
                data: entitiesPrecision,
                backgroundColor: '#009E96',
              },
              {
                label: 'Recall',
                data: entitiesRecall,
                backgroundColor: '#4E4871',
              },
            ],
          },
          options: {
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                    callback(value) {
                      return `${value}%`;
                    },
                  },
                },
              ],
              xAxes: [
                {
                  barPercentage: 0.6,
                },
              ],
            },
          },
        });
      }).then((resolve) => {
        this.loadingEntitiesChart = false;
        resolve();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.button-export-result {
  margin-top: $unnnic-spacing-sm;
}

.graphics-results {
  margin: 0 auto;
  font-family: $font-family;

  &__title {
    margin: 2rem 0 0.5rem;
    font-size: 1.75rem;
    font-weight: $font-weight-medium;
    color: $color-fake-black;
    margin-bottom: $between-title-subtitle;
  }

  &__subtitle {
    margin: 2rem 0 0.5rem;
    font-family: $font-family;
    font-weight: $font-weight-bolder;
  }

  &__info {
    margin-bottom: 1rem;
  }

  &__charts {
    text-align: center;

    &__loading {
      width: 100%;
      text-align: center;
    }
  }
}
</style>
