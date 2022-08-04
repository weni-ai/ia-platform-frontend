<template>
  <repository-view-base
    :repository="repository"
    :error-code="errorCode">
    <div v-if="repository">
      <div v-if="authenticated">
        <div
          v-if="repository.authorization.can_contribute"
          class="phrase-suggestion">
          <div class="phrase-suggestion__header">
            <div class="phrase-suggestion__header__title">
              <unnnic-card
                type="title"
                :title="$t('webapp.phrase-suggestion.title')"
                :hasInformationIcon="false"
                icon="copy-paste-1"
                scheme="feedback-blue"
              />

              <unnnic-circle-progress-bar :progress="pageItem" :totalProgress="5"  />
            </div>

            <div class="phrase-suggestion__header__container">
              <p class="phrase-suggestion__header__subtitle">
                {{ $t('webapp.phrase-suggestion.subtitle') }}
              </p>
            </div>
          </div>

          <div class="phrase-suggestion__cards">
            <p>Selecione o método que será utilizado para gerar as frases.</p>
            <div class="phrase-suggestion__cards__container">
              <div class="phrase-suggestion__cards__container-card">
                <h3>Title</h3>
                <p>Você adiciona uma nova frase
                  que ainda não foi enviada para treinamento
                   e a plataforma a utilizará como base para gerar novas frases</p>
                <unnnic-button
                  type="secondary"
                >
                  Selecionar método
                </unnnic-button>
              </div>
              <div class="phrase-suggestion__cards__container-card">
                <h3>Title</h3>
                <p>Você adiciona uma nova frase que
                  ainda não foi enviada para treinamento
                  e a plataforma a utilizará como base para gerar novas frases</p>
                <unnnic-button
                  type="secondary"
                >
                  Selecionar método
                </unnnic-button>
              </div>
            </div>
          </div>

          <badges-intents-suggestion
            :list="repository.intents"
            :repository="repository"
            @phraseSuggestion="setPhraseSuggestion($event)"
            @dispatchLoading="updateLoading($event)"/>
          <loading
            v-if="loading"/>
          <intent-suggestion-list
            v-else-if="intentSelected !== ''"
            :per-page="perPage"
            :repository="repository"
            :intent="intentSelected"
            :phrase-list="phraseList"/>
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
          {{ $t('webapp.trainings.login') }}
        </b-notification>
        <login-form hide-forgot-password />
      </div>
    </div>
  </repository-view-base>
</template>

<script>
import RepositoryBase from './Base';
import { mapGetters, mapActions } from 'vuex';
import Loading from '@/components/shared/Loading';
import LoginForm from '@/components/auth/LoginForm';
import IntentSuggestionList from '@/components/shared/IntentSuggestionList';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import BadgesIntentsSuggestion from '@/components/repository/BadgesIntentsSuggestion';
import AuthorizationRequestNotification from '@/components/repository/AuthorizationRequestNotification';

export default {
  name: 'PhraseSuggestion',
  components: {
    Loading,
    LoginForm,
    IntentSuggestionList,
    RepositoryViewBase,
    BadgesIntentsSuggestion,
    AuthorizationRequestNotification,
  },
  extends: RepositoryBase,
  data() {
    return {
      pageItem: 1,
      perPage: 10,
      loading: false,
      intentSelected: '',
      phraseList: {
        items: [],
        total: 0,
      },
    };
  },
  computed: {
    ...mapGetters({
      authenticated: 'authenticated',
      repositoryVersion: 'getSelectedVersion',
      repositoryUUID: 'getCurrentRepository',
      versionSelected: 'getSelectedVersion',
    }),
  },
  watch: {
    versionSelected() {
      this.intentSelected = '';
    },
  },
  methods: {
    ...mapActions([
      'setEditingStatus',
      'clearSelectedSuggestion',
      'setUpdateRepository',
    ]),
    updateLoading(intent) {
      this.loading = true;
      this.intentSelected = intent;
    },
    async setPhraseSuggestion(value) {
      const phraseValues = Object.values(value);
      this.setEditingStatus(false);
      if (phraseValues.length === 0) {
        this.clearPhraseList();
        this.loading = false;
        return;
      }
      const phraseFiltered = phraseValues[0].map((text, id) => {
        const phrase = {
          id,
          text,
        };
        return (
          phrase
        );
      });
      await this.clearPhraseList();
      this.phraseList.items.push(...phraseFiltered);
      this.phraseList.total = phraseValues[0].length;
      this.loading = false;
    },
    clearPhraseList() {
      this.phraseList.items = [];
      this.phraseList.total = 0;
      this.clearSelectedSuggestion();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.phrase-suggestion{

    &__header{
        &__container{
          display: flex;
          align-items: center;
          padding-bottom: $unnnic-spacing-stack-lg;
          margin-bottom: $unnnic-spacing-stack-lg;
          border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
        }
        &__title {
          display: flex;
          gap: $unnnic-spacing-stack-xl;
          margin-bottom: $unnnic-spacing-stack-sm;
        }

        &__subtitle{
            max-width: 507px;
            font-size: $unnnic-font-size-body-gt;
            color: $unnnic-color-neutral-dark;
            line-height: $unnnic-line-height-md + $unnnic-font-size-body-gt;
        }
    }

    &__cards {
      display: flex;
      flex-direction: column;
      gap: $unnnic-spacing-stack-md;

      &__container {
        display: flex;
        gap: $unnnic-spacing-stack-sm;

        &-card {
          border-radius: $unnnic-border-radius-md;
          border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
          padding: $unnnic-spacing-stack-md;

          h3 {
            font-size: $unnnic-font-size-body-lg;
            font-weight: $unnnic-font-weight-bold;
            margin-bottom: $unnnic-spacing-stack-nano;
            color: $unnnic-color-neutral-darkest;
          }

          p {
            font-size: $unnnic-font-size-body-gt;
            color: $unnnic-color-neutral-cloudy;
            line-height: $unnnic-line-height-md + $unnnic-font-size-body-gt;
            margin-bottom: $unnnic-spacing-stack-sm;
          }

          button {
            width: 100%;
          }
        }
      }
    }

}

</style>
