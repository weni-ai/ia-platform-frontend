<template>
  <div class="badges-without-styles">
    <div v-html="title" />
    <div class="badges-card__wrapper">
      <div>
        <IntentTag
          v-for="item in list"
          :key="item.value"
          :entityName="item.value"
          :count="item.examples__count"
          class="badges-card__wrapper__badge"
          @click.native="goToIntentList(item.id)"
        />
      </div>
    </div>
    <div v-if="examplesCount">
      <strong>{{ examplesCount }}</strong>
      {{ $t('webapp.dashboard.sentences') }}
    </div>
  </div>
</template>

<script>
import IntentTag from '@/components/repository/repository-evaluate/example/IntentTag';

export default {
  name: 'BadgesIntents',
  components: {
    IntentTag,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    repository: {
      type: Object,
      default: null,
    },
    list: {
      type: Array,
      default: () => [],
    },
    examplesCount: {
      type: Number,
      default: null,
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.list.sort((a, b) => a.value.localeCompare(b.value));
    });
  },
  methods: {
    goToIntentList(intent) {
      this.$router.push({ name: 'repository-intentlist', params: { intent } });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables.scss';
@import '@/assets/scss/colors.scss';

.badges-without-styles {
  // padding-top: .75rem;
  margin: 0.75rem -0.4rem;
  margin-bottom: 3rem;
}
.badges-card {
  padding: 0.75rem;
  margin: 0.75rem 0;
  border: 1px solid $color-border;
  border-radius: 6px;
  font-weight: bold;

  &__wrapper {
    margin: 0.75rem 0.5rem;

    &__badge {
      height: 2.188rem;
      margin: 1rem 1rem 0 0;
      padding: 0 1rem 0 1rem;
      line-height: calc(1.5rem - 4px);
      border-width: 1px;
      border-radius: 1rem;
      cursor: pointer;

      span {
        font-size: $font-small;
        font-family: $font-family;
        font-weight: $font-weight-normal;
      }
    }
  }
}
</style>
