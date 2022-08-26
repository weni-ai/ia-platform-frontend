<template>
  <repository-view-base
    :repository="repository"
    :error-code="errorCode">
    <div
      v-if="authenticated"
      class="entity-list">
      <div v-if="repository && repository.authorization.can_contribute">
        <entities-list
          :entities-list="examplesList"
          :repository="repository"
          :entity-name.sync="entitySelected"
          @saveEdition="onItemSave()"
          :selected-items="selectedItems"
          @itemDeleted="onItemDeleted()"
          />
        <div class="entity-list__divider" />
        <div class="entity-list__search">
          <unnnic-input
            :placeholder="$t('webapp.intent.search_sentence')"
            iconLeft="search-1"
            v-model="searchSentence"
          />
          <div class="is-flex is-align-items-center">
            <span class="entity-list__results">{{ $t('webapp.intent.sentences_perpage') }}</span>
            <unnnic-select
              class="unnic--clickable"
              size="md"
              v-model="selectedOption"
            >
              <option v-for="(option, index) in options" :key="index" size="sm">
                {{ option.value }}
              </option>
            </unnnic-select>
          </div>
        </div>
        <intent-pagination
          v-if="examplesList"
          :item-component="sentencesEntities"
          :list="examplesList"
          :repository="repository"
          :per-page="perPage"
          :add-attributes="{ entitySelected }"
          @itemDeleted="onItemDeleted()"
          @itemSave="onItemSave()"
          :show-intents="true"
          @onUpdateSelected="updateSelected"
        />
        <p
          v-if="examplesList && examplesList.empty"
          class="no-examples">{{ $t('webapp.entity.no_sentences') }}</p>
      </div>
      <b-notification
        v-else
        :closable="false"
        class="repository-log__notification"
        type="is-warning">
        {{ $t('webapp.evaluate.you_can_not_edit') }}
        <request-authorization-modal
          v-if="repository"
          :open.sync="requestAuthorizationModalOpen"
          :available="!repository.available_request_authorization"
          :repository-uuid="repository.uuid"
          @requestDispatched="onAuthorizationRequested()" />
        <a
          class="requestAuthorization"
          @click="openRequestAuthorizationModal">
          {{ $t('webapp.layout.request_authorization') }}
        </a>
      </b-notification>
    </div>
    <div
      v-else>
      <b-notification
        :closable="false"
        class="is-info">
        {{ $t('webapp.inbox.signin_you_account') }}
      </b-notification>
      <login-form hide-forgot-password />
    </div>
  </repository-view-base>

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
    IntentPagination
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
      options: [
        { value: 10 },
        { value: 25 },
        { value: 50 },
      ],
      selectedOption: `${this.perPage}`,
      searchSentence: '',
      timeout: null
    };
  },
  computed: {
    ...mapGetters({
      repositoryVersion: 'getSelectedVersion',
      repositoryList: 'getCurrentRepository',
    }),
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
      this.perPage = +this.selectedOption
      this.filterBySentence();
    },
    searchSentence(newValue) {
      this.query.search = newValue
      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.filterBySentence();
      }, 750);
    }
  },
  mounted() {
    this.updateExamples();
  },
  methods: {
    ...mapActions([
      'searchExamples',
    ]),
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
      this.selectedItems = params
    },
    async filterBySentence() {
      this.examplesList = await this.searchExamples({
        repositoryUuid: this.repositoryList.uuid,
        version: this.repositoryVersion,
        query: {
          entity_id: this.entitySearch.entity_id,
          search: this.query.search
        },
        limit: this.perPage
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";
  label {
    vertical-align: middle;
  }
  .requestAuthorization{
      color: $color-fake-black;
      font-weight: 600;
      text-align: center;
      float: right
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

      & /deep/ .unnnic-form {
        width: 50%;
      }
    }
  }
/deep/ .input {
  height: auto;
}

</style>
