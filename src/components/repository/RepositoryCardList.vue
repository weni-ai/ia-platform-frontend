<template>
  <div class="repository-card-list">
    <paginated-list
      v-if="repositoryList"
      :item-component="exampleItemElem"
      :list="repositoryList"
      class="repository-card-list__item" />
    <p
      v-if="repositoryList && repositoryList.empty"
      class="has-text-centered">{{ $t('webapp.home.no_repo') }}</p>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

import PaginatedList from '@/components/shared/PaginatedList';
import RepositoryCard from '@/components/repository/RepositoryCard';

export default {
  name: 'RepositoryCardList',
  components: {
    PaginatedList,
    RepositoryCard,
  },
  props: {
    category: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      default: null,
    },
    search: {
      type: String,
      default: null,
    },
    limit: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      exampleItemElem: RepositoryCard,
      repositoryList: null,
    };
  },
  watch: {
    category() {
      this.updateRepositoryList();
    },
    language() {
      this.updateRepositoryList();
    },
    search() {
      this.updateRepositoryList();
    },
  },
  mounted() {
    this.updateRepositoryList();
  },
  methods: {
    ...mapActions([
      'getCommunityRepository',
    ]),
    async updateRepositoryList() {
      const { search } = this;
      this.repositoryList = null;

      if (this.category === 0) {
        this.repositoryList = await this.getCommunityRepository({
          language: this.language,
          search,
          limit: this.limit,
        });
      } else if (this.category > 0) {
        this.repositoryList = await this.getCommunityRepository({
          categories: this.category,
          language: this.language,
          search,
          limit: this.limit,
        });
      }
      this.$emit('cardList', this.repositoryList);
    },
  },
};
</script>

<style lang="scss" scoped>

.repository-card-list {
  &__item {
    display: flex;
    flex-wrap: wrap;
    margin: 0 1rem;

    > * {
      margin: 4rem;
    }
  }

  &__align-items {
    align-items: center;
  }
}

</style>
