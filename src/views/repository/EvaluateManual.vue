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
              :title="$t('webapp.evaluate-manual.header_title')"
              icon="check-square-1"
              type="title"
              :has-information-icon="false"
              scheme="aux-orange" />
              <p
                v-html="$t('webapp.evaluate-manual.header_title_p')"
                class="column is-7"></p>
          </div>

          <div class="evaluate__divider"></div>

          <div class="evaluate__test">
            <div class="text column is-7">
              <h2
                v-html="$t('webapp.evaluate-manual.test_title')"></h2>
              <p
                v-html="$t('webapp.evaluate-manual.test_p')"></p>
            </div>
            <unnnic-button
              type="secondary"
              :text="$t('webapp.evaluate-manual.test_button')"
              size="large"
            />
          </div>

          <unnnic-card
            type="account"
            :title="$t('webapp.evaluate-manual.tips_title')"
            :description="$t('webapp.evaluate-manual.tips_description')"
            icon="study-light-idea-1"
            scheme="brand-weni-soft"
            class="evaluate__tips"
          />

          <div class="evaluate__historic">
            <div class="evaluate__historic__title">
              <h2>{{ $t("webapp.evaluate-manual.historic_title") }}</h2>
            </div>
          </div>
        </div>
        <div class="evaluate__container">
          <div class="evaluate__item">
            <authorization-request-notification
              v-if="repository && !repository.authorization.can_write"
              :available="!repository.available_request_authorization"
              :repository-uuid="repository.uuid"
              @onAuthorizationRequested="updateRepository(false)" />
          </div>
        </div>
      </div>
      <div
        v-else>
        <b-notification
          :closable="false"
          type="is-info">
          {{ $t('webapp.evaluate-manual.login') }}
        </b-notification>
        <login-form hide-forgot-password />
      </div>
    </div>
    <tour
      v-if="activeTutorial === 'evaluate'"
      :step-count="7"
      :next-event="eventClick"
      :finish-event="eventClickFinish"
      :reset-tutorial="eventReset"
      :skip-event="eventSkip"
      name="evaluate"/>
  </repository-view-base>
</template>

<script>
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import BaseEvaluateExamples from '@/components/repository/repository-evaluate/BaseEvaluateExamples';
import AuthorizationRequestNotification from '@/components/repository/AuthorizationRequestNotification';
import { mapActions, mapState, mapGetters } from 'vuex';
import { LANGUAGES } from '@/utils';
import Tour from '@/components/Tour';
import LoginForm from '@/components/auth/LoginForm';
import RepositoryBase from './Base';

export default {
  name: 'RepositoryEvaluateManual',
  components: {
    RepositoryViewBase,
    LoginForm,
    BaseEvaluateExamples,
    AuthorizationRequestNotification,
    Tour,
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
          title: `${LANGUAGES[lang]} (${this.$tc('webapp.evaluate-manual.get_examples_test_sentences', this.selectedRepository.evaluate_languages_count[lang])})`,
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
          message: `${this.error.detail || this.$t('webapp.evaluate-manual.default_error')} `,
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

  &__divider {
    height: 1px;
    background-color: $unnnic-color-neutral-soft;
    margin-top: $unnnic-spacing-stack-md;
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

  &__test {
    margin-top: $unnnic-spacing-stack-lg;
    border: 1px solid $unnnic-color-neutral-soft;
    border-radius: 8px;
    height: 132px;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .text {
      margin-left: 10px;

      h2 {
        font-family: $unnnic-font-family-secondary;
        color: $unnnic-color-neutral-dark;
        font-size: $unnnic-font-size-title-sm;
      }

      p {
        margin-top: $unnnic-spacing-stack-sm;
        font-family: $unnnic-font-family-secondary;
        color: $unnnic-color-neutral-dark;
        font-size: 14px;
      }
    }

    .unnnic-button {
      height: 48px;
      width: 300px;
    }
  }

  &__historic {
    margin-top: $unnnic-spacing-stack-lg;

    &__title {
      h2 {
        font-family: $unnnic-font-family-secondary;
        color: $unnnic-color-neutral-dark;
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
}
</style>
