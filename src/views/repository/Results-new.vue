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
              {{ $t('webapp.evaluate.results') }}
            </h2>
            <p
              class="evaluate__content-header__description"
              v-html="$t('webapp.evaluate.description')"
            />
          </div>
          <FilterResultExample />
          <div class="evaluate__content-wrapper">
            <BaseEvaluateVersions :repository="repository" />
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
          class="is-info"
          role="alert"
        >
          {{ $t('webapp.evaluate.login') }}
        </BNotification>
        <LoginForm hideForgotPassword />
      </div>
    </div>
  </RepositoryViewBase>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import BaseEvaluateVersions from '@/components/repository/repository-evaluate/BaseEvaluateVersions';
import FilterResultExample from '@/components/repository/repository-evaluate/results/FilterResultExample';
import AuthorizationRequestNotification from '@/components/repository/AuthorizationRequestNotification';
import LoginForm from '@/components/auth/LoginForm';
import RepositoryBase from './Base';

export default {
  name: 'RepositoryResults',
  components: {
    RepositoryViewBase,
    LoginForm,
    BaseEvaluateVersions,
    AuthorizationRequestNotification,
    FilterResultExample,
  },
  extends: RepositoryBase,
  data() {
    return {
      currentLanguage: '',
      evaluating: false,
      error: {},
    };
  },
  computed: {
    ...mapState({
      selectedRepository: (state) => state.Repository.selectedRepository,
    }),
    ...mapGetters({
      repositoryVersion: 'getSelectedVersion',
    }),
  },
  watch: {
    selectedRepository() {
      if (this.currentLanguage === '') {
        this.currentLanguage = this.selectedRepository.language;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';

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

    &__requestAuthorization {
      color: $color-fake-black;
      font-weight: $font-weight-medium;
      text-align: center;
      float: right;
      text-decoration: none !important;

      &:hover {
        color: $color-grey-darker !important;
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

    &__description {
      margin-bottom: $between-subtitle-content + 0.5rem;
      line-height: 0.8rem;
      @media screen and (max-width: $mobile-width * 1.2) {
        line-height: 1.2rem;
      }
    }

    &__wrapper {
      display: flex;
      align-items: flex-end;
      margin-top: 1rem;

      &__language-select {
        flex: 1;
        margin-right: 0.5rem;
        text-align: left;
      }
    }
  }

  &__content-wrapper {
    max-width: 100%;
    margin: 0 auto;
  }
}
</style>
