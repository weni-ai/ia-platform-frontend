<template>
  <div class="content-bases-page-container">
    <div class="repository-base">
      <div class="repository-base__header">
        <div class="repository-base__header__details">
          <div class="repository-base__header__title">
            <unnnic-avatar-icon icon="neurology" size="sm" scheme="weni-600" />

            <unnnic-skeleton-loading
              v-if="repository.uuid === null"
              tag="div"
              width="120px"
              height="32px"
            />

            <h1 v-else>{{ repository.name }}</h1>
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

          <div class="repository-base__header__categories">
            <template v-if="repository.uuid === null">
              <unnnic-skeleton-loading
                v-for="i in 3"
                :key="i"
                tag="div"
                :width="40 + Math.floor(Math.random() * 80) + 'px'"
                height="28px"
              />
            </template>

            <unnnic-tag
              v-else
              v-for="(category, index) in getAllCategories"
              :key="index"
              class="repository-base__header__tag"
              :text="category"
              disabled
              scheme="background-sky"
            />
          </div>
        </div>

        <repository-content-navigation />
      </div>

      <hr />

      <div v-if="bases.count === 0" class="bases-list--empty">
        <img src="../../../assets/imgs/doris-yawning.png" alt="Doris Yawning">

          <h1 class="bases-list__title">
            {{ $t('intelligences.no_content_base_added') }}
          </h1>

          <unnnic-button @click="openModal = true" class="create-base-button" iconLeft="add-1">
            {{ $t('webapp.home.bases.new_knowledge_base') }}
          </unnnic-button>
      </div>

      <template v-else>

        <div class="repository-base__bases-count">
          <unnnic-skeleton-loading
            v-if="bases.count === null"
            tag="div"
            width="300px"
            height="28px"
          />

          <h1
            v-else
            class="u font secondary title-sm bold"
            v-html="$tc('webapp.home.bases.knowledge_bases', bases.count)"
          ></h1>

          <unnnic-button @click="openModal = true" class="create-base-button" iconLeft="add-1">
            {{ $t('webapp.home.bases.new_knowledge_base') }}
          </unnnic-button>
        </div>

        <div class="repository-base__search-base">
          <unnnic-input
            icon-left="search-1"
            placeholder="Pesquisar base de conteúdo"
          />
        </div>

        <div class="bases-list">
          <home-repository-card
            type="base"
            v-for="base in bases.data"
            :key="base.id"
            :repository-detail="base"
            @deleteBase="openDeleteModal"
          />

          <template v-if="bases.count === null || bases.status === 'loading'">
            <unnnic-skeleton-loading
              v-for="i in 3"
              :key="i"
              tag="div"
              height="146px"
            />
          </template>

          <div
            v-show="bases.status !== 'loading'"
            ref="end-of-list-element"
          ></div>
        </div>
      </template>
    </div>
    <modal
      v-if="isDeleteModalOpen"
      type="confirm"
      :data="modalData"
      @close="isDeleteModalOpen = false"
    />
    <unnnic-modal text="Nova base de conteúdo" :closeIcon="false" v-show="openModal">
      <div class="text-left">
        <unnnic-input
          v-model="title"
          label="Nome da base"
        />
        <unnnic-text-area
          v-model="description"
          label="Descrição"
          :maxLength="80"
          class="mt-4"
        />
      </div>
      <unnnic-button slot="options" type="tertiary" @click.prevent.stop="this.openModal = false">
        {{ $t("webapp.home.cancel") }}
      </unnnic-button>
      <unnnic-button
        slot="options"
        class="create-repository__container__button"
        @click="createNewBase()"
        :disabled="!this.title || !this.description"
      >
        {{ $t('webapp.home.bases.new_knowledge_base') }}
      </unnnic-button>
    </unnnic-modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import VueMarkdown from 'vue-markdown';
import RepositoryBase from '../Base';
import HomeRepositoryCard from '@/components/repository/home/HomeRepositoryCard';
import RepositoryContentNavigation from './Navigation';
import Modal from '@/components/repository/CreateRepository/Modal';
import RemoveBulmaMixin from '../../../utils/RemoveBulmaMixin';
import repositoryV2 from '../../../api/v2/repository';

