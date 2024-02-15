<template>
  <div class="content-bases-page-container">
    <div class="repository-base">
      <div class="repository-base__header">
        <div class="repository-base__header__details">
          <div class="repository-base__header__title">
            <unnnic-button
              size="small"
              type="tertiary"
              icon-center="arrow_left_alt"
              scheme="neutral-dark"
              @click="$router.push({ name: 'home' })"
            />

            <unnnic-skeleton-loading
              v-if="repository.uuid === null"
              tag="div"
              width="120px"
              height="28px"
            />

            <unnnic-intelligence-text
              v-else
              family="secondary"
              color="neutral-darkest"
              weight="bold"
              size="title-sm"
            >
              {{ repository.name }}
            </unnnic-intelligence-text>
          </div>

          <unnnic-skeleton-loading
            v-if="repository.uuid === null"
            tag="div"
            width="300px"
            height="22px"
          />

          <p v-else class="repository-base__header__description">
            {{ repository.description }}
          </p>
        </div>

        <div class="repository-base__header__actions">
          <repository-content-navigation v-if="canContribute" />

          <unnnic-button
            v-if="canContribute"
            @click="isAddContentBaseOpen = true"
            class="create-base-button"
            iconLeft="add-1"
          >
            {{ $t('webapp.home.bases.new_knowledge_base') }}
          </unnnic-button>
        </div>
      </div>

      <unnnic-divider y-spacing="lg" />

      <div v-if="bases.data.length === 0 && bases.status === 'complete'" class="bases-list--empty">
        <img src="../../../assets/imgs/doris-yawning.png" alt="Doris Yawning">

          <h1 class="bases-list__title">
            {{ $t('intelligences.no_content_base_added') }}
          </h1>
      </div>

      <template v-else>
        <div class="bases-list__header">
          <unnnic-skeleton-loading
            v-if="repository.uuid === null"
            tag="div"
            width="300px"
            height="28px"
          />

          <unnnic-intelligence-text
            v-else
            color="neutral-dark"
            family="secondary"
            size="title-sm"
            weight="bold"
          >
            {{ $tc('webapp.home.bases.knowledge_bases', repository.content_bases_count) }}
          </unnnic-intelligence-text>

          <div class="bases-list__header__input">
            <unnnic-input
              v-model="searchBaseName"
              icon-left="search-1"
              :placeholder="$t('intelligences.search_content_base_placeholder')"
            />
          </div>
        </div>

        <div class="bases-list">
          <home-repository-card
            type="base"
            v-for="base in bases.data
              .filter(({ title }) => searchBaseName ?
                title.toLowerCase().includes(searchBaseName.toLowerCase()) : true)"
            :key="base.id"
            :repository-detail="base"
            :can-contribute="canContribute"
            @deleteBase="openDeleteModal"
          />

          <template v-if="bases.status === 'loading'">
            <unnnic-skeleton-loading
              v-for="i in 3"
              :key="i"
              tag="div"
              height="178px"
            />
          </template>

          <div
            v-show="bases.status !== 'loading'"
            ref="end-of-list-element"
          ></div>
        </div>
      </template>
    </div>

    <unnnic-modal
      class="delete-base-modal"
      persistent
      :close-icon="false"
      :text="$t('webapp.home.bases.edit-base_modal_delete_title')"
      :description="$t(
        'webapp.home.bases.edit-base_modal_delete_text',
        { name: isDeleteModalOpen.name },
      )"
      v-if="isDeleteModalOpen"
      @close="isDeleteModalOpen = null"
    >
      <unnnic-icon
        slot="icon"
        icon="error"
        scheme="aux-red-500"
        size="lg"
      />

      <unnnic-button slot="options" type="tertiary" @click="isDeleteModalOpen = null">
        {{ $t('webapp.home.bases.edit-base_modal_delete_button_cancel') }}
      </unnnic-button>

      <unnnic-button
        slot="options"
        type="warning"
        :loading="isDeleteModalOpen.loading"
        @click="deleteBase"
      >
        {{ $t('webapp.home.bases.edit-base_modal_delete_button_confirm') }}
      </unnnic-button>
    </unnnic-modal>

    <modal-next
      v-if="isAddContentBaseOpen"
      :title="$t('bases.create.title')"
      max-width="600px"
    >
      <unnnic-form-element
        :label="$t('bases.create.form.name.label')"
        class="create-base__form-element"
      >
        <unnnic-input
          v-model="title"
          maxlength="25"
          :placeholder="$t('bases.create.form.name.placeholder')"
        />
      </unnnic-form-element>

      <unnnic-form-element
        :label="$t('bases.create.form.language.label')"
        class="create-base__form-element"
      >
        <unnnic-select-smart
          :value="[languages.find(({ value }) => value === language)]"
          @input="language = $event[0].value"
          :options="languages"
          ordered-by-index
        />
      </unnnic-form-element>

      <unnnic-form-element
        :label="$t('bases.create.form.description.label')"
        class="create-base__form-element"
      >
        <unnnic-text-area
          v-model="description"
          :max-length="80"
          class="create-base__description-textarea"
          :placeholder="$t('bases.create.form.description.placeholder')"
        />
      </unnnic-form-element>

      <div class="create-base__actions">
        <unnnic-button
          size="large"
          :text="$t('webapp.home.cancel')"
          type="tertiary"
          @click.prevent.stop="isAddContentBaseOpen = false"
        />

        <unnnic-button
          size="large"
          :text="$t('webapp.home.bases.new_knowledge_base')"
          type="primary"
          @click="createNewBase"
          :disabled="!this.title || !this.description"
          :loading="creatingNewBase"
        />
      </div>
    </modal-next>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import VueMarkdown from 'vue-markdown';
