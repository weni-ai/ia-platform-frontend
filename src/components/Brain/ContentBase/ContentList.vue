<template>
  <section :class="['files-list__container', `files-list--shape-${shape}`]">
    <section class="files-header">
      <UnnnicIcon
        class="text-icon"
        :icon="defaultIcon"
        :filled="true"
        size="xl"
      />
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
      <UnnnicIntelligenceText
        v-if="shape === 'accordion'"
        class="text-sub-description"
        color="neutral-clean"
        family="secondary"
        size="body-md"
        marginTop="xs"
        tag="p"
      >
        {{ subDescription }}
      </UnnnicIntelligenceText>

      <section class="container-add-btn">
        <UnnnicButton
          v-if="shape === 'accordion'"
          type="secondary"
          iconLeft="add-1"
          class="add-btn"
          data-test="add-btn"
          @click="$emit('add')"
        >
          {{ addText }}
        </UnnnicButton>
      </section>

      <section
        :class="['files-list__content', `files-list__content--shape-${shape}`]"
      >
        <UnnnicInput
          v-if="items.data.length > 0"
          size="md"
          :iconLeftClickable="true"
          iconLeft="search-1"
          :placeholder="$t('router.content.fields.search_placeholder')"
        />
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
import BasesFormFilesItem from '@/views/repository/content/BasesFormFilesItem.vue';
import BasesFormGenericListHeader from '@/views/repository/content/BasesFormGenericListHeader.vue';

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
    subDescription: {
      type: String,
      default: '',
      required: false,
    },
    defaultIcon: {
      type: String,
      default: 'text_snippet',
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
    display: flex;
    justify-content: center;
    align-items: center;

    .files-header {
      display: flex;
      flex-direction: column;
      align-items: center;

      .text-icon {
        font-size: 54px;
        color: $unnnic-color-neutral-soft;
      }

      .text-sub-description {
        margin-top: 0;
      }
    }
  }

  &--shape-accordion.files-list__container {
    height: 537px;
  }

  &__content {
    margin-top: $unnnic-spacing-sm;
    display: grid;
    gap: $unnnic-spacing-sm;
    grid-template-columns: repeat(
      auto-fill,
      minmax(16 * $unnnic-font-size, 1fr)
    );

    .container-add-btn {
      display: flex;
      justify-content: center;

      .add-btn {
        padding: $unnnic-spacing-ant $unnnic-spacing-sm + $unnnic-spacing-xs;
        :deep(.unnnic-icon__size--md) {
          height: $unnnic-icon-size-ant;
          width: $unnnic-icon-size-ant;
          min-width: $unnnic-icon-size-ant;
          min-height: $unnnic-icon-size-ant;
        }
      }
    }

    &--shape-accordion {
      column-gap: $unnnic-spacing-ant;
      row-gap: $unnnic-spacing-xs;
    }
  }
}
</style>
