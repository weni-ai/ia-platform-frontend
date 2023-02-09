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
            <h2 class="evaluate__content-header__title">
              <span @click="goToHome" class="evaluate__content-header__back-button">
                <unnnic-icon icon="keyboard-arrow-left-1" size="sm" />
              </span>
              {{ $t('webapp.evaluate.detailed_results') }}
              <span>#3</span>
            </h2>
          </div>

          <div class="evaluate__summary">
            <div class="evaluate__summary__index">
              <div class="evaluate__summary__index__title">
                <h4>{{ $t('webapp.evaluate.summary_title1') }}</h4>
                <div class="evaluate__summary__index__title__tooltip">
                  <b-tooltip
                  :label="$t('webapp.evaluate.tooltip_alert')"
                  type="is-dark"
                  position="is-right">
                    <unnnic-icon
                      icon="information-circle-4"
                      size="xs"
                      scheme="neutral-soft"
                    />
                  </b-tooltip>
                </div>
              </div>
              <p>82%</p>
            </div>

            <unnnic-card-number
              :description="$t('webapp.evaluate.summary_title2')"
              :number="'25'"
            />

            <unnnic-card-number
              :description="$t('webapp.evaluate.summary_title3')"
              :number="'2'"
            />
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
        <authorization-request-notification
          v-else
          :available="!repository.available_request_authorization"
          :repository-uuid="repository.uuid"
          @onAuthorizationRequested="updateRepository(false)" />
      </div>
      <div
        v-else>
        <b-notification
          :closable="false"
          type="is-info">
          {{ $t('webapp.evaluate.login') }}
        </b-notification>
        <login-form hide-forgot-password />
      </div>
    </div>
  </repository-view-base>
</template>

<script>
import AuthorizationRequestNotification from '@/components/repository/AuthorizationRequestNotification';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import BaseEvaluateResults from '@/components/repository/repository-evaluate/BaseEvaluateResults';
import { mapGetters } from 'vuex';

import LoginForm from '@/components/auth/LoginForm';
import RepositoryBase from './Base';


export default {
  name: 'RepositoryResult',
  components: {
    RepositoryViewBase,
    LoginForm,
    BaseEvaluateResults,
    AuthorizationRequestNotification,
  },
  extends: RepositoryBase,
  data() {
    return {
      evaluating: false,
      error: {},
      tabs: ['first', 'second'],
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
    ...mapGetters({
      authenticated: 'authenticated',
    }),
    resultId() {
      return parseInt(this.$route.params.resultId, 10);
    },
  },
  methods: {
    goToHome() {
      this.$router.push(
        `/dashboard/${this.$route.params.ownerNickname}/${this.$route.params.slug}/evaluate/manual`
      );
    },
  }
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import '~@weni/unnnic-system/dist/unnnic.css';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';


.evaluate {
  &__divider {
    height: 1px;
    background-color: #d5d5d5;
    margin: 2.5rem 0 0 0;
  }

  &__navigation {
    display: flex;
    justify-content: center;
    margin-top: 2.5rem;
    overflow: hidden;
    border-bottom: 1px solid $color-grey;

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

  &__content-header {
    &__title {
      font-family: $unnnic-font-family-secondary;
      color: $unnnic-color-neutral-darkest;
      font-size: $unnnic-font-size-title-sm;
    }
  }

  &__summary {
    width: 100%;
    display: flex;
    justify-content: space-between;

    &__index {
      background-color: #fff;
      min-width: 320px;
      border: 1px solid #E2E6ED;
      border-radius: 8px;
      margin-top: $unnnic-spacing-stack-sm;
      padding: 1rem;

      &__title {
        display: flex;

        &__tooltip {
          margin-left: $unnnic-spacing-stack-xs;
          margin-top: -0.1rem;
        }
      }
      p {
        margin-top: $unnnic-spacing-stack-sm;
        font-family: $unnnic-font-family-secondary;
        font-weight: 900;
        color: $unnnic-color-brand-weni-soft;
        font-size: $unnnic-font-size-title-sm;
      }
    }
    .unnnic-card-number {
      background-color: #fff;
      min-width: 320px;
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

    /deep/ .icon {
      background: rgba(0, 158, 150, 0.08);
      border-radius: 4px;
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
  }

  &__content-wrapper {
    max-width: 100%;
    margin: 0 auto;
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
