<template>
  <repository-view-base :repository="repository" :error-code="errorCode">
    <div v-if="repository">
      <div v-if="authenticated">
        <loading v-if="loading" />
        <div v-else-if="repository.authorization.can_contribute" class="phrase-suggestion">
          <div v-if="pageItem === 1">
            <div class="phrase-suggestion__header">
              <div class="phrase-suggestion__header__title">
                <unnnic-card
                  type="title"
                  :title="$t('webapp.phrase-suggestion.title')"
                  :hasInformationIcon="false"
                  icon="copy-paste-1"
                  scheme="feedback-blue"
                />

                <unnnic-circle-progress-bar :progress="pageItem" :totalProgress="5" />
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
                  <h3>Adicionar uma nova frase</h3>
                  <p>Você adiciona uma nova frase
                    que ainda não foi enviada para treinamento
                    e a plataforma a utilizará como base para gerar novas frases</p>
                  <unnnic-button @click="goToAddNewSentence" type="secondary">
                    Selecionar método
                  </unnnic-button>
                </div>
                <div class="phrase-suggestion__cards__container-card">
                  <h3>Utilizar uma frase existente</h3>
                  <p>Você seleciona uma frase que já foi enviada anteriormente para treinamento
                    e a plataforma a utilizará como base para gerar novas frases</p>
                  <unnnic-button @click="goToAddExistingSentence" type="secondary">
                    Selecionar método
                  </unnnic-button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="pageItem === 2 && isSentenceNew">
            <div class="phrase-suggestion__header">
              <div class="phrase-suggestion__header__step">
                <div @click="goToPreviousStep" class="phrase-suggestion__header__back-button">
                  <unnnic-icon-svg icon="keyboard-arrow-left-1" size="md" />
                </div>
                <h1 class="ml-4 mr-5">
                  Adicionar nova frase
                </h1>
                <unnnic-circle-progress-bar class="ml-2" :progress="2" :totalProgress="5" />
              </div>
            </div>

            <hr class="divider" />

            <add-sentence-form
              :repository="repository"
              @created="updatedExampleList()"
              @onSubmit="addSentence"
            />

          </div>

          <div v-if="pageItem === 2 && !isSentenceNew">
            <div class="phrase-suggestion__header">
              <div class="phrase-suggestion__header__step">
                <div @click="goToPreviousStep" class="phrase-suggestion__header__back-button">
                  <unnnic-icon-svg icon="keyboard-arrow-left-1" size="md" />
                </div>
                <h1 class="ml-4 mr-5">
                  Utilizar frase existente
                </h1>
                <unnnic-circle-progress-bar class="ml-2" :progress="2" :totalProgress="5" />
              </div>
            </div>

            <hr class="divider" />
            <div class="column is-6 p-0">
              <unnnic-select
                label="Selecione a intenção para visualizar as frases"
                v-model="intentSelected"
                @onChange="addIntents"
              >
                <option
                  v-for="intent in repository.intents"
                  :key="intent.id"
                  :value="intent.value"
                >
                  {{ intent.value }}
                </option>
              </unnnic-select>
            </div>

            <hr class="divider" />

            <paginated-list
              v-if="phraseList"
              :item-component="sentencesIntents"
              :list="phraseList"
              :repository="repository"
              :per-page="perPage"
              @itemDeleted="onItemDeleted()"
              @itemSave="onItemSave()"
              @onSentenceSelected="onSentenceSelected"
              :load-all="true"
            />

          </div>

          <div v-if="pageItem === 3">
            <div class="phrase-suggestion__header">
              <div class="phrase-suggestion__header__step">
                <div @click="goToPreviousStep" class="phrase-suggestion__header__back-button">
                  <unnnic-icon-svg icon="keyboard-arrow-left-1" size="md" />
                </div>
                <h1 class="ml-4 mr-5">
                  Frase "{{ sentenceSelected.text }}"
                </h1>
                <unnnic-circle-progress-bar class="ml-2" :progress="3" :totalProgress="5" />
              </div>
            </div>

            <hr class="divider" />

            <h4 class="mb-5">
              Selecione quais palavras que deseja gerar as variações.
            </h4>

            <word-card
              v-for="(word, index) in wordsList"
              :key="index"
              :text="word.word"
              :entities="word.entity"
              @onChangeGenerate="updateWordsList"
            />

            <unnnic-button class="button--full mt-2" @click="addVariations" type="secondary">
              Concluir seleção
            </unnnic-button>

          </div>

          <div v-if="pageItem === 4">
            <div class="phrase-suggestion__header">
              <div class="phrase-suggestion__header__step">
                <div @click="goToPreviousStep" class="phrase-suggestion__header__back-button">
                  <unnnic-icon-svg icon="keyboard-arrow-left-1" size="md" />
                </div>
                <h1 class="ml-4 mr-5">
                  Seleção das variações de palavras geradas
                </h1>
                <unnnic-circle-progress-bar class="ml-2" :progress="4" :totalProgress="5" />
              </div>
            </div>

            <hr class="divider" />

            <h4 class="mb-5">
              Foram geradas diversas variações para cada uma das palavras selecionadas.<br>
              Agora, selecione as variações que deseja utilizar para gerar as frases.
            </h4>

            <unnnic-accordion
              v-for="(variation, index) in wordVariations"
              :key="index"
              v-model="variation.isOpen"
              :title="variation.word"
              class="variation-accordion mb-5"
            >
              <span
                slot="actions"
              >
                {{ variation.inputs.length }} variações geradas /
                {{ variation.suggestions.length }} variações selecionadas
              </span>
              <div>
                <div class="is-flex is-flex-direction-row is-flex-wrap-wrap">
                  <div
                    class="is-flex mr-5 mt-4"
                    v-for="(suggestion, index) in variation.inputs"
                    :key="index"
                    @click.stop="setSuggestion(suggestion, variation)"
                  >
                    <unnnic-checkbox
                      @change="setSuggestion(suggestion, variation)"
                      v-model="suggestion.checked"
                      :textRight="suggestion.text"
                    />
                  </div>
                </div>
                <hr class="divider" />
                <div @click.stop="" class="is-flex">
                  <div class="column is-4 p-0">
                    <unnnic-input
                      placeholder="Variação"
                      label="Adicionar variação diferente"
                      v-model="newVariation"
                      size="sm"
                    />
                  </div>
                    <unnnic-button
                      @click="addNewVariation(variation)"
                      :disabled="!newVariation"
                      class="mt-auto ml-4 add-variation"
                      style="height: 38px"
                      size="small"
                      iconLeft="add-1"
                      type="secondary"
                    >
                      Adicionar
                    </unnnic-button>
                </div>
              </div>
            </unnnic-accordion>

            <unnnic-button
              class="button--full my-5"
              @click="goToGeneratedSentences"
              type="secondary"
              >
              Gerar frases
            </unnnic-button>

          </div>

          <div v-if="pageItem === 5">
            <div class="phrase-suggestion__header">
              <div class="phrase-suggestion__header__step">
                <div @click="goToPreviousStep" class="phrase-suggestion__header__back-button">
                  <unnnic-icon-svg icon="keyboard-arrow-left-1" size="md" />
                </div>
                <h1 class="ml-4 mr-5">
                  Frases geradas
                </h1>
                <unnnic-circle-progress-bar class="ml-2" :progress="5" :totalProgress="5" />
              </div>
            </div>

            <hr class="divider" />

            <div class="phrase-suggestion__cards__variation-card">
              <div>
                <h3>{{ generatedSentences.length }} novas frases geradas</h3>
                <p class="mb-0">
                  Lista de frases geradas a partir da frase <span>{{ sentenceSelected.text }}</span>
                  para a intenção <span>{{ intentSelected }}</span>
                </p>
              </div>
              <unnnic-button
                @click="onSubmitToTraining"
                :loading="submittingToTraining"
                type="secondary"
              >
                Enviar para treinamento
              </unnnic-button>
            </div>

            <generated-sentences-table
              :list="generatedSentences"
              :repository="repository"
              :per-page="perPage"
              @onDeleteSentence="deleteSentence"
              :load-all="true"
            />

          </div>

        </div>
      </div>
      <div v-else>
        <authorization-request-notification
          :available="!repository.available_request_authorization"
          :repository-uuid="repository.uuid"
          @onAuthorizationRequested="updateRepository(false)"
        />
      </div>
    </div>
    <unnnic-modal
      :showModal="openFinishModal"
      text="Frases enviadas para treinamento!"
      scheme="feedback-green"
      modal-icon="alert-circle-1"
      :closeIcon="false"
    >
      <span
      slot="message"
      >
        As frases geradas foram enviadas para treinamento.
        Para aprimorar a inteligência com essas frases,
        execute o treinamento no menu Treinar Inteligência. 😉
      </span>
      <unnnic-button class="is-flex-grow-2" slot="options" type="terciary" @click="goToInitialStep">
        Voltar para o Gerador de frases
      </unnnic-button>
      <unnnic-button
        slot="options"
        type="secondary"
        @click="goToTraining"
      >
        Ir para Treinamento
      </unnnic-button>
    </unnnic-modal>
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
import IntentPagination from '@/components/shared/IntentPagination';
import AddSentenceForm from '@/components/repository/phrase-suggestion/AddSentenceForm';
import WordCard from '@/components/shared/accordion/WordCard';
import GeneratedSentencesTable from '@/components/repository/GeneratedSentencesTable';
import PaginatedList from '@/components/shared/PaginatedList';
import IntentSuggestion from '@/components/shared/accordion/IntentSuggestion';