export default {
  name: 'RepositoryBase',
  mixins: [RemoveBulmaMixin],
  components: {
    RepositoryViewBase,
    VueMarkdown,
    HomeRepositoryCard,
    RepositoryContentNavigation,
    Modal
  },
  // extends: RepositoryBase,
  data() {
    return {
      loadingIntelligence: false,

      repository: {
        uuid: null,
        language: '',
        name: '',
        description: '',
        categories_list: [],
      },

      repositoryUUID: null,

      isDeleteModalOpen: false,
      modalData: {},
      openModal: false,
      title: '',
      description: '',

      isShowingEndOfList: false,

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

  mounted() {
    this.loadingIntelligence = true;

    repositoryV2
      .shortcut(this.$route.params.ownerNickname, this.$route.params.slug)
      .then(({ data }) => {
        this.repository = data;
      })
      .finally(() => {
        this.loadingIntelligence = false;
      });
  },

  beforeDestroy() {
    this.intersectionObserver.unobserve(this.$refs['end-of-list-element']);
  },

  computed: {
    ...mapGetters(['getCurrentRepository', 'getProjectSelected', 'getOrgSelected']),

    getAllCategories() {
      if (!this.repository.categories_list) {
        return [];
      }

      const categories = this.repository.categories_list.map(category => category.name);
      return categories;
    }
  },
  watch: {
    isShowingEndOfList() {
      if (
        this.isShowingEndOfList
        && this.bases.status !== 'complete'
      ) {
        this.fetchBases();
      }
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
      const { data } = await this.createQAKnowledgeBase({
        repositoryUUID: this.repositoryUUID,
        title: this.title,
      });

      await this.createQAText({
        repositoryUUID: this.repositoryUUID,
        title: this.title,
        knowledgeBaseId: data.id,
        text: this.description,
        language: this.repository.language
      });

      this.openModal = false;
      this.fetchBases();
    },
    async fetchBases() {
      // this.bases = [];
      // const response = await this.getQAKnowledgeBases({
      //   repositoryUUID: this.repositoryUUID,
      //   page: 0
      // });

      // response.data.results.forEach(({ id, title, user_name, language_count, description }) => {
      //   this.bases.push({
      //     id,
      //     name: title,
      //     owner__nickname: user_name,
      //     available_languages: false,
      //     description
      //   });
      // });

      try {
        this.bases.status = 'loading';

        const { data } = await this.getQAKnowledgeBasesNext({
          limit: this.bases.limit,
          offset: this.bases.offset,
          repositoryUUID: this.repositoryUUID,
          next: this.bases.next,
        });

        this.bases.data = [...this.bases.data, ...data.results];
        this.bases.next = data.next;
        this.bases.count = data.count;

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
      this.isDeleteModalOpen = true;

      this.modalData = {
        icon: 'error',
        scheme: 'feedback-red',
        persistent: true,
        title: this.$t('webapp.home.bases.edit-base_modal_delete_title'),
        description: this.$tc('webapp.home.bases.edit-base_modal_delete_text', repository.name),
        cancelText: this.$t('webapp.home.bases.edit-base_modal_delete_button_cancel'),
        confirmText: this.$t('webapp.home.bases.edit-base_modal_delete_button_confirm'),
        onConfirm: async (justClose, { setLoading }) => {
          setLoading(true);
          await this.deleteBase(repository.id);
          setLoading(false);
          justClose();

          this.fetchBases();
        }
      };
    },
    async deleteBase(id) {
      await this.deleteQAKnowledgeBase({
        repositoryUUID: this.repositoryUUID,
        id
      });
    },
  }
};
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.content-bases-page-container {
  padding: $unnnic-spacing-md $unnnic-font-size * 8;
}

.create-base-button {
  min-width: 20.625 * $unnnic-font-size;
}

.bases-list {
  display: grid;
  gap: $unnnic-spacing-sm;
  grid-template-columns: repeat(auto-fill, minmax(20.625 * $unnnic-font-size, 1fr));

  &--empty {
    display: flex;
    flex-direction: column;
    align-items: center;

    .create-base-button {
      min-width: 15.625 * $unnnic-font-size;
    }
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
      column-gap: $unnnic-spacing-sm;
      align-items: center;

      h1 {
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-title-md;
        line-height: $unnnic-font-size-title-md + $unnnic-line-height-md;
        font-weight: $unnnic-font-weight-bold;
        color: $unnnic-color-neutral-darkest;

        margin: 0;
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

  &__search-base {
      margin: $unnnic-spacing-md 0 $unnnic-spacing-sm;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: $unnnic-spacing-stack-sm $unnnic-spacing-inline-md;

      .unnnic-form {
        flex: 1;
      }
    }

    &__bases-count {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: $unnnic-spacing-sm;

      h1 {
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-title-sm;
        line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
        font-weight: $unnnic-font-weight-bold;
        color: $unnnic-color-neutral-darkest;

        margin: 0;
      }
    }
    ::v-deep {
      .input.size-md {
        height: auto;
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

hr {
  all: unset;
  width: 100%;
  border: 0;
  display: block;
  height: $unnnic-border-width-thinner;
  background-color: $unnnic-color-neutral-soft;
  margin: $unnnic-spacing-lg 0;
  margin-top: $unnnic-spacing-lg - $unnnic-border-width-thinner;
}

</style>
