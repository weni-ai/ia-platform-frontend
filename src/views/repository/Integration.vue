<template>
  <repository-view-base :repository="repository" :error-code="errorCode">
    <div v-if="repository">
      <div v-if="authenticated" class="repository-analyze-text">
        <div class="repository-analyze-text__header">
          <div class="repository-analyze-text__header__title column is-8 p-0">
            <unnnic-card
              type="title"
              :title="$t('webapp.integration.title')"
              :hasInformationIcon="false"
              icon="charger-1"
              scheme="brand-weni-soft"
            />
            <p
              v-html="$t('webapp.integration.description', {link: 'https://docs.weni.ai/l/pt/bothub/'})"
              class="repository-analyze-text__header__subtitle">
            </p>
          </div>
          <div class="repository-analyze-text__header__description column is-3 p-0">
            <unnnic-button
              v-if="hasIntegration && !hasIntegrationCheckError"
              type="secondary"
              :loading="!hasIntegrationDefined"
              @click="changeIntegrateModalState(true)"
            >
              {{ $t("webapp.summary.remove_integrate") }}
            </unnnic-button>
            <unnnic-button
              v-else-if="!hasIntegrationCheckError"
              type="secondary"
              :loading="!hasIntegrationDefined"
              @click="changeIntegrateModalState(true)"
            >
              {{ $t("webapp.summary.integrate") }}
            </unnnic-button>
          </div>
        </div>

        <unnnic-tab initialTab="first" :tabs="tabs">
          <template slot="tab-head-first">
            {{ $t("webapp.integration.http_tab") }}
          </template>
          <template slot="tab-panel-first">
            <p
              v-html="$t('webapp.integration.http_title')"
              class="repository-analyze-text__header__subtitle">
            </p>
            <div class="repository-analyze-text__url">
              <div class="repository-analyze-text__field">
                <h2>URL</h2>
                <p v-html="$t('webapp.integration.url_description')"></p>
              </div>
              <highlighted-code code-class="plaintext">
                {{ repository.nlp_server }}v2/parse/
              </highlighted-code>
            </div>
            <div class="repository-analyze-text__url">
              <div class="repository-analyze-text__field">
                <h2>Headers</h2>
                <p v-html="$t('webapp.integration.headers_description')"></p>
              </div>
              <div class="repository-analyze-text__url__authorization-container">
                <unnnic-select
                  :label="$t('webapp.integration.token_title')"
                  v-model="profileAuth"
                >
                  <option
                    v-for="option in getAuthorizations"
                    :key="option.index"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </unnnic-select>
                <div class="repository-analyze-text__item__authorization-container__copy">
                  <highlighted-code
                    :code="codes.curl"
                    code-class="plaintext" />
                </div>
              </div>
            </div>
            <div class="repository-analyze-text__url">
              <div class="repository-analyze-text__field">
                <h2>Post Body</h2>
                <p v-html="$t('webapp.integration.post_body_description')"></p>
              </div>
              <highlighted-code code-class="json"
                >{ "language":"[{{ $t("webapp.analyze_text.language_code") }}]", "text": "[{{
                  $t("webapp.analyze_text.text_to_analyze")
                }}]" }
              </highlighted-code>
            </div>
            <div class="repository-analyze-text__url">
              <div class="repository-analyze-text__field">
                <h2>Response</h2>
                <p v-html="$t('webapp.integration.response_description')"></p>
              </div>
              <div class="json-code">
                <div class="json-code__short">
                  <pre>{{ JSON.stringify(json, null, 2).split(/\n/).slice(0,3).join('\n') }}</pre>
                </div>
                <div class="json-code__full" v-show-slide="codeOpen">
                  <pre>{{ JSON.stringify(json, null, 2).split(/\n/).slice(3).join('\n') }}</pre>
                </div>
              </div>
              <unnnic-button
                size="large"
                type="secondary"
                @click="toggleCode"
              >
              {{ codeOpen ?
                $t("webapp.integration.code_button_short") :
                $t("webapp.integration.code_button") }}
              </unnnic-button>
            </div>
          </template>
          <template slot="tab-head-second">
            {{ $t("webapp.integration.generator_tab") }}
          </template>
          <template slot="tab-panel-second">
            <div class="repository-analyze-text__url">
              <div class="repository-analyze-text__field">
                <h2 v-html="$t('webapp.analyze_text.code_generator')"></h2>
                <p v-html="$t('webapp.analyze_text.code_generator_text')"></p>
              </div>
            </div>
            <request-generator
              :default-language-field="repository.language"
              :authorization-uuid="getProfileDetail[1] || ''"
              class="request_generator"
            />
          </template>
        </unnnic-tab>
        <integration-modal
          :openModal="integrateModal"
          :repository="getCurrentRepository"
          :hasIntegration="hasIntegration"
          @closeIntegratationModal="changeIntegrateModalState(false)"
          @dispatchUpdateIntegration="changeIntegrationValue()"
        />
      </div>
      <div v-else>
        <b-notification :closable="false" type="is-info">
          {{ $t("webapp.analyze_text.notification_info") }}
        </b-notification>
        <login-form hide-forgot-password />
      </div>
    </div>
  </repository-view-base>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import RequestGenerator from '@/components/repository/RequestGenerator';
import LoginForm from '@/components/auth/LoginForm';
import HighlightedCode from '@/components/shared/HighlightedCode';
import RepositoryBase from './Base';
import I18n from '@/utils/plugins/i18n';
import IntegrationModal from '@/components/shared/IntegrationModal';

