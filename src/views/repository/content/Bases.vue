<template>
  <repository-view-base :repository="repository" :error-code="errorCode">
    <div v-if="repository" class="repository-base">
      <div class="repository-base__description">
        <div class="repository-base__title">
          <unnnic-card
            type="title"
            :title="repository.name"
            enabled
            icon="neurology"
            infoPosition="right"
            :hasInformationIcon="false"
            scheme="aux-blue"
          />
        </div>
        <section class="repository-base__description__header">
          <div>
            <vue-markdown
              :source="repository.description"
              show
              html
              :breaks="false"
              :linkify="false"
              emoji
              typographer
              toc
              toc-id="toc"
              class="repository-base__description__text markdown-body"
            />
            <p v-if="repository.description" class="repository-base__description__text" />
            <p v-else>
              <i class="text-color-grey-dark">{{ $t("webapp.home.no_description") }}</i>
            </p>
            <div style="display: flex">
                <unnnic-tag
                  v-for="(category, index) in getAllCategories"
                  :key="index"
                  class="repository-base__header__tag"
                  :text="category"
                  disabled
                  scheme="background-sky"
                />
            </div>
          </div>
          <!-- <unnnic-button
            @click.prevent.stop="changeIntegrateModalState(true)"
            iconCenter="settings"
            type="secondary"
          /> -->
          <repository-content-navigation />
        </section>
      </div>
      <hr />
      <div class="repository-base__bases-count">
        <h1
          class="u font secondary title-sm bold"
          v-html="$tc('webapp.home.bases.knowledge_bases', this.bases.length)"
        />
        <unnnic-button @click="createNewBase" class="ml-auto" iconLeft="add-1">
          {{ $t('webapp.home.bases.new_knowledge_base') }}
        </unnnic-button>
      </div>

      <div class="repository-base__search-base">
        <unnnic-input
          icon-left="search-1"
          placeholder="Pesquisar base de conteúdo"
        />
      </div>

      <div class="repository-base__cards">
        <home-repository-card
          type="base"
          v-for="base in bases"
          :key="base.id"
          :repository-detail="base"
        />
      </div>
    </div>
  </repository-view-base>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import VueMarkdown from 'vue-markdown';
import RepositoryBase from '../Base';
import HomeRepositoryCard from '@/components/repository/home/HomeRepositoryCard';
import RepositoryContentNavigation from './Navigation';

export default {
  name: 'RepositoryBase',
  components: {
    RepositoryViewBase,
    VueMarkdown,
    HomeRepositoryCard,
    RepositoryContentNavigation
  },
  extends: RepositoryBase,
  data() {
    return {
      repositoryUUID: null,

      bases: []
    };
  },
  mounted() {},
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
    // eslint-disable-next-line
    "repository.uuid"() {
      if (!this.repository.uuid || this.repository.uuid === 'null') {
        return false;
      }

      this.repositoryUUID = this.repository.uuid;
    },

    async repositoryUUID() {
      const response = await this.getQAKnowledgeBases({
        repositoryUUID: this.repositoryUUID,
        page: 0
      });

      response.data.results.forEach(({ id, title, user_name, language_count, description }) => {
        this.bases.push({
          id,
          name: title,
          owner__nickname: user_name,
          available_languages: false,
          description
        });
      });
    }
  },
  methods: {
    ...mapActions(['getQAKnowledgeBases']),

    createNewBase() {
      this.$router.push({
        name: 'repository-content-bases-new'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.repository-base {
  &__header {
    display: flex;

    &__tag {
      padding: 0 $unnnic-inset-lg;
      font-size: 15px;
      margin-right: $unnnic-inset-nano;
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
    }
    ::v-deep {
      .input.size-md {
        height: auto;
      }
    }
}
.tooltipStyle::after {
  font-size: $unnnic-font-size-body-md;
  line-height: 13px;
  padding: 1rem 0.5rem;
  font-family: $font-family;
}
.markdown-body {
  margin: 1rem 0;

  a {
    color: $color-primary;
    text-decoration: none;
  }

  h1,
  h2 {
    border-bottom: 1px solid $color-primary;
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
}

hr {
  background: $unnnic-color-neutral-soft;
  height: 1px;
}

</style>
