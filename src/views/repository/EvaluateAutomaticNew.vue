<template>
  <repository-view-base
    :repository="repository"
    :error-code="errorCode">
    <div v-if="repository">
      <div v-if="authenticated">
        <div
          v-if="repository.authorization.can_write"
          class="evaluate">
          <div class="evaluate__content-header">
            <unnnic-card
              :title="$t('webapp.evaluate-automatic-new.header_title')"
              icon="check-square-1"
              type="title"
              :has-information-icon="false"
              scheme="aux-orange" />
              <p
                v-html="$t('webapp.evaluate-automatic-new.header_title_p')"
                class="column is-7"></p>
          </div>

          <div class="evaluate__divider"></div>

          <div class="evaluate__quality">
            <h2>{{ $t("webapp.evaluate-automatic-new.quality_title") }}</h2>
            <p>90%</p>
          </div>

          <div class="evaluate__summary">
            <div class="evaluate__summary__infos">
              <unnnic-card-number
                :description="$t('webapp.evaluate-automatic-new.summary_title1')"
                :number="'3.125'"
              />

              <unnnic-card-number
                :description="$t('webapp.evaluate-automatic-new.summary_title2')"
                :number="'06/01/2023  17:50'"
              />
            </div>

            <div class="evaluate__summary__chart">
              <unnnic-chart-line
                :title="$t('webapp.evaluate-automatic-new.summary_chart_title')"
                condensed="true"
                :data="chart"
              />
            </div>
          </div>
          <unnnic-card
            type="account"
            :title="$t('webapp.evaluate-automatic-new.tips_title')"
            :description="$t('webapp.evaluate-automatic-new.tips_description')"
            icon="study-light-idea-1"
            scheme="brand-weni-soft"
            class="evaluate__tips"
          />
          <div class="evaluate__results">
            <div class="evaluate__results__title">
              <h2>{{ $t("webapp.evaluate-automatic-new.results_title") }}</h2>
            </div>

            <unnnic-tab class="pb-6" initialTab="first" :tabs="tabs">
              <template slot="tab-head-first">
                {{ $t("webapp.evaluate-automatic-new.results_tab_title") }}
              </template>
              <template slot="tab-panel-first">

              </template>
              <template slot="tab-head-second">
                {{ $t("webapp.evaluate-automatic-new.results_tab_title2") }}
              </template>
              <template slot="tab-panel-second">
                <h2 class="evaluate__chart__title">Relatório de Precisão das Intenções</h2>
                <p class="evaluate__chart__subtitle">
                  Uma pontuação de precisão perfeita de 1.0 significa
                  que todos os resultados dos testes foram positivos.
                </p>
                <unnnic-chart-bar
                  condensed
                  :groups="intentChart"
                  :fixedMaxValue="1"
                />
                <h2 class="evaluate__chart__title">Relatório de Precisão das Entidades</h2>
                <p class="evaluate__chart__subtitle">
                  Uma pontuação de precisão perfeita de 1.0 significa
                  que todos os resultados dos testes foram positivos.
                </p>
                <unnnic-chart-bar
                  condensed
                  :groups="entityChart"
                  :fixedMaxValue="1"
                />
              </template>
            </unnnic-tab>
          </div>
        </div>
      </div>
      <div
        v-else>
        <b-notification
          :closable="false"
          type="is-info">
          {{ $t('webapp.evaluate-automatic.login') }}
        </b-notification>
        <login-form hide-forgot-password />
      </div>
    </div>
  </repository-view-base>
</template>

<script>
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import AuthorizationRequestNotification from '@/components/repository/AuthorizationRequestNotification';
import { mapActions, mapState, mapGetters } from 'vuex';
import { LANGUAGES } from '@/utils';
import LoginForm from '@/components/auth/LoginForm';
import RepositoryBase from './Base';
import ProgressStages from '@/components/shared/ProgressStages';

