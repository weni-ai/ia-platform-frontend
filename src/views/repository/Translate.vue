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
                <!-- <div class="repository-translate__field">
                  <div class="repository-translate__field__item">
                    <b-field
                      :label="$t('webapp.translate.translate_from')"
                      custom-class="repository-translate__field__item__label">
                      <b-field
                        id="tour-translate-step-1"
                        :is-previous-disabled="true">
                        <b-input
                          :placeholder="baseLanguage"
                          disabled/>
                      </b-field>
                    </b-field>
                  </div>
                  <div class="repository-translate__translate-arrow-icon">
                    <div class="field">
                      <label class="label">&nbsp;</label>
                      <b-icon
                        icon="chevron-right"
                        size="is-medium" />
                    </div>
                  </div>
                  <div class="repository-translate__field__item">
                    <b-field
                      :label="$t('webapp.translate.translate_to')"
                      custom-class="repository-translate__field__item__label">
                      <b-field
                        id="tour-translate-step-2"
                        :is-step-blocked="(translate.to === null || loadingList) || !hasPhrases">
                        <language-select-input
                          :exclude="[repository.language]"
                          :placeholder="$t('webapp.translate.languages_select')"
                          v-model="translate.to" />
                      </b-field>
                    </b-field>
                  </div>
                </div> -->
              </div>
              <div class="repository-translate__header">
                <div class="translate-description">
                  <h1>{{ $t('webapp.translate.select_sentences_title') }}</h1>
                  <p>{{ $t('webapp.translate.select_sentences_subtitle',
                    {selected: 0, total: 0}) }}
                  </p>
                </div>
                <div class="repository-translate__header__buttons">
                  <!-- <auto-translate
                    v-if="repository && repository.authorization.can_translate"
                    :version="getSelectedVersion"
                    :translate-to="translate.to"
                    :repository-uuid="repository.uuid"
                    @onTranslate="translating = true"
                    @onTranslateComplete="translating = false" />
                  <b-button
                    :disabled="!(repository && translate.to)"
                    :label="$t('webapp.translate.send_to_translators')"
                    class="repository-translate__header__button"
                    type="is-primary"
                    @click="tokenModalOpen = true" /> -->
                    <unnnic-button
                      type="secondary"
                      @click="openTranslateModal = true"
                    >
                      {{ $t('webapp.translate.translate_sentences') }}
                    </unnnic-button>
                </div>
              </div>
              <div v-if="!!translate.to">
                <b-modal
                  :active.sync="isImportFileVisible"
                  :destroy-on-hide="false"
                  :can-cancel="false"
                  has-modal-card
                  trap-focus
                  aria-role="dialog"
                  aria-modal>
                  <div
                    class="modal-card repository-translate__modalStyle">
                    <header class="modal-card-head">
                      <p class="modal-card-title">{{ $t('webapp.translate.import_title') }}</p>
                    </header>
                    <section class="modal-card-body">
                      <b-field
                        class="custom-file-upload">
                        <div class="custom-file-upload__input">
                          <b-upload
                            v-model="translationFile"
                          >
                            <a class="button custom-file-upload__input__button">
                              <b-icon
                                icon="upload"
                                type="is-white"/>
                            </a>
                          </b-upload>

                          <div
                            v-if="translationFile"
                            class="custom-file-upload__input__file">
                            {{ translationFile.name }}

                            <div
                              class="custom-file-upload__input__icon"
                              @click="removeSelectedFile">
                              <b-icon
                                icon="close-circle"
                                custom-size="mdi-18px"
                              />
                            </div>
                          </div>

                          <div
                            v-else
                            class="custom-file-upload__input__file">
                            <span>{{ $t('webapp.translate.import_field_text') }}</span>
                          </div>
                        </div>
                        <p>{{ errorMessage }}</p>

                      </b-field>
                    </section>
                    <footer class="modal-card-foot">
                      <div class="repository-translate__modalStyle__styleButton">
                        <b-button
                          class="modalButton"
                          type="is-white"
                          @click="closeImportModal()">
                          {{ $t('webapp.translate.import_button_cancel') }}
                        </b-button>

                        <b-button
                          :loading="waitDownloadFile"
                          :disabled="translationFile === null"
                          class="modalButton"
                          type="is-primary"
                          @click="importTranslation()">
                          {{ $t('webapp.translate.import_button') }}
                        </b-button>
                      </div>
                    </footer>
                  </div>
                </b-modal>

                <b-modal
                  :active.sync="isExportFileVisible"
                  :destroy-on-hide="false"
                  :can-cancel="false"
                  has-modal-card
                  trap-focus
                  aria-role="dialog"
                  aria-modal>
                  <div
                    class="modal-card repository-translate__modalStyle">
                    <header class="modal-card-head">
                      <p class="modal-card-title">{{ $t('webapp.translate.export_title') }}</p>
                    </header>
                    <section class="modal-card-body">
                      <div class="repository-translate__selection__section">
                        <b-field>
                          <b-select
                            v-model="allTranslations"
                            expanded
                            size="is-medium"
                            class="repository-translate__selection__section__expanded"
                            placeholder="Select a name">
                            <option
                              v-for="option in exportOption"
                              :value="option.value"
                              :key="option.id">
                              {{ option.label }}
                            </option>
                          </b-select>
                        </b-field>
                      </div>
                    </section>

                    <footer class="modal-card-foot">
                      <div class="repository-translate__modalStyle__styleButton">
                        <b-button
                          class="modalButton"
                          type="is-white"
                          @click="closeExportModal()">
                          {{ $t('webapp.translate.import_button_cancel') }}
                        </b-button>
                        <b-button
                          :loading="waitDownloadFile"
                          type="is-primary"
                          class="modalButton"
                          @click="exportTranslation()">
                          {{ $t('webapp.translate.export_button') }}
                        </b-button>
                      </div>
                    </footer>
                  </div>
                </b-modal>
                <div class="repository-translate__list">
                  <div class="repository-translate__list__search">
                    <!-- <translation-sentence-status
                      :key="`${translate.from}-${translate.to}-${translate.update}-${translating}`"
                      :repository-uuid="repository.uuid"
                      :version="getSelectedVersion"
                      :language="repository.language"
                      :to-language="translate.to"
                      :initial-data="sentenceFilter.key"
                      :translate-status="translating"
                      class="repository-translate__list__search__status"
                      @search="onFilter"/> -->
                    <sentence-filters
                      :intents="repository.intents_list"
                      :entities="repository.entities"
                      @querystringformatted="onSearch($event)"/>
                  </div>
                  <div
                    v-if="translating"
                    class="has-text-centered">
                    <loading />
                    <span> {{ $t('webapp.translate.auto_translate_progress') }} </span>
                  </div>
                  <translate-list
                    v-if="!translating"
                    :repository-uuid="repository.uuid"
                    :query="query"
                    :from="repository.language"
                    :to="translate.to"
                    @translated="examplesTranslated()"
                    @eventStep="dispatchClick()"
                    @isLoadingContent="loadingList = $event"/>
                </div>
              </div>

              <div v-show="!!translate.to">
                <!-- <train
                  ref="train"
                  :key="update"
                  :show-button="getRequirements.ready_for_train"
                  :repository="repository"
                  :version="getSelectedVersion"
                  :authenticated="authenticated"
                  :update-on-load="false"
                  class="repository-translate__train"
                  @statusUpdated="updateTrainingStatus($event)" /> -->
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
                    {{ $t('webapp.translate.import_title') }}
                  </unnnic-button>

                  <unnnic-button
                    type="secondary"
                    @click="checkLanguageToExport()">
                    {{ $t('webapp.translate.export_title') }}
                  </unnnic-button>

                </div>
              </div>

            </template>
            <template slot="tab-head-translated">
              {{ $tc("webapp.translate.tab_translated", 0) }}
            </template>
            <template slot="tab-panel-translated">
              <div class="repository-translate">
                <!-- <div class="repository-translate__field">
                  <div class="repository-translate__field__item">
                    <b-field
                      :label="$t('webapp.translate.translate_from')"
                      custom-class="repository-translate__field__item__label">
                      <b-field
                        id="tour-translate-step-1"
                        :is-previous-disabled="true">
                        <b-input
                          :placeholder="baseLanguage"
                          disabled/>
                      </b-field>
                    </b-field>
                  </div>
                  <div class="repository-translate__translate-arrow-icon">
                    <div class="field">
                      <label class="label">&nbsp;</label>
                      <b-icon
                        icon="chevron-right"
                        size="is-medium" />
                    </div>
                  </div>
                  <div class="repository-translate__field__item">
                    <b-field
                      :label="$t('webapp.translate.translate_to')"
                      custom-class="repository-translate__field__item__label">
                      <b-field
                        id="tour-translate-step-2"
                        :is-step-blocked="(translate.to === null || loadingList) || !hasPhrases">
                        <language-select-input
                          :exclude="[repository.language]"
                          :placeholder="$t('webapp.translate.languages_select')"
                          v-model="translate.to" />
                      </b-field>
                    </b-field>
                  </div>
                </div> -->
              </div>
              <div v-if="!!translate.to">
                <b-modal
                  :active.sync="isImportFileVisible"
                  :destroy-on-hide="false"
                  :can-cancel="false"
                  has-modal-card
                  trap-focus
                  aria-role="dialog"
                  aria-modal>
                  <div
                    class="modal-card repository-translate__modalStyle">
                    <header class="modal-card-head">
                      <p class="modal-card-title">{{ $t('webapp.translate.import_title') }}</p>
                    </header>
                    <section class="modal-card-body">
                      <b-field
                        class="custom-file-upload">
                        <div class="custom-file-upload__input">
                          <b-upload
                            v-model="translationFile"
                          >
                            <a class="button custom-file-upload__input__button">
                              <b-icon
                                icon="upload"
                                type="is-white"/>
                            </a>
                          </b-upload>

                          <div
                            v-if="translationFile"
                            class="custom-file-upload__input__file">
                            {{ translationFile.name }}

                            <div
                              class="custom-file-upload__input__icon"
                              @click="removeSelectedFile">
                              <b-icon
                                icon="close-circle"
                                custom-size="mdi-18px"
                              />
                            </div>
                          </div>

                          <div
                            v-else
                            class="custom-file-upload__input__file">
                            <span>{{ $t('webapp.translate.import_field_text') }}</span>
                          </div>
                        </div>
                        <p>{{ errorMessage }}</p>

                      </b-field>
                    </section>
                    <footer class="modal-card-foot">
                      <div class="repository-translate__modalStyle__styleButton">
                        <b-button
                          class="modalButton"
                          type="is-white"
                          @click="closeImportModal()">
                          {{ $t('webapp.translate.import_button_cancel') }}
                        </b-button>

                        <b-button
                          :loading="waitDownloadFile"
                          :disabled="translationFile === null"
                          class="modalButton"
                          type="is-primary"
                          @click="importTranslation()">
                          {{ $t('webapp.translate.import_button') }}
                        </b-button>
                      </div>
                    </footer>
                  </div>
                </b-modal>

                <b-modal
                  :active.sync="isExportFileVisible"
                  :destroy-on-hide="false"
                  :can-cancel="false"
                  has-modal-card
                  trap-focus
                  aria-role="dialog"
                  aria-modal>
                  <div
                    class="modal-card repository-translate__modalStyle">
                    <header class="modal-card-head">
                      <p class="modal-card-title">{{ $t('webapp.translate.export_title') }}</p>
                    </header>
                    <section class="modal-card-body">
                      <div class="repository-translate__selection__section">
                        <b-field>
                          <b-select
                            v-model="allTranslations"
                            expanded
                            size="is-medium"
                            class="repository-translate__selection__section__expanded"
                            placeholder="Select a name">
                            <option
                              v-for="option in exportOption"
                              :value="option.value"
                              :key="option.id">
                              {{ option.label }}
                            </option>
                          </b-select>
                        </b-field>
                      </div>
                    </section>

                    <footer class="modal-card-foot">
                      <div class="repository-translate__modalStyle__styleButton">
                        <b-button
                          class="modalButton"
                          type="is-white"
                          @click="closeExportModal()">
                          {{ $t('webapp.translate.import_button_cancel') }}
                        </b-button>
                        <b-button
                          :loading="waitDownloadFile"
                          type="is-primary"
                          class="modalButton"
                          @click="exportTranslation()">
                          {{ $t('webapp.translate.export_button') }}
                        </b-button>
                      </div>
                    </footer>
                  </div>
                </b-modal>
                <div class="repository-translate__list">
                  <div class="repository-translate__list__search">
                    <!-- <translation-sentence-status
                      :key="`${translate.from}-${translate.to}-${translate.update}-${translating}`"
                      :repository-uuid="repository.uuid"
                      :version="getSelectedVersion"
                      :language="repository.language"
                      :to-language="translate.to"
                      :initial-data="sentenceFilter.key"
                      :translate-status="translating"
                      class="repository-translate__list__search__status"
                      @search="onFilter"/> -->
                    <sentence-filters
                      :intents="repository.intents_list"
                      :entities="repository.entities"
                      @querystringformatted="onSearch($event)"/>
                  </div>
                  <div
                    v-if="translating"
                    class="has-text-centered">
                    <loading />
                    <span> {{ $t('webapp.translate.auto_translate_progress') }} </span>
                  </div>
                  <translate-list
                    v-if="!translating"
                    :repository-uuid="repository.uuid"
                    :query="query"
                    :from="repository.language"
                    :to="translate.to"
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
      <unnnic-modal-next
        v-if="openTranslateModal"
        type="alert"
        :title="$t('webapp.translate.translate_sentences')"
        :actionPrimaryLabel="$t('webapp.translate.button_create_modal')"
        :actionSecondaryLabel="$t('webapp.home.cancel')"
        @click-action-secondary="openTranslateModal = false"
        @click-action-primary="selectMethod(methodSelected)"
        actionPrimaryButtonType="secondary"
      >
        <template slot="description">
          {{ $t('webapp.translate.select_method') }}
          <unnnic-select
            :label="$t('webapp.translate.select_language_label')"
            v-model="methodSelected"
            class="select-add-modal"
          >
            <option
              v-for="option in ['Tradução automática', 'Enviar para tradutores']"
              :key="option"
              :value="option"
              @select="methodSelected = option"
            >
              {{ option }}
            </option>
          </unnnic-select>
        </template>
      </unnnic-modal-next>
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
  },
  extends: RepositoryBase,
  data() {
    return {
      update: null,
      translationFile: null,
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
      allTranslations: false,
      exportOption: [
        { id: 0, label: this.$t('webapp.translate.export_all_sentences'), value: false },
        { id: 1, label: this.$t('webapp.translate.export_only_translated'), value: true },
      ],
      query: {},
      sentenceFilter: { key: null, query: null },
      translating: false,
      tokenModalOpen: false,
      languageName: this.$route.params.name,
      activeTab: 'not_translated',
      openTranslateModal: false,
      methodSelected: ''
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
      const languageObject = Object.values(
        languageListToDict([this.repository.language]),
      );
      return languageObject;
    },
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
    }
  },
  mounted() {
    this.translate.to = this.$route.params.language
    this.sentenceFilter = {
      key: 'not_translated',
      query: {
        has_not_translation_to: this.$route.params.language,
        language: this.$route.params.baseLanguage
      }
    }
  },
  // updated() {
  //   this.sentenceFilter = {
  //     key: 'not_translated',
  //     query: {
  //       has_not_translation_to: 'de',
  //       language: 'en'
  //     }
  //   }
  // },
  methods: {
    ...mapActions([
      'getRepository',
      'exportTranslations',
      'importTranslations',
      'createExternalToken',
      'autoTranslate',
      'autoTranslateExternal',
      'getAutoTranslateProgress',
    ]),
    updateTrainingStatus(trainStatus) {
      Object.assign(this.repository, trainStatus);
    },
    async exportTranslation() {
      this.waitDownloadFile = !this.waitDownloadFile;
      try {
        const xlsFile = await this.exportTranslations({
          repositoryUuid: this.repository.uuid,
          versionUUID: this.getSelectedVersion,
          fromLanguage: this.repository.language,
          toLanguagem: this.translate.to,
          statusTranslation: !this.allTranslations,
        });
        this.forceFileDownload(xlsFile);
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
      this.translationFile = null;
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
      this.translationFile = null;
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
    selectMethod(method) {
      if (method === 'Tradução automática') {
        this.openTranslateModal = false
        this.sendAutoTranslate()
      } else {
        this.openTranslateModal = false
        this.tokenModalOpen = true
      }
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
      });
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
</style>
