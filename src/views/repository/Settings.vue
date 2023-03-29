<template>
  <repository-view-base
    :repository="repository"
    :error-code="errorCode">
    <div class="settings">
      <div v-if="repository">
        <div v-if="authenticated">
          <div
            v-if="repository.authorization.can_write">
            <div class="settings__section">
              <unnnic-card
              type="title"
              :title="$t('webapp.settings.title_edit_repository')"
              :hasInformationIcon="false"
              icon="cog-1"
              scheme="brand-weni-soft"
              />
              <p class="settings__section__subtitle">
                {{ $t("webapp.settings.description") }}
              </p>
              <unnnic-tab initialTab="first" :tabs="tabs">
                <template slot="tab-head-first">
                  {{ $t("webapp.settings.settings_tab") }}
                </template>
                <template slot="tab-panel-first">
                  <edit-repository-form
                    :owner-nickname="repository.owner.nickname"
                    :slug="repository.slug"
                    :initial-data="getEditInitialData()"
                    @edited="onEdited($event)"
                  />
                  <hr>
                  <import-intelligence/>
                </template>
                <template slot="tab-head-second">
                  {{ $t("webapp.settings.versions_tab") }}
                </template>
                <template slot="tab-panel-second">
                  <versions />
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
      </div>


      <div
        v-if="!authenticated">
        <div class="settings__section">
          <b-notification
            :closable="false"
            type="is-info">
            {{ $t('webapp.settings.login') }}
          </b-notification>
          <login-form hide-forgot-password />
        </div>
      </div>
    </div>
    <unnnic-modal
      :showModal="openSuccessModal"
      :text="$t('webapp.settings.save_success_title')"
      scheme="feedback-green"
      modal-icon="check-circle-1-1"
      @close="openSuccessModal = false"
    >
      <span
      slot="message"
      v-html="$t('webapp.settings.save_success_message')" />
    </unnnic-modal>
  </repository-view-base>
</template>

<script>
import AuthorizationRequestNotification from '@/components/repository/AuthorizationRequestNotification';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import EditRepositoryForm from '@/components/repository/EditRepositoryForm';
import ImportIntelligence from '@/components/repository/ImportIntelligence';
import LoginForm from '@/components/auth/LoginForm';
import RepositoryBase from './Base';
import Versions from './Versions';


export default {
  name: 'RepositorySettings',
  components: {
    RepositoryViewBase,
    EditRepositoryForm,
    LoginForm,
    AuthorizationRequestNotification,
    ImportIntelligence,
    Versions,
  },
  data() {
    return {
      tabs: ['first', 'second'],
      openSuccessModal: false
    };
  },
  extends: RepositoryBase,
  methods: {
    getEditInitialData() {
      const {
        name,
        slug,
        language,
        description,
        is_private: isPrivate,
        algorithm,
        use_competing_intents: useCompetingIntents,
        use_name_entities: useNameEntities,
        use_analyze_char: useAnalyzeChar,
        use_transformer_entities: useTransformerEntities,
      } = this.repository;
      return {
        name,
        slug,
        language,
        categories: this.repository.categories_list.map(
          ({ id, name: n }) => ({ value: id, display_name: n }),
        ),
        description,
        is_private: isPrivate,
        algorithm,
        use_competing_intents: useCompetingIntents,
        use_name_entities: useNameEntities,
        use_analyze_char: useAnalyzeChar,
        use_transformer_entities: useTransformerEntities,
      };
    },
    onEdited(repository) {
      if (this.repository.slug === repository.slug) {
        this.updateRepository();
      } else {
        this.$router.push({
          name: 'repository-settings',
          params: {
            ownerNickname: this.repository.owner.nickname,
            slug: repository.slug,
          },
        });
      }
      this.openSuccessModal = true
    },
    onRoleSetted() {
      this.$refs.authorizationsList.updateAuthorizations();
    },
    onReviewAuthorizationRequest() {
      this.$refs.authorizationsList.updateAuthorizations();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

  .settings {
    font-family: $font-family;

    &__section {
      margin-bottom: 2rem;

      h1 {
      font-size: 1.75rem;
      font-weight: $font-weight-medium;
      color: $color-fake-black;
      margin-bottom: $between-title-subtitle;
      }

      &__subtitle {
        font-size: $unnnic-font-size-body-gt;
        font-family: $unnnic-font-family-secondary;
        color: $unnnic-color-neutral-dark;
        line-height: $unnnic-line-height-md + $unnnic-font-size-body-gt;
        margin-top: $unnnic-spacing-stack-sm;
        margin-bottom: $unnnic-spacing-stack-lg;
      }
    }

    hr {
      margin: 3rem 0;
    }
  }
  /deep/ .tab-header {
    margin-bottom: 2rem;
  }

  /deep/ input:focus {
    box-shadow: none;
    border-color: #9caccc;
  }
  /deep/ .dropdown.active .dropdown-data {
    z-index: 2;
  }
  /deep/ .unnnic-card-tag-carousel__container__slide__item {
    margin-right: 1rem;
  }
  /deep/ .unnnic-tooltip-label {
    max-width: unset;
}
</style>
