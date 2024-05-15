<template>
  <RepositoryViewBase
    :repository="repository"
    :errorCode="errorCode"
  >
    <div v-if="repository">
      <div v-if="authenticated">
        <div
          v-if="repository.authorization.can_write"
          class="evaluate"
        >
          <div class="evaluate__content-header">
            <UnnnicCard
              :title="$t('webapp.evaluate-automatic-new.header_title')"
              icon="check-square-1"
              type="title"
              :hasInformationIcon="false"
              scheme="aux-orange"
            />
            <p
              v-html="$t('webapp.evaluate-automatic-new.header_title_p')"
              class="column is-7"
            ></p>
          </div>

          <div class="evaluate__divider"></div>

          <div class="evaluate__quality">
            <h2>{{ $t('webapp.evaluate-automatic-new.quality_title') }}</h2>
            <p>{{ result.quality }}%</p>
          </div>

          <div class="evaluate__summary">
            <div class="evaluate__summary__infos column is-4 p-0">
              <UnnnicCardNumber
                :description="
                  $t('webapp.evaluate-automatic-new.summary_title1')
                "
                :number="result.count_logs"
              />

              <UnnnicCardNumber
                :description="
                  $t('webapp.evaluate-automatic-new.summary_title2')
                "
                :number="result.created"
              />
            </div>

            <!-- <div class="evaluate__summary__chart">
              <unnnic-chart-line
                :title="$t('webapp.evaluate-automatic-new.summary_chart_title')"
                condensed="true"
                :data="chart"
              />
            </div> -->

            <div
              class="unnnic-card-account evaluate__tips unnnic-card-component"
            >
              <div class="icon">
                <UnnnicAvatarIcon
                  size="xs"
                  scheme="brand-weni-soft"
                  icon="study-light-idea-1"
                />
              </div>

              <div class="content">
                <div class="title">
                  {{ $t('webapp.evaluate-automatic-new.tips_title') }}
                </div>

                <div
                  v-for="recommendation in recommendations"
                  :key="recommendation"
                  class="description"
                >
                  Adicione mais frases para a intenção
                  <span class="intent">{{ recommendation }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="evaluate__results">
            <div class="evaluate__results__title">
              <h2>{{ $t('webapp.evaluate-automatic-new.results_title') }}</h2>
            </div>

            <UnnnicTab
              class="pb-6"
              initialTab="first"
              :tabs="tabs"
            >
              <template slot="tab-head-first">
                {{ $t('webapp.evaluate-automatic-new.results_tab_title') }}
              </template>
              <template slot="tab-panel-first">
                <EvaluateResultExampleList
                  :id="evaluateResult ? evaluateResult.id : ''"
                  :query="query"
                />
              </template>
              <template slot="tab-head-second">
                {{ $t('webapp.evaluate-automatic-new.results_tab_title2') }}
              </template>
              <template slot="tab-panel-second">
                <h2 class="evaluate__chart__title">
                  Relatório de Precisão das Intenções
                </h2>
                <p class="evaluate__chart__subtitle">
                  Uma pontuação de precisão perfeita de 1.0 significa que todos
                  os resultados dos testes foram positivos.
                </p>
                <UnnnicChartBar
                  condensed
                  :groups="intentChart"
                  :fixedMaxValue="1"
                />
                <h2 class="evaluate__chart__title">
                  Relatório de Precisão das Entidades
                </h2>
                <p class="evaluate__chart__subtitle">
                  Uma pontuação de precisão perfeita de 1.0 significa que todos
                  os resultados dos testes foram positivos.
                </p>
                <UnnnicChartBar
                  condensed
                  :groups="entityChart"
                  :fixedMaxValue="1"
                />
              </template>
            </UnnnicTab>
          </div>
        </div>
      </div>
      <div v-else>
        <BNotification
          :closable="false"
          type="is-info"
        >
          {{ $t('webapp.evaluate-automatic.login') }}
        </BNotification>
        <LoginForm hideForgotPassword />
      </div>
    </div>
  </RepositoryViewBase>
</template>

<script>
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import AuthorizationRequestNotification from '@/components/repository/AuthorizationRequestNotification';
import { mapActions, mapState, mapGetters } from 'vuex';
import { LANGUAGES } from '@/utils';
import LoginForm from '@/components/auth/LoginForm';
import RepositoryBase from './Base';
import ProgressStages from '@/components/shared/ProgressStages';
import EvaluateResultExampleList from '@/components/repository/repository-evaluate/results/EvaluateResultExampleList';

export default {
  name: 'RepositoryEvaluateAutomaticNew',
  components: {
    RepositoryViewBase,
    LoginForm,
    AuthorizationRequestNotification,
    ProgressStages,
    EvaluateResultExampleList,
  },
  extends: RepositoryBase,
  data() {
    return {
      currentLanguage: '',
      evaluating: false,
      error: {},
      eventClick: false,
      eventClickFinish: false,
      eventReset: false,
      eventSkip: false,
      tabs: ['first', 'second'],
      evaluateResult: {},
    };
  },
  mounted() {
    this.getResult();
  },
  computed: {
    ...mapState({
      selectedRepository: (state) => state.Repository.selectedRepository,
    }),
    ...mapGetters({
      repositoryVersion: 'getSelectedVersion',
      activeTutorial: 'activeTutorial',
    }),
    languages() {
      if (
        !this.selectedRepository ||
        !this.selectedRepository.evaluate_languages_count
      )
        return [];
      return Object.keys(this.selectedRepository.evaluate_languages_count).map(
        (lang, index) => ({
          id: index + 1,
          value: lang,
          title: `${LANGUAGES[lang]}`,
        }),
      );
    },
    result() {
      const {
        accuracy,
        quality = this.evaluateResult?.qualitity.toFixed(0) || 0,
        log,
        results,
        version,
        intents_list,
        entities_list,
        recommendations,
        created = new Date(this.evaluateResult?.created_at).toLocaleString() ||
          '',
        count_logs,
      } = this.evaluateResult;
      return {
        accuracy,
        quality,
        log,
        results,
        version,
        intents_list,
        entities_list,
        recommendations,
        created,
        count_logs,
      };
    },
    intentChart() {
      if (this.result.intents_list) {
        return this.result.intents_list.map((intent) => ({
          values: { intent: intent.score.precision },
          title: intent.intent,
        }));
      }
      return [];
    },
    entityChart() {
      if (this.result.entities_list) {
        return this.result.entities_list.map((entity) => ({
          values: { entity: entity.score.precision },
          title: entity.entity,
        }));
      }
      return [];
    },
    recommendations() {
      if (this.result.recommendations) {
        return this.result.recommendations.add_phares_to;
      }
      return [];
    },
  },
  watch: {
    selectedRepository() {
      if (this.currentLanguage === '') {
        this.currentLanguage = this.selectedRepository.language;
      }
    },
  },
  methods: {
    ...mapActions(['getResultsByType', 'getAllResultsLog']),
    async getResult() {
      const resultList = await this.getResultsByType({
        repositoryUuid: this.repository.uuid,
        query: {
          repository_version: this.repositoryVersion,
          limit: 20,
          offset: 0,
          type: 1,
        },
      });
      const { data } = await this.getAllResultsLog({
        repositoryUuid: this.repository.uuid,
        resultId: resultList.data.results[0].id,
        page: 1,
      });
      this.evaluateResult = data;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import '~@weni/unnnic-system/dist/unnnic.css';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.evaluate {
  h1,
  h2,
  h3,
  h4,
  p {
    font-family: $unnnic-font-family-secondary;
  }

  &__content-header {
    p {
      font-family: $unnnic-font-family-secondary;
      color: $unnnic-color-neutral-dark;
      font-size: $unnnic-font-size-body-gt;
    }
  }

  &__quality {
    background-color: rgba(0, 158, 150, 0.08);
    border-radius: 8px;
    height: 60px;
    display: flex;
    align-items: center;
    margin-top: 32px;
    padding-left: $unnnic-spacing-stack-sm;
    h2 {
      color: $unnnic-color-neutral-dark;
    }

    h2,
    p {
      font-size: $unnnic-font-size-title-sm;
      font-family: $unnnic-font-family-secondary;
    }

    p {
      font-weight: 900;
      padding-left: $unnnic-spacing-stack-xs;
      color: #009e96;
    }
  }

  &__divider {
    height: 1px;
    background-color: $unnnic-color-neutral-soft;
    margin-top: 24px;
  }

  &__summary {
    display: flex;
    gap: 1rem;

    &__infos {
      // width: 40%;
      display: flex;
      flex-direction: column;
    }
    .unnnic-card-number {
      background-color: #fff;
      max-width: 100%;
      height: 96px;
      border: 1px solid #e2e6ed;
      margin-top: $unnnic-spacing-stack-sm;

      :deep(h4) {
        font-family: $unnnic-font-family-secondary;
        color: $unnnic-color-neutral-dark;
        font-size: $font-size;
      }

      :deep(span) {
        font-family: $unnnic-font-family-secondary;
        color: $unnnic-color-neutral-dark;
        font-size: $unnnic-font-size-title-sm;
        /*         line-height: 0px; */
      }
    }

    &__chart {
      margin-left: $unnnic-spacing-stack-sm;
      margin-top: $unnnic-spacing-stack-sm;
      width: 80%;

      .unnnic-chart-line {
        height: 100%;
      }
    }
  }

  &__tips {
    margin-top: $unnnic-spacing-stack-sm;

    .title {
      font-family: Aleo, serif;
      font-size: 1rem;
      font-weight: 400;
      color: #3b414d;
      line-height: 1.5rem;
    }

    .description {
      font-family: Lato;
      font-size: 0.875rem;
      font-weight: 400;
      color: #67738b;
      line-height: 1.375rem;
      margin-top: 0.25rem;
    }
  }

  .unnnic-card-account {
    background-color: white;
    border: 1px solid $unnnic-color-neutral-soft;
    border-radius: 8px;
    display: flex;
    padding: 0.75rem 1rem;
    width: 100%;

    :deep(.icon) {
      background: rgba(0, 158, 150, 0.08);
      border-radius: 4px;
      margin-right: 0.5rem;
    }

    :deep(.content .title) {
      font-family: $unnnic-font-family-secondary;
      color: $unnnic-color-neutral-dark;
      font-size: $unnnic-font-size-body-lg;
      margin-bottom: 16px;
    }
  }

  &__results {
    margin-top: $unnnic-spacing-stack-lg;
    &__title {
      h2 {
        font-family: $unnnic-font-family-secondary;
        color: $unnnic-color-neutral-dark;
      }
    }

    .tab {
      margin-top: $unnnic-spacing-stack-md;
    }

    .unnnic-chart-bar {
      :deep(.main .groups .group .bars .bar) {
        background-color: $unnnic-color-aux-blue;
      }
      :deep(.main .groups .group .bars .bar:hover) {
        outline-color: rgba(0, 222, 211, 0.32);
      }
    }
  }

  &__navigation {
    display: flex;
    justify-content: center;
    margin-top: 2.5rem;
    overflow: hidden;
    border-bottom: 1px solid $color-grey;

    &__requestAuthorization {
      color: $color-fake-black;
      font-weight: $font-weight-medium;
      text-align: center;
      float: right;
    }
    a {
      position: relative;
      display: inline-flex;
      padding: 0 1.5rem 1rem;
      color: $color-grey-dark;
      font-weight: $font-weight-medium;
      text-align: center;

      &:hover,
      &.active {
        color: $color-fake-black;

        &::before {
          $size: 10rem;

          position: absolute;
          content: '';
          width: $size;
          height: $size;
          left: 50%;
          bottom: -($size - 0.75rem);
          transform: translateX(-50%);
          background-color: $color-primary;
          border-radius: 50%;
          animation: nav-bubble-animation 0.25s ease;

          @keyframes nav-bubble-animation {
            from {
              bottom: -($size);
            }
            to {
              bottom: -($size - 0.75rem);
            }
          }
        }
      }
    }
  }
  &__chart {
    &__title {
      font-size: 20px;
      font-family: 'Lato';
      color: #4e5666;
      margin: 2rem 0 1rem;
    }
    &__subtitle {
      font-size: 14px;
      font-family: 'Lato';
      color: #67738b;
      margin-bottom: 1rem;
    }
  }
  .intent {
    color: $unnnic-color-neutral-cloudy;
    font-weight: 600;
  }
}
</style>
