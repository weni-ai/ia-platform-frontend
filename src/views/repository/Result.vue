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
            <h2 class="evaluate__content-header__title">
              {{ $t('webapp.evaluate.detailed_results') }}
            </h2>
          </div>
          <div class="evaluate__content-wrapper">
            <BaseEvaluateResults
              :resultId="resultId"
              :repository="repository"
            />
          </div>
        </div>
        <AuthorizationRequestNotification
          v-else
          :available="!repository.available_request_authorization"
          :repositoryUuid="repository.uuid"
          @onAuthorizationRequested="updateRepository(false)"
        />
      </div>
      <div v-else>
        <BNotification
          :closable="false"
          type="is-info"
        >
          {{ $t('webapp.evaluate.login') }}
        </BNotification>
        <LoginForm hideForgotPassword />
      </div>
    </div>
  </RepositoryViewBase>
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
    };
  },

  mounted() {
    document.head.appendChild(window.bulmaStyle);
  },

  beforeUnmount() {
    document.head.removeChild(window.bulmaStyle);
  },

  computed: {
    ...mapGetters({
      authenticated: 'authenticated',
    }),
    resultId() {
      return parseInt(this.$route.params.resultId, 10);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';
@import '@/assets/scss/variables.scss';

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

  &__content-header {
    text-align: left;

    &__buttons {
      margin: 2rem 1rem;
    }

    &__title {
      margin-top: 2rem;
      font-size: 1.75rem;
      font-weight: $font-weight-medium;
      color: $color-fake-black;
      margin-bottom: $between-title-subtitle;
    }
  }

  &__content-wrapper {
    max-width: 100%;
    margin: 0 auto;
  }
}
</style>
