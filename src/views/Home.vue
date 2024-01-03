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

        <unnnic-button @click="createNewIntelligence" class="create-ia-button" iconLeft="add-1">
          Criar Inteligência
        </unnnic-button>
      </section>

      <unnnic-tab size="md" v-model="tab" :tabs='["own_intelligences","public_intelligences"]'>
        <template slot="tab-head-own_intelligences">
          {{ $t('intelligences.own_intelligences') }}
        </template>

        <template slot="tab-panel-own_intelligences">
          <div class="filters">
            <div class="u font secondary body-gt">
              Filtrar:
            </div>
            <div>
              <unnnic-select
                placeholder="Categorias"
                size="sm"
              />
            </div>

                <unnnic-input
                  icon-left="search-1"
                  placeholder="Pesquisar inteligência"
                />
          </div>

          <div :class="[loading ? 'hidden' : 'visible']">

            <home-intelligence-from-org
              @loading="loading = $event"
              :key="update"
              v-show="howTabIsShown === 2"/>

          </div>

          <div :class="['home-loading', !loading ? 'hidden' : 'visible']">
            <div v-if="howTabIsShown === 0" class="home-loading__project">
              <unnnic-skeleton-loading tag="div" class="mb-5" width="510px" height="46px" />

              <div class="home-loading__cards">
                <unnnic-skeleton-loading tag="div" width="31vw" height="480px" />
                <unnnic-skeleton-loading tag="div" width="31vw" height="260px" />
                <unnnic-skeleton-loading tag="div" width="31vw" height="260px" />
              </div>
            </div>

            <div v-if="howTabIsShown !== 0" class="home-loading__cards">
              <unnnic-skeleton-loading tag="div" width="31vw" height="260px" />
              <unnnic-skeleton-loading tag="div" width="31vw" height="260px" />
              <unnnic-skeleton-loading tag="div" width="31vw" height="260px" />
            </div>

          </div>
        </template>

        <template slot="tab-head-public_intelligences">
          {{ $t('intelligences.public_intelligences') }}
        </template>

        <template slot="tab-panel-public_intelligences">
        </template>
      </unnnic-tab>


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

    <unnnic-modal-next
        v-if="openModal"
      >
        <create-repository-form
          @cancelCreation="openModal = false"
        />
      </unnnic-modal-next>

  </div>
</template>

<script>
import HomeTabNavigation from '@/components/repository/home/HomeTabNavigation';
import HomeIntelligenceFromProject from '@/components/repository/home/HomeIntelligenceFromProject';
import HomeIntelligenceFromCommunity from '../components/repository/home/HomeIntelligenceFromCommunity';
import HomeIntelligenceFromOrg from '../components/repository/home/HomeIntelligenceFromOrg';
import CreateRepositoryForm from '../components/repository/CreateRepository/CreateRepositoryForm';

export default {
  name: 'Home',
  components: {
    HomeTabNavigation,
    HomeIntelligenceFromProject,
    HomeIntelligenceFromOrg,
    HomeIntelligenceFromCommunity,
    CreateRepositoryForm
  },
  data() {
    return {
      tab: 'own_intelligences',
      howTabIsShown: 2,
      update: false,
      loading: false,
      openModal: false
    };
  },
  methods: {
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
@import '~@/assets/scss/utilities.scss';
@import '~@/assets/scss/variables.scss';
@import '~@weni/unnnic-system/dist/unnnic.css';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

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
      margin-bottom: $unnnic-spacing-stack-sm;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: $unnnic-spacing-stack-sm;
      padding: 0 $unnnic-spacing-md;

      .unnnic-form {
        flex: 1;
        min-width: 14rem;
      }
    }
    ::v-deep {
      .text-input.size--sm .icon-right {
        top: 15px;
      }

      .input.size-md {
        height: auto;
      }

      .unnnic-modal.type-default .container {
        max-width: 750px;
      }
    }
</style>
