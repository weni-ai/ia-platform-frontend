<template>
  <div>
    <IntelligencesFilter
      v-model:name="filterIntelligenceName"
      v-model:type="fitlerIntelligenceType"
      v-model:category="filterIntelligenceCategory"
      class="filters"
    />

    <div class="intelligences-list">
      <IntelligenceFromProjectItem
        v-for="project in intelligences"
        :key="project.uuid"
        :project="project"
      />

      <template
        v-if="$store.state.Repository.publicIntelligences.status === 'loading'"
      >
        <UnnnicSkeletonLoading
          v-for="i in 3"
          :key="i"
          tag="div"
          height="206px"
        />
      </template>

      <div
        v-show="
          $store.state.Repository.publicIntelligences.status !== 'loading'
        "
        ref="end-of-list-element"
      ></div>
    </div>
  </div>
</template>

<script>
import repository from '../../api/repository';
import IntelligenceFromProjectItem from '../repository/home/IntelligenceFromProjectItem.vue';
import IntelligencesFilter from './IntelligencesFilter.vue';

export default {
  components: {
    IntelligenceFromProjectItem,
    IntelligencesFilter,
  },

  data() {
    return {
      isShowingEndOfList: false,

      filterIntelligenceName: '',
      fitlerIntelligenceType: 'generative',
      filterIntelligenceCategory: [],

      publicIntelligences: {
        limit: 20,
        offset: 0,
        data: [],
        next: null,
        status: null,
      },
    };
  },

  computed: {
    intelligences() {
      const data = this.$store.state.Repository.publicIntelligences.data
        .filter(
          (intelligence) =>
            intelligence.repository_type ===
            {
              generative: 'content',
              classification: 'classifier',
            }[this.fitlerIntelligenceType],
        )
        .filter((intelligence) => {
          if (this.filterIntelligenceName) {
            return String(intelligence.name)
              .toLocaleLowerCase()
              .includes(this.filterIntelligenceName.toLowerCase());
          }

          return true;
        });

      return data;
    },
  },

  watch: {
    isShowingEndOfList() {
      if (
        this.isShowingEndOfList &&
        this.$store.state.Repository.publicIntelligences.status !== 'complete'
      ) {
        this.loadIntelligences();
      }
    },

    filterIntelligenceCategory() {
      this.$store.state.Repository.publicIntelligences = {
        limit: 20,
        offset: 0,
        data: [],
        next: null,
        status: null,
      };

      this.loadIntelligences();
    },
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

  beforeUnmount() {
    this.intersectionObserver.unobserve(this.$refs['end-of-list-element']);
  },

  methods: {
    async loadIntelligences() {
      try {
        this.$store.state.Repository.publicIntelligences.status = 'loading';

        const { data } = await repository.listPublicIntelligences({
          next: this.$store.state.Repository.publicIntelligences.next,
          limit: this.$store.state.Repository.publicIntelligences.limit,
          offset: this.$store.state.Repository.publicIntelligences.offset,

          params: {
            categories: this.filterIntelligenceCategory[0]?.label,
          },
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
        if (
          this.$store.state.Repository.publicIntelligences.status === 'loading'
        ) {
          this.$store.state.Repository.publicIntelligences.status = null;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.filters {
  margin-bottom: $unnnic-spacing-md;
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
</style>