import HomeRepositoryCard from '@/components/repository/home/HomeRepositoryCard';
import RepositoryContentNavigation from './Navigation';
import Modal from '@/components/repository/CreateRepository/Modal';
import RemoveBulmaMixin from '../../../utils/RemoveBulmaMixin';
import repositoryV2 from '../../../api/v2/repository';
import ModalNext from '../../../components/ModalNext';
import nexusaiAPI from '../../../api/nexusaiAPI';
import { get } from 'lodash';

export default {
  name: 'RepositoryBase',
  mixins: [RemoveBulmaMixin],
  components: {
    RepositoryViewBase,
    VueMarkdown,
    HomeRepositoryCard,
    RepositoryContentNavigation,
    Modal,
    ModalNext,
  },
  data() {
    return {
      searchBaseName: '',

      loadingIntelligence: false,

      repository: {
        uuid: null,
        name: '',
        description: '',
        content_bases_count: 0,
      },

      repositoryUUID: null,

      isDeleteModalOpen: null,
      modalData: {},
      isAddContentBaseOpen: false,

      title: '',
      language: 'pt-br',
      description: '',

      languages: [{
        value: 'pt-br',
        label: 'PT-BR',
      }, {
        value: 'en-us',
        label: 'EN-US',
      }, {
        value: 'es',
        label: 'ES',
      }],

      isShowingEndOfList: false,

      creatingNewBase: false,

      bases: {
        count: null,
        limit: 20,
        offset: 0,
        repositoryUuid: this.repositoryUUID,
        data: [],
        next: null,
        status: null,
      },
    };
  },

  mounted() {},

  beforeDestroy() {
    this.intersectionObserver.unobserve(this.$refs['end-of-list-element']);
  },

  computed: {
    ...mapGetters(['getCurrentRepository', 'getProjectSelected', 'getOrgSelected']),

    canContribute() {
      return true;
    },

    getAllCategories() {
      if (!this.repository.categories_list) {
        return [];
      }

      const categories = this.repository.categories_list.map(category => category.name);
      return categories;
    }
  },
  watch: {
    isAddContentBaseOpen() {
      const userLanguage = get(this.$store.state.User, 'me.language', '').toLowerCase();

      this.language = ['pt-br', 'en-us', 'es'].includes(userLanguage)
        ? userLanguage
        : 'pt-br';
    },

    isShowingEndOfList() {
      if (
        this.isShowingEndOfList
        && this.bases.status !== 'complete'
      ) {
        this.fetchBases();
      }
    },

    '$route.params.intelligenceUuid': {
      immediate: true,

      handler() {
        this.loadingIntelligence = true;

        nexusaiAPI
          .readIntelligence({
            orgUuid: this.$store.state.Auth.connectOrgUuid,
            intelligenceUuid: this.$route.params.intelligenceUuid,
          })
          .then(({ data }) => {
            /*
              uuid
              content_bases_count: Number
              description: String
              name: String
            */

            this.$store.state.Repository.current = data;

            this.repository = data;
          })
          .finally(() => {
            this.loadingIntelligence = false;
          });
      },
    },

    // eslint-disable-next-line
    "repository.uuid"() {
      if (!this.repository.uuid || this.repository.uuid === 'null') {
        return false;
      }

      this.repositoryUUID = this.repository.uuid;

      this.$nextTick(() => {
        this.fetchBases();

        this.intersectionObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            this.isShowingEndOfList = entry.isIntersecting;
          });
        });

        this.intersectionObserver.observe(this.$refs['end-of-list-element']);
      });
    },
  },
  methods: {
    ...mapActions(['getQAKnowledgeBasesNext', 'deleteQAKnowledgeBase', 'createQAKnowledgeBase', 'editQAKnowledgeBase', 'createQAText']),

    async createNewBase() {
      try {
        this.creatingNewBase = true;

        const { data: contentBaseData } = await nexusaiAPI
          .createIntelligenceContentBase({
            intelligenceUuid: this.$route.params.intelligenceUuid,
            title: this.title,
            language: this.language,
            description: this.description,
          });

        this.creatingNewBase = false;
        this.isAddContentBaseOpen = false;

        this.$router.push({
          name: 'intelligence-content-base-edit',
          params: {
            contentBaseUuid: contentBaseData.uuid,
          },
        });
      } finally {
        this.creatingNewBase = false;
      }
    },

    reloadBases() {
      this.bases = {
        count: null,
        limit: 20,
        offset: 0,
        repositoryUuid: this.repositoryUUID,
        data: [],
        next: null,
        status: null,
      };

      this.fetchBases();
    },

    async fetchBases() {
      try {
        this.bases.status = 'loading';

        const { data } = await nexusaiAPI
          .listIntelligencesContentBases({
            intelligenceUuid: this.$route.params.intelligenceUuid,
            next: this.bases.next,
          });

        this.bases.data = [...this.bases.data, ...data.results];
        this.bases.next = data.next;

        if (!data.next) {
          this.bases.status = 'complete';
        }
      } finally {
        if (this.bases.status === 'loading') {
          this.bases.status = null;
        }
      }
    },

    openDeleteModal(repository) {
      this.isDeleteModalOpen = {
        name: repository.name,
        id: repository.id,
        contentBaseUuid: repository.uuid,
        loading: false,
      }
    },

    async deleteBase() {
      this.isDeleteModalOpen.loading = true;

      await nexusaiAPI
        .deleteIntelligenceContentBase({
          intelligenceUuid: this.$route.params.intelligenceUuid,
          contentBaseUuid: this.isDeleteModalOpen.contentBaseUuid,
        });

      this.isDeleteModalOpen = null;

      this.reloadBases();
    },
  }
};
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.delete-base-modal ::v-deep {
  .unnnic-modal-container-background-body {
    padding-top: $unnnic-spacing-giant;
  }

  .unnnic-modal-container-background-body__icon-slot {
    margin-bottom: $unnnic-spacing-sm;
  }

  .unnnic-modal-container-background-body-title {
    padding-bottom: $unnnic-spacing-sm;
  }

  .unnnic-modal-container-background-body-description-container {
    padding-bottom: 0;
  }

  .unnnic-modal-container-background-button {
    padding-top: $unnnic-spacing-lg;
    padding-bottom: $unnnic-spacing-lg;
  }
}