export default {
  name: 'RepositoryEvaluateAutomaticNew',
  components: {
    RepositoryViewBase,
    LoginForm,
    AuthorizationRequestNotification,
    ProgressStages,
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
      chart: [
        {
          title: 'Jan',
          value: 0
        },
        {
          title: 'Fev',
          value: 1
        },
        {
          title: 'Mar',
          value: 0.5
        },
        {
          title: 'Abr',
          value: 1
        }
      ],
      intentChart: [
        { values: { Mississipi: 1 }, title: 'Mississipi' },
        { values: { digital: 0.7 }, title: 'digital' },
        { values: { Developer: 0.3 }, title: 'Developer' },
        { values: { people: 0.6 }, title: 'people' },
        { values: { fields: 0.4 }, title: 'fields' },
        { values: { Analyst: 0.5 }, title: 'Analyst' },
        { values: { Iowa: 0.6 }, title: 'Iowa' }
      ],
      entityChart: [
        { values: { Mississipi: 1 }, title: 'Mississipi' },
        { values: { digital: 0.7 }, title: 'digital' },
        { values: { Developer: 0.3 }, title: 'Developer' },
        { values: { people: 0.6 }, title: 'people' },
        { values: { fields: 0.4 }, title: 'fields' },
        { values: { Analyst: 0.5 }, title: 'Analyst' },
        { values: { Iowa: 0.8 }, title: 'Iowa' },
        { values: { symptoms: 0.6 }, title: 'symptoms' }
      ],
    };
  },
  computed: {
    ...mapState({
      selectedRepository: state => state.Repository.selectedRepository,
    }),
    ...mapGetters({
      repositoryVersion: 'getSelectedVersion',
      activeTutorial: 'activeTutorial',
    }),
    languages() {
      if (!this.selectedRepository || !this.selectedRepository.evaluate_languages_count) return [];
      return Object.keys(this.selectedRepository.evaluate_languages_count)
        .map((lang, index) => ({
          id: index + 1,
          value: lang,
          title: `${LANGUAGES[lang]}`,
        }));
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
    ...mapActions([
      'runNewEvaluate',
      'getTrainingStatus',
    ]),
    dispatchClick() {
      this.eventClick = !this.eventClick;
    },
    dispatchFinish() {
      this.eventClickFinish = !this.eventClickFinish;
    },
    dispatchReset() {
      this.eventReset = !this.eventReset;
    },
    dispatchSkip() {
      this.eventSkip = !this.eventSkip;
    },
    onAuthorizationRequested() {
      this.requestAuthorizationModalOpen = false;
      this.$buefy.toast.open({
        message: this.$t('webapp.layout.authorization_success'),
        type: 'success',
      });
      this.updateRepository(false);
    },
    async updateTrainingStatus() {
      const trainStatus = await this.getTrainingStatus({
        repositoryUUID: this.repository.uuid,
        version: this.repositoryVersion,
      });
      if (trainStatus) {
        Object.assign(this.repository, trainStatus);
      }
    },
    async newEvaluate() {
      this.evaluating = true;
      try {
        const result = await this.runNewEvaluate({
          repositoryUUID: this.repository.uuid,
          language: this.currentLanguage,
          version: this.repositoryVersion,
        });
        this.evaluating = false;
        this.$router.push({
          name: 'repository-result',
          params: {
            ownerNickname: this.repository.owner.nickname,
            slug: this.repository.slug,
            resultId: result.data.evaluate_id,
            version: result.data.evaluate_version,
          },
        });
        return true;
      } catch (error) {
        this.dispatchReset();
        this.error = error.response.data;
        this.evaluating = false;
        this.$buefy.toast.open({
          message: `${this.error.detail || this.$t('webapp.evaluate-automatic.default_error')} `,
          type: 'is-danger',
          duration: 5000,
        });
      }
      return false;
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

    h2, p {
      font-size: $unnnic-font-size-title-sm;
      font-family: $unnnic-font-family-secondary;
    }

    p {
      font-weight: 900;
      padding-left: $unnnic-spacing-stack-xs;
      color: #009E96;
    }
  }

  &__divider {
    height: 1px;
    background-color: $unnnic-color-neutral-soft;
    margin-top: 24px;
  }

  &__summary {
    display: flex;

    &__infos {
      width: 40%;
      display: flex;
      flex-direction: column;
    }
    .unnnic-card-number {
      background-color: #fff;
      max-width: 333px;
      height: 96px;
      border: 1px solid #E2E6ED;
      margin-top: $unnnic-spacing-stack-sm;

      /deep/ h4 {
        font-family: $unnnic-font-family-secondary;
        color: $unnnic-color-neutral-dark;
        font-size: $font-size;
      }

      /deep/ span {
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
  }

  .unnnic-card-account {
    background-color: white;
    border: 1px solid $unnnic-color-neutral-soft;
    border-radius: 8px;
    padding: 1rem;

    /deep/ .icon {
      background: rgba(0, 158, 150, 0.08);
      border-radius: 4px;
    }

    /deep/ .content .title {
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
      /deep/ .main .groups .group .bars .bar.color-1 {
        background-color: $unnnic-color-aux-blue;
      }
      /deep/ .main .groups .group .bars .bar.color-2 {
        background-color: $unnnic-color-aux-blue;
      }
      /deep/ .main .groups .group .bars .bar.color-3 {
        background-color: $unnnic-color-aux-blue;
      }
      /deep/ .main .groups .group .bars .bar.color-4 {
        background-color: $unnnic-color-aux-blue;
      }
      /deep/ .main .groups .group .bars .bar.color-5 {
        background-color: $unnnic-color-aux-blue;
      }
      /deep/ .main .groups .group .bars .bar.color-6 {
        background-color: $unnnic-color-aux-blue;
      }
      /deep/ .main .groups .group .bars .bar.color-7 {
        background-color: $unnnic-color-aux-blue;
      }
    }
  }

  &__navigation {
    display: flex;
    justify-content: center;
    margin-top: 2.5rem;
    overflow: hidden;
    border-bottom: 1px solid $color-grey;

    &__requestAuthorization{
       color: $color-fake-black;
      font-weight: $font-weight-medium;
      text-align: center;
      float: right
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
          content: "";
          width: $size;
          height: $size;
          left: 50%;
          bottom: -($size - .75rem);
          transform: translateX(-50%);
          background-color: $color-primary;
          border-radius: 50%;
          animation: nav-bubble-animation .25s ease;

          @keyframes nav-bubble-animation {
            from {
              bottom: -($size);
            }
            to {
              bottom: -($size - .75rem);
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
      color: #4E5666;
      margin: 2rem 0 1rem;
    }
    &__subtitle {
      font-size: 14px;
      font-family: 'Lato';
      color: #67738B;
      margin-bottom: 1rem;
    }
  }
}
</style>
