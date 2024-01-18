<template>
  <div>
    <div :class="['home', `page--${$route.name}`]">
      <section class="home__header">
        <div>
          <unnnic-card
            :title="$t('webapp.intelligences_lib.title')"
            icon="neurology"
            type="title"
            :has-information-icon="false"
            scheme="aux-blue"
          />
          <div
            class="description unnnic-font secondary body-gt color-neutral-dark"
            v-html="$t('webapp.intelligences_lib.description')"
          />
        </div>

        <unnnic-button
          v-if="!(tab === 'own_intelligences' && isListEmpty)"
          @click="createNewIntelligence"
          class="create-ia-button"
          iconLeft="add-1"
        >
          {{ $t('intelligences.create_button') }}
        </unnnic-button>
      </section>

      <unnnic-tab size="md" v-model="tab" :tabs='["own_intelligences","public_intelligences"]'>
        <template slot="tab-head-own_intelligences">
          {{ $t('intelligences.own_intelligences') }}
        </template>

        <template slot="tab-head-public_intelligences">
          {{ $t('intelligences.public_intelligences') }}
        </template>
      </unnnic-tab>

      <div v-show="tab === 'own_intelligences'">
        <intelligences-filter
          class="filters"
          :name.sync="filterIntelligenceName"
          :type.sync="fitlerIntelligenceType"
        />

        <div v-if="isListEmpty" class="intelligences-list--empty">
          <img src="../assets/imgs/doris-doubt-reaction.png" alt="Doris Doubt Reaction">

          <h1 class="intelligences-list__title">
            {{ $t('intelligences.no_intelligence_added') }}
          </h1>

          <unnnic-button @click="createNewIntelligence" class="create-ia-button" iconLeft="add-1">
            {{ $t('intelligences.create_button') }}
          </unnnic-button>
        </div>

        <div v-else class="intelligences-list">
          <intelligence-from-project-item
            v-for="project in intelligences"
            :key="project.uuid"
            :project="project"
          />

          <template v-if="isLoading">
            <unnnic-skeleton-loading v-for="i in 3" :key="i" tag="div" height="230px" />
          </template>

          <div v-show="!isLoading" ref="end-of-list-element"></div>
        </div>
      </div>

      <intelligences-public-list v-show="tab === 'public_intelligences'" />

      <!-- <unnnic-tab
        class="home__intelligences"
        initialTab="first"
        :tabs="['first', 'second']"
      >
        <template slot="tab-head-first">
          {{ $t('webapp.intelligences_lib.tab_org_title') }}
        </template>
        <template slot="tab-panel-first">
          <home-intelligence-from-org
            @loading="loading = $event"
            :key="update"
          />
        </template>
        <template slot="tab-head-second">
          {{ $t('webapp.intelligences_lib.tab_community_title') }}
        </template>
        <template slot="tab-panel-second">
          <home-intelligence-from-community
            @loading="loading = $event"
          />
        </template>
      </unnnic-tab> -->
    </div>

    <modal-next
      v-if="openModal"
      :title="$t('webapp.create_repository.intelligence')"
      max-width="750px"
    >
      <create-repository-form
        @cancelCreation="openModal = false"
      />
    </modal-next>
  </div>
</template>

<script>
import HomeTabNavigation from '@/components/repository/home/HomeTabNavigation';
import HomeIntelligenceFromProject from '@/components/repository/home/HomeIntelligenceFromProject';
import HomeIntelligenceFromCommunity from '../components/repository/home/HomeIntelligenceFromCommunity';
import HomeIntelligenceFromOrg from '../components/repository/home/HomeIntelligenceFromOrg';
import CreateRepositoryForm from '../components/repository/CreateRepository/CreateRepositoryForm';
import { mapActions } from 'vuex';
import IntelligenceFromProjectItem from '../components/repository/home/IntelligenceFromProjectItem';
import IntelligenceFromOrgItem from '../components/repository/home/IntelligenceFromOrgItem';
import IntelligencesPublicList from '../components/intelligences/IntelligencesPublicList';
import IntelligencesFilter from '../components/intelligences/IntelligencesFilter';
import ModalNext from '../components/ModalNext';
import RemoveBulmaMixin from '../utils/RemoveBulmaMixin';

