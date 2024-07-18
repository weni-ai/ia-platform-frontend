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

        <template v-if="status === 'loading'">
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
          v-show="!['loading', 'complete'].includes(status)"
          ref="end-of-list-element"
        ></div>
      </section>
    </section>
  </section>
</template>

<script>
import { toValue } from 'vue';
import BasesFormFilesItem from './BasesFormFilesItem.vue';
import BasesFormGenericListHeader from './BasesFormGenericListHeader.vue';

export default {
  components: {
    BasesFormFilesItem,
    BasesFormGenericListHeader,
  },
  props: {
    title: {
      type: String,
      default: '',
      required: false,
    },
    description: {
      type: String,
      default: '',
      required: false,
    },
    addText: {
      type: String,
      default: '',
      required: false,
    },
    items: {
      type: Object,
      required: true,
    },
    canEditItem: Boolean,
    hideCounter: Boolean,
    hideToggle: Boolean,
    filterItem: {
      type: Function,
      default: null,
    },

    shape: {
      type: String,
      default: 'normal',
      validator(value) {
        return ['normal', 'accordion'].includes(value);
      },
    },
  },

  emits: ['add', 'remove', 'edit'],

  data() {
    return {
      open: true,
      isShowingEndOfList: false,
      intersectionObserver: null,
    };
  },

  computed: {
    status() {
      return toValue(this.items.status);
    },

    counter() {
      const next = toValue(this.items.next);

      return String(
        next ? `${this.itemsFiltered.length}+` : this.itemsFiltered.length,
      );
    },

    itemsFiltered() {
      const data = toValue(this.items.data);

      if (this.filterItem) {
        return data.filter(this.filterItem);
      }

      return data;
    },
  },

  watch: {
    isShowingEndOfList() {
      if (this.isShowingEndOfList && this.status === null) {
        this.items.loadNext?.();
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
