<template>
  <div>
    <div class="home">
      <section class="home__header">
          <unnnic-card
            :title="$t('webapp.intelligences_lib.title')"
            icon="science-fiction-robot-1"
            type="title"
            :has-information-icon="false"
            scheme="aux-blue"/>
      </section>

      <home-tab-navigation @changeTabValue="onTabSelected"/>
      <div :class="[loading ? 'hidden' : 'visible']">
        <home-intelligence-from-community
          @loading="loading = $event"
          v-show="howTabIsShown === 0"/>

        <home-intelligence-from-project
          @loading="loading = $event"
          v-show="howTabIsShown === 1"/>

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
    </div>

  </div>
</template>

<script>
import HomeTabNavigation from '@/components/repository/home/HomeTabNavigation';
import HomeIntelligenceFromProject from '@/components/repository/home/HomeIntelligenceFromProject';
import HomeIntelligenceFromCommunity from '../components/repository/home/HomeIntelligenceFromCommunity';
import HomeIntelligenceFromOrg from '../components/repository/home/HomeIntelligenceFromOrg';

export default {
  name: 'Home',
  components: {
    HomeTabNavigation,
    HomeIntelligenceFromProject,
    HomeIntelligenceFromOrg,
    HomeIntelligenceFromCommunity
  },
  data() {
    return {
      howTabIsShown: 0,
      update: false,
      loading: false
    };
  },
  methods: {
    onTabSelected(event) {
      this.howTabIsShown = event
      this.update = !this.update
    }
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

    &__header{
      padding: $unnnic-inline-md;
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
</style>
