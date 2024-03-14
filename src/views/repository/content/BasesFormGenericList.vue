<template>
  <section class="files-list__container">
    <header class="files-list__header">
      <UnnnicIntelligenceText
        color="neutral-darkest"
        family="secondary"
        weight="bold"
        size="body-lg"
      >
        {{ title }}
        ({{ counter }})
      </UnnnicIntelligenceText>

      <UnnnicButton
        @click="$emit('add')"
        size="small"
        type="primary"
        class="files-list__header__button"
      >
        {{ addText }}
      </UnnnicButton>
    </header>

    <section class="files-list__content">
      <BasesFormFilesItem
        v-for="file in items.data"
        :key="file.uuid"
        :file="file"
        @remove="$emit('remove', file)"
      />

      <template v-if="items.status === 'loading'">
        <UnnnicSkeletonLoading
          v-for="i in 3"
          :key="i"
          tag="div"
          height="56px"
        />
      </template>

      <div
        v-show="!['loading', 'complete'].includes(items.status)"
        ref="end-of-list-element"
      ></div>
    </section>
  </section>
</template>

<script>
import BasesFormFilesItem from './BasesFormFilesItem.vue';

export default {
  props: {
    title: String,
    addText: String,
    items: Object,
  },

  components: {
    BasesFormFilesItem,
  },

  data() {
    return {
      isShowingEndOfList: false,
      intersectionObserver: null,
    };
  },

  computed: {
    counter() {
      return this.items.next ? '10+' : this.items.data.length;
    },
  },

  watch: {
    isShowingEndOfList() {
      if (this.isShowingEndOfList && this.items.status === null) {
        this.$emit('load-more');
      }
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

  beforeDestroy() {
    this.intersectionObserver.unobserve(this.$refs['end-of-list-element']);
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.files-list {
  &__container {
    height: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    margin-bottom: $unnnic-spacing-sm;
    justify-content: space-between;

    &__button {
      width: 12.5 * $unnnic-font-size;
    }
  }

  &__content {
    display: grid;
    gap: $unnnic-spacing-sm;
    grid-template-columns: repeat(
      auto-fill,
      minmax(16 * $unnnic-font-size, 1fr)
    );
  }
}
</style>
