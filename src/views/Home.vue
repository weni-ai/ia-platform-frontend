<template>
  <div>
    <div :class="['home', `page--${$route.name}`]">
      <section class="home__header">
        <div>
          <UnnnicCard
            class="home__header__icon"
            :title="$t('webapp.intelligences_lib.title')"
            icon="neurology"
            type="title"
            :hasInformationIcon="false"
            scheme="weni-600"
          />
          <div
            class="description unnnic-font secondary body-gt color-neutral-dark"
            v-html="$t('webapp.intelligences_lib.description')"
          />
        </div>

        <UnnnicButton
          class="create-ia-button"
          iconLeft="add-1"
          @click="createNewIntelligence"
        >
          {{ $t('intelligences.create_button') }}
        </UnnnicButton>
      </section>

      <UnnnicTab
        v-model="tab"
        size="md"
        :tabs="['own_intelligences', 'public_intelligences']"
      >
        <template #tab-head-own_intelligences>
          {{ $t('intelligences.own_intelligences') }}
        </template>

        <template #tab-head-public_intelligences>
          {{ $t('intelligences.public_intelligences') }}
        </template>
      </UnnnicTab>

      <div v-show="tab === 'own_intelligences'">
        <IntelligencesFilter
          v-model:name="filterIntelligenceName"
          v-model:type="fitlerIntelligenceType"
          class="filters"
        />

        <div
          v-if="isListEmpty"
          class="intelligences-list--empty"
        >
          <img
            src="../assets/imgs/doris-doubt-reaction.png"
            alt="Doris Doubt Reaction"
          />

          <h1 class="intelligences-list__title">
            {{ $t('intelligences.no_intelligence_added') }}
          </h1>
        </div>

        <div
          v-else
          class="intelligences-list"
        >
          <IntelligenceFromProjectItem
            v-for="project in intelligences"
            :key="project.uuid"
            :project="project"
            @removed="removed(project.uuid)"
          />

          <template v-if="isLoading">
            <UnnnicSkeletonLoading
              v-for="i in 3"
              :key="i"
              tag="div"
              height="230px"
            />
          </template>

          <div
            v-show="!isLoading"
            ref="end-of-list-element"
          ></div>
        </div>
      </div>

      <IntelligencesPublicList v-show="tab === 'public_intelligences'" />

      <!-- <unnnic-tab
        class="home__intelligences"
        initialTab="first"
        :tabs="['first', 'second']"
      >
        <template #tab-head-first>
          {{ $t('webapp.intelligences_lib.tab_org_title') }}
        </template>
        <template #tab-panel-first>
          <home-intelligence-from-org
            @loading="loading = $event"
            :key="update"
          />
        </template>
        <template #tab-head-second>
          {{ $t('webapp.intelligences_lib.tab_community_title') }}
        </template>
        <template #tab-panel-second>
          <home-intelligence-from-community
            @loading="loading = $event"
          />
        </template>
      </unnnic-tab> -->
    </div>

    <ModalNext
      v-if="openModal"
      :title="$t('webapp.create_repository.intelligence')"
      maxWidth="750px"
      class="create-intelligence-modal"
    >
      <CreateRepositoryForm @cancelCreation="openModal = false" />
    </ModalNext>
  </div>
</template>

<script>
import CreateRepositoryForm from '../components/repository/CreateRepository/CreateRepositoryForm.vue';
import { mapActions } from 'vuex';
import IntelligenceFromProjectItem from '../components/repository/home/IntelligenceFromProjectItem.vue';
import IntelligencesPublicList from '../components/intelligences/IntelligencesPublicList.vue';
import IntelligencesFilter from '../components/intelligences/IntelligencesFilter.vue';
import ModalNext from '../components/ModalNext.vue';
import nexusaiAPI from '../api/nexusaiAPI';

