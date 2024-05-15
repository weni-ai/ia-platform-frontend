<template>
  <div
    class="side-bar__container"
    @click.self="$emit('close')"
  >
    <div class="side-bar__content">
      <div class="side-bar__content__scrollable">
        <div class="side-bar__header">
          <div class="side-bar__header__title">
            {{ $t('intelligences.sidebar_view_content_bases_title', { name }) }}

            <UnnnicButton
              class="side-bar__header__title__close-button"
              size="small"
              type="tertiary"
              iconCenter="close"
              scheme="neutral-dark"
              @click="$emit('close')"
            />
          </div>

          <div class="side-bar__header__description">
            {{ $t('intelligences.sidebar_view_content_bases_description') }}
          </div>
        </div>

        <div class="content-bases-list">
          <UnnnicCard
            v-for="contentBase in contentBases.data"
            :key="contentBase.id"
            type="default"
            :title="contentBase.title"
            :description="contentBase.description"
          />

          <template v-if="contentBases.status === 'loading'">
            <UnnnicSkeletonLoading
              v-for="i in 3"
              :key="i"
              tag="div"
              height="124px"
            />
          </template>

          <div
            v-show="contentBases.status !== 'loading'"
            ref="end-of-list-element"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import nexusaiAPI from '../../../api/nexusaiAPI';

export default {
  props: {
    name: String,
    intelligenceUuid: String,
  },

  data() {
    return {
      contentBases: {
        limit: 20,
        offset: 0,
        repositoryUuid: this.intelligenceUuid,
        data: [],
        next: null,
        status: null,
      },

      intersectionObserver: null,
      isShowingEndOfList: false,
    };
  },

  mounted() {
    this.loadContentBases();

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
      if (this.isShowingEndOfList && this.contentBases.status !== 'complete') {
        this.loadContentBases();
      }
    },
  },

  methods: {
    ...mapActions(['getQAKnowledgeBasesNext']),

    async loadContentBases() {
      try {
        this.contentBases.status = 'loading';

        const { data } = await nexusaiAPI.listIntelligencesContentBases({
          intelligenceUuid: this.intelligenceUuid,
          next: this.contentBases.next,
        });

        this.contentBases.data = [...this.contentBases.data, ...data.results];
        this.contentBases.next = data.next;

        if (!data.next) {
          this.contentBases.status = 'complete';
        }
      } finally {
        if (this.contentBases.status === 'loading') {
          this.contentBases.status = null;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.content-bases-list {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-xs;
}

.side-bar {
  &__header {
    margin-bottom: $unnnic-spacing-lg;

    &__title {
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-title-sm;
      line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-bold;

      display: flex;
      align-items: center;
      gap: $unnnic-spacing-sm;
      justify-content: space-between;
      margin-bottom: $unnnic-spacing-sm;

      &__close-button {
        align-self: self-start;
      }
    }

    &__description {
      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-regular;
    }
  }

  &__container {
    z-index: 1;
    background: rgba(#262626, $unnnic-opacity-level-overlay);
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: flex-end;
  }

  &__content {
    flex: 1;
    max-width: 29 * $unnnic-font-size;
    background-color: $unnnic-color-background-snow;
    padding: $unnnic-spacing-md $unnnic-spacing-lg;
    box-sizing: border-box;
    display: flex;

    &__scrollable {
      flex: 1;
      overflow: overlay;

      $scroll-size: $unnnic-inline-nano;

      padding-right: $unnnic-inline-xs + $scroll-size;
      margin-right: -($unnnic-inline-xs + $scroll-size);

      &::-webkit-scrollbar {
        width: $scroll-size;
      }

      &::-webkit-scrollbar-thumb {
        background: $unnnic-color-neutral-clean;
        border-radius: $unnnic-border-radius-pill;
      }

      &::-webkit-scrollbar-track {
        background: $unnnic-color-neutral-soft;
        border-radius: $unnnic-border-radius-pill;
      }
    }
  }
}
</style>
