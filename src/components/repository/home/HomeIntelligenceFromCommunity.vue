<template>
  <div>
    <h1 class="home-intelligences-from-community__title">
      {{ $t('webapp.intelligences_lib.community_description') }}
    </h1>
    <div class="home-intelligences-from-community__wrapper">
      <HomeIntelligenceFilter @change="filterIntelligences" />
      <HomeIntelligenceContainer>
        <div class="home-intelligences-from-community">
          <div class="home-intelligences-from-community__cards">
            <HomeRepositoryCard
              v-for="list in repositoryCommunityList"
              :key="list.uuid"
              :repositoryDetail="list"
              @dispatchShowModal="showModal($event)"
            />
          </div>
          <InfiniteScroll
            v-show="!isComplete"
            @intersect="getCommunityRepositories()"
          />
        </div>
        <ModalContainer
          :infoModal="modalInfo"
          :showModal="openModal"
          @closeModal="openModal = false"
        >
        </ModalContainer>
      </HomeIntelligenceContainer>
    </div>
  </div>
</template>
<script>
import { mapActions } from 'vuex';
import HomeRepositoryCard from '@/components/repository/home/HomeRepositoryCard';
import HomeIntelligenceContainer from '@/components/repository/home/HomeIntelligenceContainer';
import infiniteScroll from '@/components/shared/infiniteScroll';
import ModalContainer from '@/components/repository/home/ModalContainer';
import HomeIntelligenceFilter from './HomeIntelligenceFilter';

export default {
  name: 'HomeIntelligenceFromCommunity',
  components: {
    HomeRepositoryCard,
    HomeIntelligenceContainer,
    infiniteScroll,
    ModalContainer,
    HomeIntelligenceFilter,
  },
  data() {
    return {
      repositoryCommunityList: [],
      page: 0,
      isComplete: false,
      error: null,
      openModal: false,
      modalInfo: {},
    };
  },
  methods: {
    ...mapActions(['searchRepositories', 'getCommunityRepository']),
    showModal(value) {
      this.openModal = true;
      this.modalInfo = { ...value };
    },
    async getCommunityRepositories() {
      this.$emit('loading', true);
      try {
        const { data } = await this.searchRepositories({
          limit: 20,
          offset: this.page,
        });
        this.page += 20;
        this.repositoryCommunityList = [
          ...this.repositoryCommunityList,
          ...data.results,
        ];
        this.isComplete = data.next == null;
      } catch (err) {
        this.error = err;
      } finally {
        this.$emit('loading', false);
      }
    },
    async filterIntelligences(filter) {
      this.$emit('loading', true);
      try {
        const { data } = await this.getCommunityRepository({
          limit: 20,
          offset: 0,
          ...filter,
        });
        this.repositoryCommunityList = data.results;
        this.isComplete = data.next == null;
      } catch (err) {
        this.error = err;
      } finally {
        this.$emit('loading', false);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@weni/unnnic-system/dist/unnnic.css';
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.home-intelligences-from-community {
  &__cards {
    display: grid;
    justify-content: space-between;
    grid-template-columns: repeat(2, 50%);
    gap: 1rem;
    @media screen and (max-width: 1400px) {
      grid-template-columns: repeat(2, 50%);
    }
    padding-bottom: 15rem;
  }

  &__title {
    font-family: 'Lato';
    font-size: 20px;
    margin: 1.5rem 1.75rem;
  }

  &__wrapper {
    display: grid;
    grid-template-columns: 1fr 2fr;
    margin: 1.5rem;
    gap: 1rem;
  }
}
</style>