export default {
  name: 'Home',
  components: {
    HomeTabNavigation,
    HomeIntelligenceFromProject,
    HomeIntelligenceFromOrg,
    HomeIntelligenceFromCommunity,
    CreateRepositoryForm,
    IntelligenceFromProjectItem,
    IntelligenceFromOrgItem,
    IntelligencesPublicList,
    IntelligencesFilter,
    ModalNext,
  },
  mixins: [RemoveBulmaMixin],
  data() {
    return {
      filterIntelligenceName: '',
      fitlerIntelligenceType: 'generative',
      tab: 'own_intelligences',
      howTabIsShown: 2,
      update: false,
      loading: false,
      openModal: false,
      category: [],
      categories: [
        {
          value: '',
          label: this.$t('intelligences.categories_placeholder'),
        },
        {
          value: '1',
          label: 'Option 1',
        },
        {
          value: '2',
          label: 'Option 2',
          description: 'This is the first option'
        },
      ],

      intelligencesFromProject: {
        data: [],
        status: null,
      },

      intelligencesFromOrg: {
        limit: 20,
        offset: 0,
        owner_id: this.$store.getters.getOrgSelected,
        data: [],
        next: null,
        status: null,
      },

      intersectionObserver: null,
      isShowingEndOfList: false,
    };
  },

  mounted() {
    this.loadIntelligencesFromProject();
    this.loadIntelligencesFromOrg();

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isShowingEndOfList = entry.isIntersecting;
      });
    });

    this.intersectionObserver.observe(this.$refs['end-of-list-element']);
  },

  beforeDestroy() {
    this.intersectionObserver.unobserve(this.$refs['end-of-list-element']);
  },

  computed: {
    intelligences() {
      const data = this.intelligencesFromProject.data.concat(this.intelligencesFromOrg.data.filter(
        ({ uuid }) => !this.intelligencesFromProject.data
          .some(intelligenceFromProject => uuid === intelligenceFromProject.uuid)
      )).filter(intelligence => intelligence.repository_type === ({
        generative: 'content',
        classification: 'classifier',
      }[this.fitlerIntelligenceType])).filter(intelligence => {
        if (this.filterIntelligenceName) {
          return String(intelligence.name)
            .toLocaleLowerCase()
            .includes(this.filterIntelligenceName.toLowerCase());
        }

        return true;
      })

      return data;
    },

    isLoading() {
      return this.intelligencesFromProject.status === 'loading' || this.intelligencesFromOrg.status === 'loading';
    },

    isListEmpty() {
      return this.intelligencesFromProject.status === 'complete'
        && this.intelligencesFromOrg.status === 'complete'
        && this.intelligences.length === 0;
    },
  },

  watch: {
    isShowingEndOfList() {
      if (this.isShowingEndOfList && this.intelligencesFromOrg.status !== 'complete') {
        this.loadIntelligencesFromOrg();
      }
    },
  },

  methods: {
    ...mapActions(['searchProjectWithFlow', 'getRepositories']),

    async loadIntelligencesFromProject() {
      try {
        this.intelligencesFromProject.status = 'loading';

        const { data } = await this.searchProjectWithFlow({
          projectUUID: this.$store.getters.getProjectSelected
        });

        this.intelligencesFromProject.data = data;

        localStorage.setItem('in_project',
          JSON.stringify(data.map(({ uuid, version_default }) => ({
            repository_uuid: uuid,
            repository_version: version_default.id,
            project_uuid: this.$store.getters.getProjectSelected,
            organization: this.$store.getters.getOrgSelected,
          }))));
      } finally {
        this.intelligencesFromProject.status = 'complete';
      }
    },

    async loadIntelligencesFromOrg() {
      try {
        this.intelligencesFromOrg.status = 'loading';

        const { data } = await this.getRepositories({
          limit: this.intelligencesFromOrg.limit,
          offset: this.intelligencesFromOrg.offset,
          owner_id: this.intelligencesFromOrg.owner_id,
          next: this.intelligencesFromOrg.next,
        });

        this.intelligencesFromOrg.data = [...this.intelligencesFromOrg.data, ...data.results];
        this.intelligencesFromOrg.next = data.next;

        if (!data.next) {
          this.intelligencesFromOrg.status = 'complete';
        }
      } finally {
        if (this.intelligencesFromOrg.status === 'loading') {
          this.intelligencesFromOrg.status = null;
        }
      }
    },

    onTabSelected(event) {
      this.howTabIsShown = event
      this.update = !this.update
    },
    createNewIntelligence() {
      // this.$router.push({
      //   name: 'new',
      // });
      this.openModal = true
    },
  }
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.intelligences-list {
  display: grid;
  gap: $unnnic-spacing-sm;
  grid-template-columns: repeat(auto-fill, minmax(20.625 * $unnnic-font-size, 1fr));

  &--empty {
    padding-top: $unnnic-spacing-sm;

    display: flex;
    flex-direction: column;
    align-items: center;

    .create-ia-button {
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

.home {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: $unnnic-color-background-snow;

  &.page--home {
    padding: $unnnic-spacing-md $unnnic-font-size * 8;

    .home__header {
      padding: 0;
    }

    .filters {
      padding-inline: 0;
    }
  }

    &__header{
      padding: $unnnic-inline-md;
      padding-bottom: $unnnic-spacing-stack-sm;
      margin-bottom: $unnnic-spacing-lg;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: $unnnic-spacing-sm;

      .create-ia-button {
        min-width: 18.75 * $unnnic-font-size;
      }

      .description {
        margin-top: $unnnic-spacing-stack-sm;

        ::v-deep a {
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: $unnnic-font-weight-bold;
          color: inherit;
        }
      }
    }

    &__intelligences {
      margin: $unnnic-spacing-stack-sm $unnnic-spacing-stack-md $unnnic-spacing-stack-md;
    }
}
.home-loading {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100vh;
  padding-bottom: $unnnic-spacing-stack-sm;
  background: white;
  padding: 1.5rem 1.75rem;

  &__title {
    margin: $unnnic-spacing-inline-xs 0;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-inline-sm;
    height: 80px;
  }

  &__description {
    display: flex;
    justify-content: space-between;
  }

  &__cards {
    display: flex;
    justify-content: space-between;
  }
}

.hidden {
  display: none;
}

.filters {
  margin-bottom: $unnnic-spacing-md;
    }
    ::v-deep {
      // .text-input.size--sm .icon-right {
      //   top: 15px;
      // }

      .input.size-md {
        height: auto;
      }

      .unnnic-modal.type-default .container {
        max-width: 750px;
      }
    }
</style>
