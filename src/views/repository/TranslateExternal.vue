<template>
  <RepositoryViewBase
    v-if="repository"
    :repository="repository"
    :quickTest="false"
    :errorCode="errorCode"
  >
    <div class="translate-description">
      <h1>{{ $t('webapp.translate.title_translate') }}</h1>
      <p>{{ $t('webapp.translate.subtitle_translate') }}</p>
    </div>
    <div class="repository-translate__list">
      <div class="repository-translate__list__search">
        <AutoTranslate
          :externalToken="token"
          :repositoryUuid="repository.uuid"
          :translateTo="repository.target_language"
          :version="repository.repository_version_id"
          @onTranslate="translating = true"
          @onTranslateComplete="translating = false"
        />
        <TranslationSentenceStatus
          :key="`${translateUpdate}-${translating}`"
          :externalToken="token"
          :toLanguage="repository.target_language"
          :initialData="sentenceFilter.key"
          class="repository-translate__list__search__status"
          @search="onFilter"
        />
        <FilterExamples
          :intents="repository.intents_list"
          :entities="repository.entities"
          @querystringformatted="onSearch($event)"
        />
      </div>
      <div
        v-if="translating"
        class="has-text-centered"
      >
        <Loading />
        <span> {{ $t('webapp.translate.auto_translate_progress') }} </span>
      </div>
      <TranslateList
        v-else
        :externalToken="token"
        :query="query"
        @translated="examplesTranslated()"
        @isLoadingContent="loadingList = $event"
      />
    </div>
  </RepositoryViewBase>
</template>

<script>
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import TranslateList from '@/components/translate/TranslateList';
import FilterExamples from '@/components/repository/repository-evaluate/example/FilterEvaluateExample';
import TranslationSentenceStatus from '@/components/translate/TranslationSentenceStatus';
import AutoTranslate from '@/components/translate/AutoTranslate';
import ExternalRepository from '@/models/externalRepository';
import Loading from '@/components/shared/Loading';
import { mapActions } from 'vuex';

export default {
  name: 'RepositoryTranslateExternal',
  components: {
    FilterExamples,
    RepositoryViewBase,
    TranslateList,
    TranslationSentenceStatus,
    AutoTranslate,
    Loading,
  },
  data() {
    return {
      translateUpdate: false,
      querySchema: {},
      errors: '',
      errorMessage: '',
      eventClick: false,
      eventClickFinish: false,
      loadingList: true,
      hasPhrases: false,
      allTranslations: false,
      query: {},
      sentenceFilter: { key: null, query: null },
      repository: null,
      errorCode: null,
      translating: false,
    };
  },
  computed: {
    token() {
      return this.$route.params.token;
    },
  },
  watch: {
    querySchema() {
      this.updateQuery();
    },
    sentenceFilter() {
      this.updateQuery();
    },
  },
  async mounted() {
    const { ownerNickname, slug, token } = this.$route.params;

    if (!ownerNickname || !slug) {
      this.repository = null;
      return this.repository;
    }

    this.repository = new ExternalRepository({
      token,
      owner: { nickname: ownerNickname },
      slug,
    });

    this.repository.on('fetch', this.onReady);

    await this.repository.fetch();
    return this.repository;
  },
  methods: {
    ...mapActions(['getExternalInfo']),
    examplesTranslated() {
      this.translateUpdate = !this.translateUpdate;
    },
    onSearch(value) {
      this.querySchema = { ...value };
    },
    onFilter({ key, query }) {
      this.sentenceFilter = { key, query };
    },
    onReady({ error }) {
      if (error) {
        const {
          response: { response },
        } = error;
        if (response) {
          const { status } = response;
          this.errorCode = status;
        }
      }
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
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/colors.scss';
@import '@/assets/scss/variables.scss';

.repository-translate {
  background-color: $color-white;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;

  &__list {
    &__search {
      &__status {
        margin: 3rem 0 4.4rem 0;
      }
    }
  }
}

// .translate-description{
//   margin-top: $between-subtitle-content;
//   h1{
//     font-size: 28px;
//     margin-bottom: $between-title-subtitle;
//     color: $color-fake-black;
//     font-family: $font-family;
//     font-weight: $font-weight-bolder;
//   }
//   p{
//     margin-bottom: $between-subtitle-content;
//     color: $color-fake-black;
//     font-family: $font-family;
//     font-size: $font-size
//   }
// }
</style>
