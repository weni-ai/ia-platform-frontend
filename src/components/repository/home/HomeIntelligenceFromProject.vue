<template>
  <div class="home-intelligences-from-project__wrapper">
    <home-intelligence-container>
      <div class="home-intelligences-from-project">
        <section class="home-intelligences-from-project__content" v-if="checkProjectLength">
          <div class="home-intelligences-from-project__content__text">
            <p>
              {{ $t("webapp.intelligences_lib.unused_projects") }}
            </p>
          </div>
          <div class="home-intelligences-from-project__content__button">
            <unnnic-button type="secondary" iconLeft="add-1" @click="createNewIntelligence()">
              {{ $t("webapp.intelligences_lib.new_intelligence") }}
            </unnnic-button>
          </div>
        </section>
        <div class="home-intelligences-from-project__cards" v-else>
          <unnnic-card
            clickable
            :text="$t('webapp.intelligences_lib.new_intelligence')"
            type="blank"
            icon="add-1"
            class="home-intelligences-from-project__cards__new"
            @click.native="createNewIntelligence()"
          />
          <home-repository-card
            v-for="list in projectList"
            :key="list.uuid"
            :repository-detail="list"
            @dispatchShowModal="showModal($event)"
          />
        </div>
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
import { mapActions, mapGetters, mapState } from 'vuex';
import HomeRepositoryCard from '@/components/repository/home/HomeRepositoryCard';
import HomeIntelligenceContainer from '@/components/repository/home/HomeIntelligenceContainer';
import ModalContainer from '@/components/repository/home/ModalContainer';
import Loading from '@/components/shared/Loading';

export default {
  name: 'HomeIntelligenceFromProject',
  components: { HomeRepositoryCard, HomeIntelligenceContainer, ModalContainer, Loading },
  data() {
    return {
      projectList: [],
      error: null,
      modalInfo: {},
      openModal: false,
      loading: true,
    };
  },
  computed: {
    ...mapGetters([
      'getProjectSelected',
      'getOrgSelected',
    ]),
    ...mapState({
      projectListWasUpdated: state => state.Integration.updateProjects,
    }),
    checkProjectLength(){
      return this.projectList.length === 0
    },
  },
  watch: {
    projectListWasUpdated(){
      this.getProjectList();
    }
  },
  mounted() {
    this.getProjectList();
  },
  methods: {
    ...mapActions(['searchProjectWithFlow']),
    showModal(value) {
      this.openModal = true;
      this.modalInfo = { ...value };
    },
    async getProjectList() {
      this.$emit('loading', true)
      try {
        const { data } = await this.searchProjectWithFlow({
          projectUUID: this.getProjectSelected
        });
        this.projectList = data;

        localStorage.setItem('in_project', JSON.stringify(data.map(({ uuid, version_default }) => ({
          repository_uuid: uuid,
          repository_version: version_default.id,
          project_uuid: this.getProjectSelected,
          organization: this.getOrgSelected,
        }))));
      } catch (err) {
        this.error = err;
      } finally {
        // this.loading = false;
        this.$emit('loading', false)
      }
    },
    createNewIntelligence() {
      this.$router.push({
        name: 'new'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.loading {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $unnnic-color-neutral-cloudy;
}
.home-intelligences-from-project {
  &__content {
    margin: auto;
    width: 50%;
    height: 50vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;

    &__text {
      margin-bottom: 2.25rem;
    }

    &__button * {
      width: 21.625rem;
    }
  }

  &__cards {
    display: grid;
    justify-content: space-between;
    grid-template-columns: repeat(3, 33%);
    gap: 1rem;
    @media screen and (max-width: 1400px) {
      grid-template-columns: repeat(3, 33%);
    }

    // &__new {
    //   height: 260px;
    // }
  }

  &__wrapper {
    display: grid;
    // grid-template-columns: 1fr 2fr;
    margin: 1.5rem;
    gap: 1rem;
  }
}
</style>