export default {
  name: 'PhraseSuggestion',
  components: {
    Loading,
    LoginForm,
    IntentSuggestionList,
    RepositoryViewBase,
    BadgesIntentsSuggestion,
    AuthorizationRequestNotification,
    IntentPagination,
    AddSentenceForm,
    WordCard,
    GeneratedSentencesTable,
    PaginatedList,
  },
  extends: RepositoryBase,
  data() {
    return {
      pageItem: 1,
      isSentenceNew: false,
      perPage: 300,
      loading: false,
      intentSelected: '',
      phraseList: {
        items: [],
        total: 0,
      },
      sentenceSelected: {},
      wordsList: [],
      variationAccordion: false,
      checked: false,
      newVariation: '',
      isQuestion: false,
      wordVariations: [],
      generatedSentences: [],
      errors: {},
      submittingToTraining: false,
      openFinishModal: false,
      sentencesIntents: IntentSuggestion,
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
      'getIntentSuggestion',
      'suggestWords',
      'suggestSentences',
      'newExample',
      'searchExamples'
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
      this.clearPhraseList();
      this.phraseList.items.push(...phraseFiltered);
      this.phraseList.total = phraseValues[0].length;
      this.loading = false;
    },
    clearPhraseList() {
      this.phraseList.items = [];
      this.phraseList.total = 0;
      this.clearSelectedSuggestion();
    },
    goToPreviousStep() {
      this.pageItem--
    },
    goToAddNewSentence() {
      this.isSentenceNew = true
      this.pageItem = 2
    },
    goToAddExistingSentence() {
      this.isSentenceNew = false
      this.pageItem = 2
    },
    onSentenceSelected(sentence) {
      this.sentenceSelected = sentence
      this.splitSentence()
      this.pageItem = 3
    },
    addSentence(sentence) {
      this.sentenceSelected = sentence
      this.intentSelected = sentence.intent
      this.splitSentence()
      this.pageItem = 3
    },
    addVariations() {
      this.addWordVariation()
      this.pageItem = 4
    },
    goToGeneratedSentences() {
      this.generateSentences()
      this.pageItem = 5
    },
    async addIntents(intent) {
      // this.loading = true
      const { id } = this.repository.intents.find(e => e.value === intent)
      this.phraseList = await this.searchExamples({
        repositoryUuid: this.repository.uuid,
        version: this.repositoryVersion,
        query: {
          intent_id: id,
        },
      });
    },
    splitSentence() {
      let words = this.sentenceSelected.text.split(' ')

      words.forEach((word) => {
        this.isQuestion = word.includes('?')
      })

      words = words.map((word, index) => ({
        word: word.replace('?', ''),
        generate: true,
        entity: this.sentenceSelected?.entities
          ?.filter(e => word === this.sentenceSelected.text.substring(e.start, e.end)) || ''
      }))

      this.wordsList = words
    },
    async addWordVariation() {
      this.loading = true
      try {
        const { data } = await this.suggestWords({
          isQuestion: this.isQuestion,
          intent: this.intentSelected,
          texts: this.wordsList.map(e => ({
            ...e,
            entity: e?.entity[0]?.entity || ''
          }))
        });
        this.wordVariations = data.map(obj => {
          if (obj) {
            return {
              ...obj,
              inputs: obj.suggestions.map((suggestion, index) => ({
                text: suggestion,
                checked: index === 0
              })),
              suggestions: obj.suggestions.splice(0, 1),
            };
          }

          return obj;
        });
      } catch (e) {
        const message = this.$t('webapp.home.default_error');

        this.$buefy.toast.open({
          message,
          type: 'is-danger',
        });
      } finally {
        this.loading = false
      }
    },
    updateWordsList(props) {
      this.wordsList = this.wordsList.map(obj => {
        if (obj.word === props.text) {
          return { ...obj, generate: props.value };
        }

        return obj;
      });
    },
    async generateSentences() {
      this.loading = true
      try {
        const { data } = await this.suggestSentences({
          isQuestion: this.isQuestion,
          intent: this.intentSelected,
          texts: this.wordVariations.map(e => ({
            ...e,
            entity: e.entity || ''
          }))
        });
        const result = data.rasa_nlu_data.common_examples
        result.forEach(e => {
          e.language = this.repository.language
        })
        this.generatedSentences = result
      } catch (e) {
        const message = this.$t('webapp.home.default_error');

        this.$buefy.toast.open({
          message,
          type: 'is-danger',
        });
      } finally {
        this.loading = false
      }
    },
    deleteSentence(item) {
      this.generatedSentences = this.generatedSentences.filter(sentence => sentence !== item)
    },
    addNewVariation(variation) {
      const newInput = { text: this.newVariation, checked: false }
      this.wordVariations.find(e => e === variation)
        .inputs.push(newInput)
      this.setSuggestion(newInput, variation)
      this.newVariation = ''
    },
    setSuggestion(input, variation) {
      input.checked = !input.checked
      variation.suggestions = variation.inputs
        .filter(e => e.checked === true)
        .map(e => e.text)
    },
    async onSubmitToTraining() {
      this.errors = {};
      await this.generatedSentences.forEach((e, index) => {
        this.submittingToTraining = true;
        try {
          this.newExample({
            repository: this.repository.uuid,
            repositoryVersion: this.repository.repository_version_id,
            ...this.generatedSentences[index],
          });

          this.submittingToTraining = false;

          this.openFinishModal = true
          return true;
        } catch (error) {
          /* istanbul ignore next */

          const errorResponse = error.response;
          const errorText = error.response.data;
          /* istanbul ignore next */
          if (errorText.detail[0] === 'Enter a valid value that has letters in it') {
            this.$buefy.toast.open({
              message: this.$t('webapp.trainings.error_caracter_type'),
              type: 'is-danger'
            });
          }
          if (errorResponse && errorText.detail[0] !== 'Enter a valid value that has letters in it') {
            /* istanbul ignore next */
            this.$buefy.toast.open({
              message: this.$t('webapp.trainings.intention_or_sentence_already_exist'),
              type: 'is-danger'
            });
            this.errors = errorResponse;
          }
          /* istanbul ignore next */
          this.submittingToTraining = false;
        }
        return false;
      })
    },
    goToInitialStep() {
      this.pageItem = 1
      this.openFinishModal = false
    },
    goToTraining() {
      this.$router.push(`/dashboard/${this.$route.params.ownerNickname}/${this.$route.params.slug}/training`)
    }
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.phrase-suggestion {
  font-family: $unnnic-font-family-secondary;

    &__header {
      &__container {
        display: flex;
        align-items: center;
        padding-bottom: $unnnic-spacing-stack-lg;
        margin-bottom: $unnnic-spacing-stack-lg;
        border-bottom: 1px solid $unnnic-color-neutral-soft;
      }

      &__title {
        display: flex;
        gap: $unnnic-spacing-stack-xl;
        margin-bottom: $unnnic-spacing-stack-sm;
      }

      &__subtitle {
        max-width: 50%;
        font-size: $unnnic-font-size-body-gt;
        color: $unnnic-color-neutral-dark;
        line-height: $unnnic-line-height-md + $unnnic-font-size-body-gt;
      }

      &__back-button {
        cursor: pointer;
      }

      &__step {
        display: flex;
        align-items: center;

        h1 {
          font-family: $unnnic-font-family-primary;
          font-size: $unnnic-font-size-title-sm;
        }
      }
    }

    &__cards {
      display: flex;
      flex-direction: column;
      gap: $unnnic-spacing-stack-md;

      p {
        color: $unnnic-color-neutral-cloudy;
      }

      &__container {
        display: flex;
        gap: $unnnic-spacing-stack-sm;

        &-card {
          border-radius: $unnnic-border-radius-md;
          border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
          padding: $unnnic-spacing-stack-md;

          h3 {
            font-family: $unnnic-font-family-secondary;
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

      &__variation {

        &-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: $unnnic-border-radius-md;
          border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
          padding: $unnnic-spacing-stack-md;

          h3 {
            font-family: $unnnic-font-family-secondary;
            font-size: $unnnic-font-size-title-sm;
            font-weight: $unnnic-font-weight-regular;
            margin-bottom: $unnnic-spacing-stack-nano;
            color: $unnnic-color-neutral-dark;
          }

          p {
            font-size: $unnnic-font-size-body-gt;
            color: $unnnic-color-neutral-cloudy;
            line-height: $unnnic-line-height-md + $unnnic-font-size-body-gt;
            margin-bottom: $unnnic-spacing-stack-sm;
          }

          span {
            color: $unnnic-color-neutral-dark;
            font-weight: $unnnic-font-weight-bold;
          }
        }
      }
    }

    .variation-accordion {

      span {
        font-size: $unnnic-font-size-body-gt;
        color: $unnnic-color-neutral-cloudy;
      }

      .divider {
        margin: 2rem 0 1rem;
        height: 1px;
      }
    }
    .button--full {
      width: 100%;
    }
    /deep/ .input {
      height: auto;
    }
    /deep/ .dropdown {
      display: block;
    }
    /deep/ .unnnic-accordion .header .title {
      margin-bottom: 0;
    }

    /deep/ input:focus, /deep/ textarea:focus {
      box-shadow: none;
      border-color: #9caccc;
    }

    /deep/ .actions {
      display: initial !important;
    }

    h3 {
      font-family: $unnnic-font-family-secondary;
    }

    h4 {
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      color: $unnnic-color-neutral-cloudy;
    }

    p, span {
      font-size: $unnnic-font-size-body-gt;
    }
  .divider {
    background: $unnnic-color-neutral-soft;
    margin: $unnnic-spacing-stack-lg 0;
    height: 1px;
  }
  .add-variation {
    width: 160px;
  }
}
</style>