export default {
  name: 'RepositoryIntegration',
  components: {
    RepositoryViewBase,
    RequestGenerator,
    LoginForm,
    HighlightedCode,
    I18n,
    IntegrationModal
  },
  extends: RepositoryBase,
  data() {
    return {
      json: {
        intent: {
          name: 'love',
          confidence: 0.6943462393863934
        },
        intent_ranking: [
          {
            name: 'love',
            confidence: 0.6943462393863934
          },
          {
            name: 'hate',
            confidence: 0.30565376061360666
          }
        ],
        groups_list: ['animal'],
        entities_list: [],
        entities: {
          animal: [
            {
              value: 'puppy',
              entity: 'dog',
              confidence: 0.67255946125065845
            }
          ],
          other: []
        },
        text: 'i love my puppy',
        update_id: 47,
        language: 'en'
      },
      profileAuth: '',
      integrateModal: false,
      hasIntegration: null,
      integrationError: null,
      loading: false,
      tabs: ['first', 'second'],
      codeOpen: false,
    };
  },
  computed: {
    ...mapGetters([
      'getCurrentRepository',
      'getProjectSelected',
      'getOrgSelected',
    ]),
    profileToken() {
      if (!this.repository || this.repository.authorization === 'null') {
        return null;
      }
      return this.repository.authorization;
    },
    getAuthorizations() {
      if (this.repository.authorization.organizations !== undefined) {
        let authorization = [];
        if (this.repository.authorization.organizations.length !== 0) {
          authorization = this.repository.authorization.organizations.map(auth => {
            const nickname = auth.user__nickname;
            const id = auth.uuid;

            return `${nickname} - Bearer ${id}`;
          });
        }
        return authorization;
      }
      return [];
    },
    getProfileDetail() {
      if (this.profileToken) {
        const splitProfile = this.profileAuth.split(' - ');
        return splitProfile;
      }
      return '';
    },
    hasIntegrationDefined() {
      return this.hasIntegration !== null;
    },
    hasIntegrationCheckError() {
      return this.integrationError !== null;
    },
    codes() {
      return {
        curl: [
          `${this.getProfileDetail[0]} - ${this.getProfileDetail[1]}`
        ].join()
      };
    },
  },
  watch: {
    profileToken() {
      const { organizations } = this.repository.authorization;
      if (this.profileToken && organizations && organizations.length !== 0) {
        const { user__nickname, uuid } = this.repository.authorization.organizations[0];
        const profileAuthorization = `${user__nickname} - Bearer ${uuid}`;
        this.profileAuth = profileAuthorization;
      }
    },
    getCurrentRepository() {
      if (this.getCurrentRepository) {
        this.checkIfHasIntegration();
      }
    },
  },
  methods: {
    ...mapActions(['getIntegrationRepository']),
    async checkIfHasIntegration() {
      try {
        console.log(this.getOrgSelected)
        const { data } = await this.getIntegrationRepository({
          repository_version: this.getCurrentRepository.repository_version_id,
          repository_uuid: this.getCurrentRepository.uuid,
          project_uuid: this.getProjectSelected,
          organization: this.getOrgSelected,
        });
        this.hasIntegration = data.in_project;
      } catch (err) {
        this.integrationError = err.response && err.response.data;
      }
    },
    changeIntegrationValue() {
      this.hasIntegration = null;
    },
    changeIntegrateModalState(value) {
      if (this.integrationError !== null && value) {
        this.$buefy.toast.open({
          message: this.integrationError.detail,
          type: 'is-danger',
        });
        return;
      }
      this.integrateModal = value;
    },
    copyText() {
      navigator.clipboard.writeText(this.getProfileDetail[1]);
      this.$buefy.toast.open({
        message: this.$t('webapp.integration.copy'),
        type: 'is-success'
      });
    },
    toggleCode() {
      this.codeOpen = !this.codeOpen
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.repository-analyze-text {
  font-family: $unnnic-font-family-secondary;
  color: $unnnic-color-neutral-dark;

  &__header {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-stack-xgiant;
    margin-bottom: 40px;

    .unnnic-button {
      min-width: 245px;
    }

    &__subtitle {
      font-size: $unnnic-font-size-body-gt;
      margin-top: $unnnic-spacing-stack-md;

      /deep/ a {
        color: $unnnic-color-neutral-dark;
        text-decoration: underline;
        font-weight: 700;
      }
    }
  }

  &__url {
    margin-top: $unnnic-spacing-stack-md;
    .unnnic-button {
      width: 100%;
      height: 48px;
      background: rgba(226, 230, 237, 0.16);
      margin: $unnnic-spacing-stack-sm 0px 40px 0px;
    }

    .json-code {
      background-color: $unnnic-color-neutral-lightest;
      border: 1px solid $unnnic-color-neutral-soft;
      border-radius: 4px;
      padding: 24px 16px;
      font-family: $unnnic-font-family-primary;
      color: $unnnic-color-neutral-dark;
      font-size: $unnnic-font-size-body-gt;
    }
  }

  &__field {
    h2 {
      font-family: $unnnic-font-family-secondary;
    }
    p {
      color: $unnnic-color-neutral-cloudy;
      font-size: $unnnic-font-size-body-gt;
      margin: $unnnic-spacing-stack-xs 0px;
    }
  }

  .request_generator {
    margin-top: $unnnic-spacing-stack-sm;
  }
  .unnnic-select {
    margin-bottom: $unnnic-spacing-stack-xs;
    /deep/ .input {
      height: 46px;
    }
    /deep/ .dropdown {
      display: block;
    }
  }
}
</style>
