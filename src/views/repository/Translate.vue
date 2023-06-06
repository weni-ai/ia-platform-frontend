<template>
  <repository-view-base
    :repository="repository"
    :error-code="errorCode">
    <div v-if="repository">
      <div v-if="authenticated">
        <div
          v-if="repository.authorization.can_contribute || repository.authorization.can_translate">
          <div class="languageTitle">
            <div @click="goToTranslationStatus" class="languageTitle__back-button">
              <unnnic-icon-svg icon="keyboard-arrow-left-1" size="md" />
            </div>
            <h1>
              {{ languageName }}
            </h1>
          </div>
          <unnnic-tab
            v-model="activeTab"
            initialTab="not_translated"
            :tabs="['not_translated', 'translated']"
          >
            <template slot="tab-head-not_translated">
                  {{ $tc("webapp.translate.tab_not_translated", 0) }}
            </template>
            <template slot="tab-panel-not_translated">
              <div class="repository-translate">
              </div>
              <div v-if="totalItems.total > 0" class="repository-translate__header">
                <div class="translate-description">
                  <h1>{{ $t('webapp.translate.select_sentences_title') }}</h1>
                  <p>{{ $t('webapp.translate.select_sentences_subtitle',
                    {selected: selectedItems.length, total: totalItems.total}) }}
                  </p>
                </div>
                <div class="repository-translate__header__buttons">
                    <unnnic-button
                      type="secondary"
                      @click="sendAutoTranslate()"
                    >
                      {{ $t('webapp.translate.translate_sentences') }}
                    </unnnic-button>
                </div>
              </div>
              <div v-if="!!translate.to">
                <unnnic-modal class="importModal"
                  :closeIcon="false"
                  :showModal="isImportFileVisible"
                >
                  <unnnic-modal-upload
                  slot="message"
                  v-model="translationFile"
                  :textCancel="$t('webapp.import_dataset.cancel')"
                  :acceptMultiple="false"
                  :textTitle="$t('webapp.translate.import_title')"
                  :textAction="$t('webapp.import_dataset.importar')"
                  :isUploading="waitDownloadFile"
                  supportedFormats=".xlsx"
                  canImport
                  @action="importTranslation()"
                  @cancel="closeImportModal()"
                  @close="closeImportModal()"
                  />
                </unnnic-modal>

                <unnnic-modal-next
                  v-if="isExportFileVisible"
                  type="alert"
                  :title="$t('webapp.translate.export_title')"
                  :actionPrimaryLabel="$t('webapp.translate.export_button')"
                  :actionSecondaryLabel="$t('webapp.home.cancel')"
                  @click-action-secondary="closeExportModal()"
                  @click-action-primary="exportTranslation()"
                  actionPrimaryButtonType="secondary"
                >
                    <template slot="description">
                    {{ $t('webapp.translate.export_description') }}
                    <unnnic-select
                      :label="$t('webapp.translate.export_method')"
                      v-model="allTranslations"
                      class="select-translation"
                    >
                      <option
                        v-for="option in exportOption"
                        :key="option.id"
                        :value="option.value"
                        @select="allTranslations = option.value"
                      >
                        {{ option.label }}
                      </option>
                    </unnnic-select>
                  </template>
                </unnnic-modal-next>
                <div class="repository-translate__list">
                  <div class="repository-translate__list__search">
                    <sentence-filters
                      :intents="repository.intents_list"
                      :entities="repository.entities"
                      @querystringformatted="onSearch($event)"/>
                  </div>
                  <div class="repository-translate__progress" v-if="translating">
                    <unnnic-modal :showModal="true" :closeIcon="false">
                      <div slot="message">
                        <unnnic-progress-bar
                          :value="33"
                          :title="$t('webapp.translate.translate_progress')"
                          inline
                        />
                      </div>
                    </unnnic-modal>
                  </div>
                  <translate-list
                    v-if="!translating"
                    tab="not_translated"
                    :repository-uuid="repository.uuid"
                    :query="query"
                    :from="repository.language"
                    :to="translate.to"
                    @listPhrase="updateTotal"
                    @onUpdateSelected="updateSelected"
                    @translated="examplesTranslated()"
                    @eventStep="dispatchClick()"
                    @isLoadingContent="loadingList = $event"/>
                </div>
              </div>

              <div v-show="!!translate.to && totalItems.total > 0">
                <hr>

                <div class="translate-description">
                  <h1>{{ $t('webapp.translate.title_export') }}</h1>
                  <p>{{ $t('webapp.translate.subtitle_export') }}</p>
                </div>

                <div
                  id="tour-translate-step-6"
                  :is-previous-disabled="true"
                  class="repository-translate__translateButtons">

                  <unnnic-button
                    type="secondary"
                    class="mr-4"
                    @click="checkLanguageToImport()">
                    {{ $t('webapp.translate.import_button') }}
                  </unnnic-button>

                  <unnnic-button
                    type="secondary"
                    @click="checkLanguageToExport()">
                    {{ $t('webapp.translate.export_button') }}
                  </unnnic-button>

                </div>
              </div>

            </template>
            <template slot="tab-head-translated">
              {{ $tc("webapp.translate.tab_translated", 0) }}
            </template>
            <template slot="tab-panel-translated">
              <div class="repository-translate">
              </div>
              <div v-if="!!translate.to">
                <div class="repository-translate__list">
                  <div v-if="hasExamplesUntrained.length > 0" class="repository-translate__header">
                    <div class="translate-description">
                      <unnnic-icon-svg
                        class="mr-2"
                        icon="alert-circle-1"
                        size="sm"
                        scheme="feedback-yellow"
                      />
                      <h1>
                        {{$tc('webapp.translate.examples_untrained', hasExamplesUntrained.length)}}
                      </h1>
                    </div>
                    <div class="repository-translate__header__buttons">
                        <unnnic-button
                          type="secondary"
                          @click="goToTraining()"
                        >
                          {{ $t('webapp.phrase-suggestion.go_to_training') }}
                        </unnnic-button>
                    </div>
                  </div>
                  <div
                    class="repository-translate__list__search"
                  >
                    <sentence-filters
                      :intents="repository.intents_list"
                      :entities="repository.entities"
                      @querystringformatted="onSearch($event)"/>
                  </div>
                  <translations-list
                    tab="translated"
                    v-if="!translating"
                    :repository-uuid="repository.uuid"
                    :query="query"
                    :from="repository.language"
                    :repository="repository"
                    :to-language="translate.to"
                    @listPhrase="updateTotal"
                    @exampleUpdated="exampleUpdated()"
                    @translated="examplesTranslated()"
                    @eventStep="dispatchClick()"
                    @isLoadingContent="loadingList = $event"/>
                </div>
              </div>

            </template>
          </unnnic-tab>
        </div>
        <authorization-request-notification
          v-else
          :available="!repository.available_request_authorization"
          :repository-uuid="repository.uuid"
          @onAuthorizationRequested="updateRepository(false)" />
      </div>
      <div v-else>
        <b-notification
          :closable="false"
          class="is-info"
          role="alert">
          {{ $t('webapp.translate.login') }}
        </b-notification>
        <login-form hide-forgot-password />
      </div>
    </div>
    <translate-token-modal
      v-if="repository"
      :open.sync="tokenModalOpen"
      :language="translate.to"
      :url-generator="externalUrlGenerator"
      :repository-uuid="repository.uuid" />
    <tour
      v-if="activeTutorial === 'translate'"
      :step-count="1"
      :next-event="eventClick"
      :finish-event="eventClickFinish"
      name="translate" />
      <template v-slot:loader>
        <translate-loader />
      </template>
  </repository-view-base>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import LanguageSelectInput from '@/components/inputs/LanguageSelectInput';
