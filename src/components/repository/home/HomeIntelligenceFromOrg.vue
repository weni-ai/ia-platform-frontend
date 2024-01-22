<!-- depreciated -->

<template>
  <div class="home-intelligences-from-org__wrapper">
    <home-intelligence-container>
      <div class="home-intelligences-from-org">
        <div class="home-intelligences-from-org__cards">
          <!-- <unnnic-card
            clickable
            :text="$t('webapp.intelligences_lib.new_intelligence')"
            type="blank"
            icon="add-1"
            class="home-intelligences-from-org__cards__new"
            @click.native="createNewIntelligence()"
          /> -->
          <home-repository-card
            v-for="list in repositoryOrgList"
            :key="list.uuid"
            :repository-detail="list"
            @dispatchShowModal="showModal($event)"
            @onCopySuccess="getOrgsRepositories()"
          />
        </div>
        <infinite-scroll
          v-show="!isComplete"
          @intersect="getOrgsRepositories()"
        />
      </div>
      <modal-container
        :info-modal="modalInfo"
        :show-modal="openModal"
        @closeModal="openModal = false"
      >
      </modal-container>
    </home-intelligence-container>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import HomeRepositoryCard from '@/components/repository/home/HomeRepositoryCard';
import HomeIntelligenceContainer from '@/components/repository/home/HomeIntelligenceContainer';
import infiniteScroll from '@/components/shared/infiniteScroll';
import ModalContainer from '@/components/repository/home/ModalContainer';

export default {
  name: 'HomeIntelligenceFromOrg',
  components: {
    HomeRepositoryCard,
    HomeIntelligenceContainer,
    infiniteScroll,
    ModalContainer,
  },
  data() {
    return {
      repositoryOrgList: [],
      page: 0,
      isComplete: false,
      error: null,
      modalInfo: {},
      openModal: false,
    };
  },
  computed: {
    ...mapGetters(['getOrgSelected']),
  },
  methods: {
    ...mapActions(['getRepositories']),
    showModal(value) {
      this.openModal = true;
      this.modalInfo = { ...value };
    },
    async getOrgsRepositories() {
      this.$emit('loading', true)
      try {
        const { data } = await this.getRepositories({
          limit: 20,
          offset: this.page,
          owner_id: this.getOrgSelected,
        });
        this.page += 20;
        this.repositoryOrgList = [...this.repositoryOrgList, ...data.results];
        this.isComplete = data.next == null;
      } catch (err) {
        this.error = err;
      } finally {
        this.$emit('loading', false)
      }
    },
    createNewIntelligence() {
      this.$router.push({
        name: 'new',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.home-intelligences-from-org {
  &__cards {
    display: grid;
    justify-content: space-between;
    grid-template-columns: repeat(3, 33%);
    gap: 1rem;
    @media screen and (max-width: 1400px) {
      grid-template-columns: repeat(3, 33%);
    }

    &__new {
      height: 260px;
      // margin-bottom: $unnnic-inline-sm;
    }
  }

  &__wrapper {
    display: grid;
    // grid-template-columns: 1fr 2fr;
    // margin: 1.5rem;
    gap: 1rem;
  }
}
</style>
