<template>
  <div>
    <div class="intelligences-list">
      <intelligence-from-project-item
        v-for="project in $store.state.Repository.publicIntelligences.data"
        :key="project.uuid"
        :project="project"
      />

      <template v-if="$store.state.Repository.publicIntelligences.status === 'loading'">
        <unnnic-skeleton-loading
          v-for="i in 3"
          :key="i"
          tag="div"
          height="230px"
        />
      </template>

      <div
        v-show="$store.state.Repository.publicIntelligences.status !== 'loading'"
        ref="end-of-list-element"
      ></div>
    </div>
  </div>
</template>

<script>
import repository from '../../api/repository';
import IntelligenceFromProjectItem from '../repository/home/IntelligenceFromProjectItem';

export default {
  components: {
    IntelligenceFromProjectItem,
  },

  data() {
    return {
      isShowingEndOfList: false,

      publicIntelligences: {
        limit: 20,
        offset: 0,
        data: [],
        next: null,
        status: null,
      },
    };
  },

  mounted() {
    this.loadIntelligences();

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

  watch: {
    isShowingEndOfList() {
      console.log('changed', this.isShowingEndOfList);
      if (
        this.isShowingEndOfList
        && this.$store.state.Repository.publicIntelligences.status !== 'complete'
      ) {
        this.loadIntelligences();
      }
    },
  },

  methods: {
    async loadIntelligences() {
      try {
        this.$store.state.Repository.publicIntelligences.status = 'loading';

        const { data } = await repository.listPublicIntelligences({
          next: this.$store.state.Repository.publicIntelligences.next,
          limit: this.$store.state.Repository.publicIntelligences.limit,
          offset: this.$store.state.Repository.publicIntelligences.offset,
        });

        this.$store.state.Repository.publicIntelligences.data = [
          ...this.$store.state.Repository.publicIntelligences.data,
          ...data.results,
        ];

        this.$store.state.Repository.publicIntelligences.next = data.next;

        if (!data.next) {
          this.$store.state.Repository.publicIntelligences.status = 'complete';
        }
      } finally {
        if (this.$store.state.Repository.publicIntelligences.status === 'loading') {
          this.$store.state.Repository.publicIntelligences.status = null;
        }
      }
    },
  },
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

</style>