import LoginForm from '@/components/auth/LoginForm';
import FilterExamples from '@/components/repository/repository-evaluate/example/FilterEvaluateExample';
import AuthorizationRequestNotification from '@/components/repository/AuthorizationRequestNotification';
import TranslationSentenceStatus from '@/components/translate/TranslationSentenceStatus';
import AutoTranslate from '@/components/translate/AutoTranslate';
import Train from '@/components/repository/training/Train';
import Loading from '@/components/shared/Loading';
import TranslateTokenModal from '@/components/translate/TranslateTokenModal';
import TranslateList from '@/components/translate/TranslateList';
import Tour from '@/components/Tour';
import {
  languageListToDict,
} from '@/utils/index';
import RepositoryBase from './Base';
import SentenceFilters from '@/components/repository/repository-evaluate/example/SentenceFilters';
import TranslationsList from '@/components/translate/TranslationsList';
import TranslateLoader from '@/views/repository/loadings/Translate';
import * as XLSX from 'xlsx-with-styles';


export default {
  name: 'RepositoryTranslate',
  components: {
    FilterExamples,
    RepositoryViewBase,
    LanguageSelectInput,
    Train,
    LoginForm,
    AuthorizationRequestNotification,
    TranslationSentenceStatus,
    Tour,
    AutoTranslate,
    Loading,
    TranslateTokenModal,
    TranslateList,
    SentenceFilters,
    TranslationsList,
    TranslateLoader
  },
  extends: RepositoryBase,
  data() {
    return {
      update: null,
      translationFile: [],
      isExportFileVisible: false,
      isImportFileVisible: false,
      waitDownloadFile: false,
      translate: {
        to: this.$route.params.language,
        update: false,
      },
      toLanguage: null,
      querySchema: {},
      errors: '',
      errorMessage: '',
      eventClick: false,
      eventClickFinish: false,
      loadingList: true,
      hasPhrases: false,
      allTranslations: '',
      exportOption: [
        { id: 0, label: this.$t('webapp.translate.export_all_sentences'), value: 'false' },
        { id: 1, label: this.$t('webapp.translate.export_only_translated'), value: 'true' },
      ],
      query: {},
      sentenceFilter: { key: null, query: null },
      translating: false,
      tokenModalOpen: false,
      languageName: this.$route.params.name,
      activeTab: 'not_translated',
      openTranslateModal: false,
      selectedItems: [],
      totalItems: [],
    };
  },
  computed: {
    ...mapGetters([
      'authenticated',
      'activeTutorial',
      'getSelectedVersion',
      'getRequirements',
    ]),
    baseLanguage() {
      const languageObject = Object.keys(
        languageListToDict([this.repository.language]),
      );
      return languageObject;
    },
    hasExamplesUntrained() {
      return this.totalItems?.items?.filter(item => item.is_trained === false) || []
    }
  },
  watch: {
    isImportFileVisible() {
      if (this.isImportFileVisible === false) {
        this.errorMessage = '';
        return this.removeSelectedFile();
      }
      return '';
    },
    sentenceFilter() {
      this.updateQuery();
    },
    querySchema() {
      this.updateQuery();
    },
    activeTab(tab) {
      if (tab === 'translated') {
        this.sentenceFilter = {
          key: tab,
          query: {
            has_translation_to: this.$route.params.language,
            language: this.$route.params.baseLanguage
          }
        }
      } else {
        this.sentenceFilter = {
          key: tab,
          query: {
            has_not_translation_to: this.$route.params.language,
            language: this.$route.params.baseLanguage
          }
        }
      }
    },
  },
  mounted() {
    this.sentenceFilter = {
      key: 'not_translated',
      query: {
        has_not_translation_to: this.$route.params.language,
        language: this.$route.params.baseLanguage
      }
    };
    this.translate.to = this.$route.params.language
  },
  methods: {
    ...mapActions([
      'getRepository',
      'exportTranslations',
      'importTranslations',
      'createExternalToken',
      'autoTranslate',
      'autoTranslateExternal',
      'getAutoTranslateProgress',
      'searchExamples'
    ]),
    updateTrainingStatus(trainStatus) {
      Object.assign(this.repository, trainStatus);
    },
    async exportTranslation() {
      this.waitDownloadFile = !this.waitDownloadFile;
      try {
        const { data } = await this.exportTranslations({
          repositoryUuid: this.repository.uuid,
          versionUUID: this.getSelectedVersion,
          fromLanguage: this.repository.language,
          toLanguagem: this.translate.to,
          statusTranslation: !this.allTranslations,
        });

        const workbook = XLSX.utils.book_new();

        const json = [];

        const style = {
          fill: {
            patternType: 'solid',
            fgColor: { rgb: '01D1D5' },
          },
          font: {
            bold: true,
            color: { rgb: '28464D' },
          },
        };

        json.push([]);

        json.push([{ v: 'Entities', s: style }]);

        data.data.entities.forEach((entity) => {
          json.push([entity]);
        });

        json.push([]);

        json.push([
          null,
          null,
          'To define which entity in a sentence to use square brackets to isolate the word and then use parentheses to identify the entity',
        ]);
        json.push([null, null, 'Example: good [word](entity)']);

        json.push([]);
        json.push([]);
        json.push([]);
        json.push([]);
        json.push([]);

        json.push(['Translation']);

        json.push([
          { v: 'ID', s: style },
          { v: 'Repository Version', s: style },
          { v: 'Language', s: style },
          { v: 'Original Text', s: style },
          { v: 'Translate', s: style },
          { v: 'Translation Error', s: style },
        ]);

        data.data.translations.forEach((translation) => {
          json.push([
            translation.id,
            translation.repository_version,
            translation.language,
            translation.original_text,
            translation.translate,
            translation.translation_error,
          ]);
        });

        const worksheet = XLSX.utils.json_to_sheet(json, { skipHeader: true, origin: 'B2' });

        const logoWeniBase64 = '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';

        worksheet['!images'] = [{
          name: 'image.png',
          data: logoWeniBase64,
          opts: { base64: true },
          type: 'png',
          position: {
            type: 'twoCellAnchor',
            attrs: { editAs: 'oneCell' },
            from: { col: 1, row: 1 },
            to: { col: 2, row: 2 }
          }
        }];

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Translate');

        XLSX.writeFile(workbook, 'Weni Artificial Intelligence.xlsx');

        this.$buefy.toast.open({
          message: 'Downloading File',
          type: 'success',
        });
      } catch (error) {
        this.errors = error;
      }
      this.waitDownloadFile = !this.waitDownloadFile;
      return false;
    },
    async importTranslation() {
      this.waitDownloadFile = !this.waitDownloadFile;
      const formData = new FormData();
      formData.append('file', this.translationFile);
      formData.append('language', this.translate.to);

      try {
        const importDownload = await this.importTranslations({
          repositoryUuid: this.repository.uuid,
          versionUUID: this.getSelectedVersion,
          formData,
        });
        this.forceFileDownload(importDownload);
      } catch (error) {
        this.errorMessage = this.$t('webapp.translate.import_select_error');
      }
      this.waitDownloadFile = !this.waitDownloadFile;
      this.translationFile = [];
      return false;
    },
    dispatchClick() {
      this.eventClick = !this.eventClick;
    },
    dispatchFinish() {
      this.eventClickFinish = !this.eventClickFinish;
    },
    forceFileDownload(response) {
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const result = document.createElement('a');
      result.href = window.URL.createObjectURL(blob);
      result.download = 'bothub.xlsx';
      result.click();
    },
    checkLanguageToImport() {
      if (this.translate.to) {
        if (this.activeTutorial === 'translate') {
          return;
        }
        this.isImportFileVisible = true;
      }
    },
    checkLanguageToExport() {
      if (this.translate.to) {
        if (this.activeTutorial === 'translate') {
          return;
        }
        this.isExportFileVisible = true;
      }
    },
    removeSelectedFile() {
      this.translationFile = [];
    },
    examplesTranslated() {
      this.translate.update = !this.translate.update;
      if (this.update) clearTimeout(this.update);
      this.update = setTimeout(() => { this.$refs.train.updateTrainingStatus(); }, 2000);
    },
    async checkPhraseList(list) {
      if (this.activeTutorial === 'translate') {
        const checkList = await list.getAllItems();
        if (checkList.length === 0) {
          this.hasPhrases = false;
          return;
        }
        this.hasPhrases = true;
      }
    },
    closeImportModal() {
      this.isImportFileVisible = false;
      this.errorMessage = '';
      this.removeSelectedFile();
    },
    closeExportModal() {
      this.isExportFileVisible = false;
    },
    onFilter({ key, query }) {
      this.sentenceFilter = { key, query };
    },
    onSearch(value) {
      this.querySchema = { ...value };
    },
    updateQuery() {
      if (!this.querySchema.intent) {
        delete this.querySchema.intent;
      }
      if (!this.querySchema.entity) {
        delete this.querySchema.entity;
      }
      if (!this.querySchema.search) {
        delete this.querySchema.search;
      }
      this.query = { ...this.querySchema, ...this.sentenceFilter.query };
    },
    externalUrlGenerator(token) {
      const route = this.$router.resolve({
        name: 'repository-translate-external',
        params: {
          ownerNickname: this.repository.owner__nickname,
          slug: this.repository.slug,
          token,
        },
      }).href;
      return `${window.location.origin}${route}`;
    },
    goToTranslationStatus() {
      this.$router.push({
        name: 'repository-translations-status',
        params: {
          ownerNickname: this.repository.owner__nickname,
          slug: this.repository.slug,
        }
      })
    },
    async sendAutoTranslate() {
      try {
        await this.autoTranslateAction();
      } catch (e) {
        this.$buefy.toast.open({
          message: this.$t(e.response.status === 500 ? 'webapp.translate.unsupported' : 'webapp.settings.default_error'),
          type: 'is-danger',
        });
        return;
      }
      this.translating = true
      await this.checkProgress(true);
    },
    async checkProgress(inProgress = false) {
      const { data } = await this.getAutoTranslateProgress({
        repositoryUUID: this.repository.uuid,
        repositoryVersion: this.getSelectedVersion,
      });

      const [translateStatus] = data.results;

      if (!translateStatus) {
        return;
      }

      if (translateStatus.status === 2) {
        if (inProgress) this.translating = false;
      }
      setTimeout(() => {
        if (translateStatus.status === 0
          || translateStatus.status === 1) {
          this.checkProgress(true);
        }
      }, 60000);
    },
    autoTranslateAction() {
      if (this.externalToken) return this.autoTranslateExternal({ token: this.externalToken });
      return this.autoTranslate({
        repositoryUUID: this.repository.uuid,
        repositoryVersion: this.getSelectedVersion,
        targetLanguage: this.translate.to,
        items: this.selectedItems.map(e => e.id)
      });
    },
    updateSelected(params) {
      this.selectedItems = params
    },
    updateTotal(params) {
      this.totalItems = params
    },
    goToTraining() {
      this.$router.push({
        name: 'repository-training',
        params: {
          ownerNickname: this.repository.owner__nickname,
          slug: this.repository.slug,
        }
      })
    },
  },
};
</script>