export default {
  name: 'Home',
  components: {
    CreateRepositoryForm,
    IntelligenceFromProjectItem,
    IntelligencesPublicList,
    IntelligencesFilter,
    ModalNext,
  },
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
          description: 'This is the first option',
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

      intelligencesNexusAI: {
        firstLoad: true,
        orgUuid: this.$store.state.Auth.connectOrgUuid,
        data: [],
        next: null,
        status: null,
      },

      intersectionObserver: null,
      isShowingEndOfList: false,
    };
  },

  computed: {
    intelligences() {
      let items;

      if (this.fitlerIntelligenceType === 'generative') {
        items = this.intelligencesNexusAI.data;
      } else {
        items = this.intelligencesFromProject.data.concat(
          this.intelligencesFromOrg.data.filter(
            ({ uuid }) =>
              !this.intelligencesFromProject.data.some(
                (intelligenceFromProject) =>
                  uuid === intelligenceFromProject.uuid,
              ),
          ),
        );
      }

      return items.filter((intelligence) => {
        if (this.filterIntelligenceName) {
          return String(intelligence.name)
            .toLocaleLowerCase()
            .includes(this.filterIntelligenceName.toLowerCase());
        }

        return true;
      });
    },

    isLoading() {
      return (
        this.intelligencesFromProject.status === 'loading' ||
        this.intelligencesFromOrg.status === 'loading' ||
        this.intelligencesNexusAI.status === 'loading'
      );
    },

    isListEmpty() {
      if (this.fitlerIntelligenceType === 'generative') {
        return (
          this.intelligencesNexusAI.status === 'complete' &&
          this.intelligences.length === 0
        );
      }

      return (
        this.intelligencesFromProject.status === 'complete' &&
        this.intelligencesFromOrg.status === 'complete' &&
        this.intelligences.length === 0
      );
    },
  },

  watch: {
    isShowingEndOfList() {
      if (this.isShowingEndOfList) {
        if (
          this.fitlerIntelligenceType === 'classification' &&
          this.intelligencesFromOrg.status !== 'complete'
        ) {
          this.loadIntelligencesFromOrg();
        } else if (
          this.fitlerIntelligenceType === 'generative' &&
          this.intelligencesNexusAI.status !== 'complete'
        ) {
          this.loadIntelligencesNexusAI();
        }
      }
    },

    fitlerIntelligenceType: {
      immediate: true,

      handler() {
        if (
          this.fitlerIntelligenceType === 'classification' &&
          this.intelligencesFromProject.status === null
        ) {
          this.loadIntelligencesFromProject();
          this.loadIntelligencesFromOrg();
        } else if (
          this.fitlerIntelligenceType === 'generative' &&
          this.intelligencesNexusAI.firstLoad
        ) {
          this.intelligencesNexusAI.firstLoad = false;
          this.loadIntelligencesNexusAI();
        }
      },
    },
  },

  mounted() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isShowingEndOfList = entry.isIntersecting;
      });
    });

    this.intersectionObserver.observe(this.$refs['end-of-list-element']);
  },

  beforeUnmount() {
    this.intersectionObserver.unobserve(this.$refs['end-of-list-element']);
  },

  methods: {
    ...mapActions(['searchProjectWithFlow', 'getRepositories']),

    removed(intelligenceUuid) {
      this.intelligencesNexusAI.data = this.intelligencesNexusAI.data.filter(
        ({ uuid }) => intelligenceUuid !== uuid,
      );
    },

    async loadIntelligencesFromProject() {
      try {
        this.intelligencesFromProject.status = 'loading';

        const { data } = await this.searchProjectWithFlow({
          projectUUID: this.$store.getters.getProjectSelected,
        });

        this.intelligencesFromProject.data = data;

        localStorage.setItem(
          'in_project',
          JSON.stringify(
            data.map(({ uuid, version_default }) => ({
              repository_uuid: uuid,
              repository_version: version_default.id,
              project_uuid: this.$store.getters.getProjectSelected,
              organization: this.$store.getters.getOrgSelected,
            })),
          ),
        );
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

        this.intelligencesFromOrg.data = [
          ...this.intelligencesFromOrg.data,
          ...data.results.filter(
            ({ repository_type }) => repository_type === 'classifier',
          ),
        ];

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

    async loadIntelligencesNexusAI() {
      try {
        this.intelligencesNexusAI.status = 'loading';

        const { data } = await nexusaiAPI.listIntelligences({
          orgUuid: this.intelligencesNexusAI.orgUuid,
          next: this.intelligencesNexusAI.next,
        });

        this.intelligencesNexusAI.data = [
          ...this.intelligencesNexusAI.data,
          ...data.results.filter(({ is_router }) => !is_router),
        ];

        this.intelligencesNexusAI.next = data.next;

        if (!data.next) {
          this.intelligencesNexusAI.status = 'complete';
        }
      } finally {
        if (this.intelligencesNexusAI.status === 'loading') {
          this.intelligencesNexusAI.status = null;
        }
      }
    },

    onTabSelected(event) {
      this.howTabIsShown = event;
      this.update = !this.update;
    },
    createNewIntelligence() {
      // this.$router.push({
      //   name: 'new',
      // });
      this.openModal = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.home__header__icon :deep(.avatar-icon) {
  background-color: $unnnic-color-weni-100;
}

.home__header__icon :deep(.title) {
  font-weight: $unnnic-font-weight-bold;
}

.create-intelligence-modal {
  :deep(.create-intelligence-modal__container) {
    padding-bottom: $unnnic-spacing-md;
  }
}

.intelligences-list {
  display: grid;
  gap: $unnnic-spacing-sm;
  grid-template-columns: repeat(
    auto-fill,
    minmax(20.625 * $unnnic-font-size, 1fr)
  );

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
    padding: $unnnic-spacing-lg;

    .home__header {
      padding: 0;
    }

    .filters {
      padding-inline: 0;
    }
  }

  &__header {
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

      :deep(a) {
        text-decoration: underline;
        text-underline-offset: 3px;
        font-weight: $unnnic-font-weight-bold;
        color: inherit;
      }
    }
  }

  &__intelligences {
    margin: $unnnic-spacing-stack-sm $unnnic-spacing-stack-md
      $unnnic-spacing-stack-md;
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

:deep(.input.size-md) {
  height: auto;
}

:deep(.unnnic-modal.type-default .container) {
  max-width: 750px;
}
</style>