.create-base__form-element + .create-base__form-element {
  margin-top: $unnnic-spacing-sm;
}

.create-base__description-textarea ::v-deep textarea {
  display: block;
  min-height: 4.6875 * $unnnic-font-size;
  outline-style: solid;
  outline-color: $unnnic-color-neutral-soft;
  outline-width: $unnnic-border-width-thinner;
  outline-offset: -$unnnic-border-width-thinner;
  color: $unnnic-color-neutral-dark;
  caret-color: $unnnic-color-neutral-clean;

  &::placeholder {
    color: $unnnic-color-neutral-cleanest;
    opacity: 1; /* Firefox */
  }

  &:focus {
    outline-color: $unnnic-color-neutral-clean;
  }
}

.create-base__actions {
  display: flex;
  margin-top: $unnnic-spacing-lg;
  column-gap: $unnnic-spacing-sm;

  & > * {
    flex: 1;
  }
}

.content-bases-page-container {
  padding: $unnnic-spacing-lg $unnnic-spacing-lg;
}

.create-base-button {
  min-width: 20.625 * $unnnic-font-size;
}


.bases-list__header {
  display: grid;
  align-items: center;
  gap: $unnnic-spacing-sm;
  grid-template-columns:
    repeat(auto-fill, minmax(20.625 * $unnnic-font-size, 1fr));

  &__input {
    grid-column-end: -1;
    grid-column-start: 2;
  }
}