<style lang="scss">
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

hr {
    background: #E2E6ED;
    height: 1px;
    margin: 2rem 0;
  }

.repository-translate {
  background-color: $color-white;
  display:flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  font-family: 'Lato';

  &__train {
    margin: 0 0 2.5rem 0;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #E2E6ED;
    border-radius: 8px;
    padding: 24px;
    margin: 1rem 0 2rem;;

    &__button {
      margin-left: 0.5rem;
    }

    &__buttons {
      display: flex;
    }

    .translate-description{
      h1{
        font-size: 16px;
        margin-bottom: 0;
        color: #4E5666;
        font-family: 'Lato';
        font-weight: 400;
      }
      p{
        margin-bottom: 0;
        color: #67738B;
        font-family: 'Lato';
        font-size: 14px;
      }
    }
  }

  &__field {
    display: flex;
    justify-content: space-between;
    width: 100%;
    &__item {
      margin: 0.5rem 0;
      width: 45%;
        &__label{
        font-weight: $font-weight-normal;
        }
    }
  }

  &__translate-arrow-icon {
    align-self: center;
    color: $color-grey-dark;
  }
  &__list{
    &__search {
      &__status {
        margin: 3rem 0 4.4rem 0;
      }
    }
    .repository-translate__header {
      background: #F9F9F9;

      .translate-description {
        display: flex;
        align-items: center;
      }
      .translate-description h1 {
        font-weight: 700;
      }
    }
  }

  &__requestAuthorization{
        color: $color-fake-black;
        font-weight: $font-weight-medium;
        text-align: center;
        float: right
  }

&__selection{

    &__section{
      display: flex;
      justify-content: space-around;
      width: 100%;
      margin: auto;
      align-items: center;

      p{
        margin-left: 1rem;
      }

      &__expanded{
        width: 22rem;
      }
    }
}
&__modalStyle{
  width: 26.5rem;
  &__styleButton{
    width:100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .modalButton {
      cursor: pointer;
      border: 1px solid #dbdbdb;
      text-align: center;
      border-radius: 4px;
      box-shadow: none;
      font-weight: bold;

      &:hover{
        border: 1px solid #c2c2c2;
      }
    }
  }
}

  &__buttons{
    width: 179px;
    height: 40px;
    margin: 0.5rem;
    font-family: 'Lato';
    font-size: $font-size;
    font-weight: $font-weight-bolder;
    box-shadow: 0px 3px 6px #00000029;
    border-radius: 6px;
    background-color: $color-primary;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__unableButton{
    background-color:$color-grey;
    color: $color-white;
    border: 2px solid #D5D5D5;
    box-shadow: 0 0.1875rem 0.375rem rgba(200, 200, 200, 0.5);
    margin:0;

     &:hover{
      color: $color-white;
      border: 2px solid #D5D5D5;
      cursor:default
    }
    &:focus{
      color: $color-white;
      border: 2px solid #D5D5D5;
      cursor:default
    }
  }

  &__progress {
    height: 25px;
    width: 60%;
    p {
      font-size: 13px;
      font-weight: $font-weight-bolder;
    }
     .unnnic-modal-container-background {
      height: 88px;
    }
     .unnnic-modal-container-background-body {
      padding: 0
    }
     .unnnic-modal-container-background-body-title {
      padding: 0
    }
     .unnnic-modal-container-background-body-spacing_header {
      display: none;
    }
     .unnnic-progress-bar.primary {
      padding: 2rem 1.5rem;
      white-space: nowrap;
    }
     .unnnic-modal {
      z-index: 1;
    }
  }
}

.translate-description{
  // margin-top: $between-subtitle-content;
  h1{
    font-size: 16px;
    margin-bottom: 1.5rem;
    color: #4E5666;
    font-family: 'Lato';
    font-weight: 400;
  }
  p{
    margin-bottom: 1.5rem;
    color: #4E5666;
    font-family: 'Lato';
    font-size: 14px;
  }
}

.custom-file-upload {
  display: flex;
  flex-direction: column;

  &__input{
   display: flex;
   width: 100%;

   &__button{
     background-color: #9E9E9E;
     padding: 0 2rem;
   }

   &__file{
     border: 1px solid #D5D5D5;
     color: #BABABA;
     font-size: $font-size;
     font-family: 'Lato';
     display: flex;
     width: 100%;
     justify-content:center;
     align-items:center;
     border-top-right-radius: 0.4rem;
     border-bottom-right-radius: 0.4rem;

     span{
       font-size: 1rem;
     }
   }
   &__icon{
     cursor: pointer;
     color:#D5D5D5;
     display:flex;
     align-items: center;
     &:hover{
      color: $color-grey-dark;
    }
   }
  }

}
.languageTitle {
  display: flex;
  margin-bottom: 2rem;

  h1 {
    font-family: "Aleo";
    font-size: 20px;
    color: #272b33;
  }

  &__back-button {
    cursor: pointer;
    margin-right: 1rem;
  }
}

.unnnic-select {
  .input {
    height: 46px;
  }
  .dropdown {
    display: block;
  }
}
.importModal {
  .unnnic-modal-container-background-body {
    padding: 0
  }
  .unnnic-modal-container-background-body-title {
    padding: 0
  }
  .unnnic-modal-container-background-body-spacing_header {
    display: none;
  }
  .unnnic-modal-container-background-body-description {
    padding-bottom: 0;
  }
  .footer {
    padding: 1rem;
  }
}
.select-translation {
  .unnnic-form__label {
    text-align: left;
  }
}
</style>
