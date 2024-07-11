<template>
  <section :class="['files-list__container', `files-list--shape-${shape}`]">
    <BasesFormGenericListHeader
      v-model:open="open"
      :shape="shape"
      :title="title"
      :counter="hideCounter ? undefined : counter"
      :addText="addText"
      :hideToggle="hideToggle"
      @add="$emit('add')"
    />

    <section v-show="open">
      <UnnnicIntelligenceText
        v-if="shape === 'accordion'"
        color="neutral-cloudy"
        family="secondary"
        size="body-gt"
        marginTop="xs"
        tag="p"
      >
        {{ description }}
      </UnnnicIntelligenceText>

      <section
        :class="['files-list__content', `files-list__content--shape-${shape}`]"
      >
        <BasesFormFilesItem
          v-for="file in itemsFiltered"
          :key="file.uuid"
          :file="file"
          :compressed="shape === 'accordion'"
          :clickable="canEditItem"
          @remove="$emit('remove', file)"
          @click="$emit('edit', file)"
        />

        <template v-if="items.status === 'loading'">
          <UnnnicSkeletonLoading
            v-for="i in 3"
            :key="i"
            tag="div"
            :height="shape === 'accordion' ? '46px' : '56px'"
          />
        </template>

        <UnnnicButton
          v-if="shape === 'accordion'"
          type="secondary"
          iconLeft="add-1"
          @click="$emit('add')"
        >
          {{ addText }}
        </UnnnicButton>

        <div
          v-show="!['loading', 'complete'].includes(items.status)"
          ref="end-of-list-element"
        ></div>
      </section>
    </section>
  </section>
</template>

<script>
import BasesFormFilesItem from './BasesFormFilesItem.vue';
import BasesFormGenericListHeader from './BasesFormGenericListHeader.vue';

export default {
  components: {
    BasesFormFilesItem,
    BasesFormGenericListHeader,
  },
  props: {
    title: String,
    description: String,
    addText: String,
    items: Object,
    canEditItem: Boolean,
    hideCounter: Boolean,
    hideToggle: Boolean,
    filterItem: Function,

    shape: {
      type: String,
      default: 'normal',
      validator(value) {
        return ['normal', 'accordion'].includes(value);
      },
    },
  },

  data() {
    return {
      open: true,
      isShowingEndOfList: false,
      intersectionObserver: null,
    };
  },

  computed: {
    counter() {
      return String(
        this.items.next
          ? `${this.itemsFiltered.length}+`
          : this.itemsFiltered.length,
      );
    },

    itemsFiltered() {
      if (this.filterItem) {
        return this.items.data.filter(this.filterItem);
      }

      return this.items.data;
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

  beforeUnmount() {
    this.intersectionObserver.unobserve(this.$refs['end-of-list-element']);
  },

  methods: {
    toggleAccordionOpen() {
      if (this.shape !== 'accordion') {
        return;
      }

      this.open = !this.open;
    },
  },
};
</script>

<style lang="scss" scoped>
.files-list {
  &__container {
    height: 0;
  }

  &--shape-accordion.files-list__container {
    height: auto;
  }

  &__content {
    margin-top: $unnnic-spacing-sm;
    display: grid;
    gap: $unnnic-spacing-sm;
    grid-template-columns: repeat(
      auto-fill,
      minmax(16 * $unnnic-font-size, 1fr)
    );

    &--shape-accordion {
      column-gap: $unnnic-spacing-ant;
      row-gap: $unnnic-spacing-xs;
    }
  }
}
</style>