.bases-list {
  margin-top: $unnnic-spacing-md;
  display: grid;
  gap: $unnnic-spacing-sm;
  grid-template-columns: repeat(auto-fill, minmax(20.625 * $unnnic-font-size, 1fr));

  &--empty {
    margin-top: 7.5 * $unnnic-font-size;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__title {
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-title-sm;
    line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
    text-align: center;

    margin-block: $unnnic-spacing-md;
  }
}

.repository-base {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $unnnic-spacing-sm;

    &__details {
      display: flex;
      flex-direction: column;
      row-gap: $unnnic-spacing-sm;
    }

    &__title {
      display: flex;
      column-gap: $unnnic-spacing-ant;
      align-items: center;
    }

    &__actions {
      display: flex;
      align-items: center;
      column-gap: $unnnic-spacing-sm;

      .create-base-button {
        min-width: 15.625 * $unnnic-font-size;
      }
    }

    &__description {
      color: $unnnic-color-neutral-dark;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-regular;

      margin: 0;
    }

    &__categories {
      display: flex;
      flex-wrap: wrap;
      gap: $unnnic-spacing-xs;
    }

    &__tag {
      padding: 0 $unnnic-inset-lg;
      font-size: 15px;
    }
  }

  &__description {
    &__header {
      display: flex;
      justify-content: space-between;
    }

    &__text, i {
      margin-top: $unnnic-inset-nano;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      color: $unnnic-color-neutral-dark;
      ul li {
        list-style-type: disc;
      }
    }
  }
  &__cards {
    display: grid;
    justify-content: space-between;
    grid-template-columns: repeat(4, 24%);
    margin-top: $unnnic-inset-md;
    gap: $unnnic-spacing-sm;
    @media screen and (max-width: 1400px) {
      grid-template-columns: repeat(3, 32%);
    }

    &__new {
      height: 16.8125rem;
      margin-bottom: $unnnic-inline-sm;
    }
  }
}

::v-deep {
  .unnnic-card-intelligence__detail {
    display: none;
  }
  .unnnic-card-intelligence__divider {
    display: none;
  }
  .unnnic-card-intelligence__description {
    -webkit-line-clamp: 2;
  }
  .repository-base__description__text--link {
    color: $unnnic-color-neutral-dark;
    text-decoration: underline;
  }

  .unnnic-modal-container-background-body-description-container {
    padding-bottom: $unnnic-spacing-sm;
  }
}


</style>
