<template>
  <RepositoryViewBase
    :repository="repository"
    :errorCode="errorCode"
  >
    <div
      v-if="authenticated"
      class="entity-list"
    >
      <div v-if="repository">
        <EntitiesList
          :entitiesList="examplesList"
          :repository="repository"
          :entityName.sync="entitySelected"
          @saveEdition="onItemSave()"
          :selectedItems="selectedItems"
          @itemDeleted="onItemDeleted()"
        />
        <div class="entity-list__divider" />
        <div class="entity-list__search">
          <UnnnicInput
            :placeholder="$t('webapp.intent.search_sentence')"
            iconLeft="search-1"
            v-model="searchSentence"
          />
          <div class="is-flex is-align-items-center">
            <span class="entity-list__results">{{
              $t('webapp.intent.sentences_perpage')
            }}</span>
            <UnnnicSelectSmart
              :value="optionsSelectSmart.value"
              :options="optionsSelectSmart.options"
              size="md"
              @input="selectedOption = $event[0].value"
            />
          </div>
        </div>
        <IntentPagination
          v-if="examplesList"
          :itemComponent="sentencesEntities"
          :list="examplesList"
          :repository="repository"
          :perPage="perPage"
          :addAttributes="{ entitySelected }"
          @itemDeleted="onItemDeleted()"
          @itemSave="onItemSave()"
          :showIntents="true"
          @onUpdateSelected="updateSelected"
        />
        <p
          v-if="examplesList && examplesList.empty"
          class="no-examples"
        >
          {{ $t('webapp.entity.no_sentences') }}
        </p>
      </div>
      <BNotification
        v-else
        :closable="false"
        class="repository-log__notification"
        type="is-warning"
      >
        {{ $t('webapp.evaluate.you_can_not_edit') }}
        <RequestAuthorizationModal
          v-if="repository"
          :open.sync="requestAuthorizationModalOpen"
          :available="!repository.available_request_authorization"
          :repositoryUuid="repository.uuid"
          @requestDispatched="onAuthorizationRequested()"
        />
        <a
          class="requestAuthorization"
          @click="openRequestAuthorizationModal"
        >
          {{ $t('webapp.layout.request_authorization') }}
        </a>
      </BNotification>
    </div>
    <div v-else>
      <BNotification
        :closable="false"
        class="is-info"
      >
        {{ $t('webapp.inbox.signin_you_account') }}
      </BNotification>
      <LoginForm hideForgotPassword />
    </div>
    <template v-slot:loader>
      <IntentLoader />
    </template>
  </RepositoryViewBase>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import LoginForm from '@/components/auth/LoginForm';
import EntitiesList from '@/components/repository/EntitiesList';
import PaginatedList from '@/components/shared/PaginatedList';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import SentencesEntityList from '@/components/repository/SentencesEntityList';
import SentencesIntentTable from '@/components/repository/SentencesIntentTable';
import RequestAuthorizationModal from '@/components/repository/RequestAuthorizationModal';
import Loading from '@/components/shared/Loading';
import RepositoryBase from './Base';
import IntentPagination from '@/components/shared/IntentPagination';
import IntentLoader from '@/views/repository/loadings/Intent';
import { useSelectSmart } from '../../utils';

export default {
  name: 'Entity',
  components: {
    RepositoryViewBase,
    LoginForm,
    RequestAuthorizationModal,
    PaginatedList,
    SentencesEntityList,
    EntitiesList,
    Loading,
    SentencesIntentTable,
    IntentPagination,
    IntentLoader,
  },
  extends: RepositoryBase,
  props: {
    perPage: {
      type: Number,
      default: 10,
    },
    update: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      name: 'Entity',
      examplesList: null,
      totalList: 0,
      entitySearch: {
        entity_id: this.$route.params.entity_id,
      },
      entitySelected: '',
      query: {},
      sentencesEntities: SentencesIntentTable,
      requestAuthorizationModalOpen: false,
      querySchema: {},
      selectedItems: [],
      options: [{ value: 10 }, { value: 25 }, { value: 50 }],
      selectedOption: `${this.perPage}`,
      searchSentence: '',
      timeout: null,
    };
  },
  computed: {
    ...mapGetters({
      repositoryVersion: 'getSelectedVersion',
      repositoryList: 'getCurrentRepository',
    }),

    choicesSelectSmart() {
      return useSelectSmart({
        from: this.options,
        value: 'value',
        label: 'value',
        placeholder: '',
        currentValue: this.selectedOption,
      });
    },
  },
  watch: {
    query() {
      this.updateExamples(true);
    },
    update() {
      this.updateExamples(true);
    },
    repositoryList() {
      this.updateExamples();
    },
    entitySearch() {
      this.updateExamples(true);
    },
    selectedOption() {
      this.perPage = +this.selectedOption;
      this.filterBySentence();
    },
    searchSentence(newValue) {
      this.query.search = newValue;
      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.filterBySentence();
      }, 750);
    },
  },
  mounted() {
    this.updateExamples();
  },
  methods: {
    ...mapActions(['searchExamples']),
    async updateExamples(force = false) {
      if (this.repositoryList.uuid !== undefined) {
        if (!this.examplesList || force) {
          this.examplesList = await this.searchExamples({
            repositoryUuid: this.repositoryList.uuid,
            version: this.repositoryVersion,
            query: this.entitySearch,
            limit: this.perPage,
          });
        }
      }
    },
    onItemDeleted() {
      this.updateExamples(true);
    },
    onItemSave() {
      this.updateExamples(true);
    },
    openRequestAuthorizationModal() {
      this.requestAuthorizationModalOpen = true;
    },
    onAuthorizationRequested() {
      this.requestAuthorizationModalOpen = false;
      this.$buefy.toast.open({
        message: this.$t('webapp.layout.authorization_success'),
        type: 'success',
      });
      this.updateRepository(false);
    },
    updateSelected(params) {
      this.selectedItems = params;
    },
    async filterBySentence() {
      this.examplesList = await this.searchExamples({
        repositoryUuid: this.repositoryList.uuid,
        version: this.repositoryVersion,
        query: {
          entity_id: this.entitySearch.entity_id,
          search: this.query.search,
        },
        limit: this.perPage,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import '~@weni/unnnic-system/dist/unnnic.css';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
label {
  vertical-align: middle;
}
.requestAuthorization {
  color: $color-fake-black;
  font-weight: $font-weight-medium;
  text-align: center;
  float: right;
}
.entity-list {
  margin: 0.4rem;

  &__divider {
    border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    margin: 2rem 0;
  }

  &__results {
    font: 14px 'Lato';
    margin-right: 1rem;
    color: $unnnic-color-neutral-dark;
  }

  &__search {
    display: flex;
    justify-content: space-between;

    & :deep(.unnnic-form) {
      width: 50%;
    }
  }
}
:deep(.input) {
  height: auto;
}
</style>
