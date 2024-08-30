<template>
  <section
    v-if="counter === 0 && status === 'complete'"
    :class="['files-list__no_list_container', `files-list--shape-${shape}`]"
  >
    <section class="files-header">
      <UnnnicIcon
        class="text-icon"
        :icon="defaultIcon"
        :filled="true"
        size="xl"
      />
      <UnnnicIntelligenceText
        v-if="shape === 'accordion'"
        v-bind="descriptionAttributes"
      >
        {{ description }}
      </UnnnicIntelligenceText>
      <UnnnicIntelligenceText
        v-if="shape === 'accordion'"
        v-bind="subDescriptionAttributes"
      >
        {{ subDescription }}
      </UnnnicIntelligenceText>

      <section class="container-add-btn">
        <UnnnicButton
          v-if="shape === 'accordion'"
          v-bind="btnAttributes"
          @click="$emit('add')"
        >
          {{ addText }}
        </UnnnicButton>
      </section>
    </section>
  </section>

  <section
    v-else
    class="files-list__container"
  >
    <section class="files-list__container__header">
      <section>
        <UnnnicIntelligenceText
          v-if="shape === 'accordion'"
          v-bind="descriptionAttributes"
        >
          {{ description }}
        </UnnnicIntelligenceText>
        <UnnnicIntelligenceText
          v-if="shape === 'accordion'"
          v-bind="subDescriptionAttributes"
        >
          {{ subDescription }}
        </UnnnicIntelligenceText>
      </section>
      <section class="container-add-btn">
        <UnnnicButton
          v-if="shape === 'accordion'"
          v-bind="btnAttributes"
          @click="$emit('add')"
        >
          {{ addText }}
        </UnnnicButton>
      </section>
    </section>

    <section v-if="!hideSearchInput">
      <UnnnicInput
        v-model="filterText"
        class="search-input"
        size="sm"
        :iconLeftClickable="true"
        iconLeft="search-1"
        :placeholder="$t('router.content.fields.search_placeholder')"
      />
    </section>

    <section
      :class="['files-list__content', `files-list__content--shape-${shape}`]"
    >
      <ContentItem
        v-for="file in itemsFiltered"
        :key="file.uuid"
        :file="file"
        :compressed="shape === 'accordion'"
        :clickable="canEditItem"
        @remove="$emit('remove', file)"
        @edit="$emit('edit', file)"
      />

      <div
        v-show="!['loading', 'complete'].includes(status)"
        ref="endOfListElement"
      />

      <template v-if="status !== 'complete'">
        <UnnnicSkeletonLoading
          v-for="i in 3"
          :key="i"
          tag="div"
          :height="shape === 'accordion' ? '64px' : '56px'"
        />
      </template>
    </section>
  </section>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch, toValue } from 'vue';
import ContentItem from '@/components/Brain/ContentBase/ContentItem.vue';
import BasesFormGenericListHeader from '@/views/repository/content/BasesFormGenericListHeader.vue';

export default {
  components: {
    ContentItem,
    BasesFormGenericListHeader,
  },
  props: {
    hideSearchInput: {
      type: Boolean,
    },
    description: {
      type: String,
      default: '',
    },
    subDescription: {
      type: String,
      default: '',
    },
    defaultIcon: {
      type: String,
      default: 'text_snippet',
    },
    addText: {
      type: String,
      default: '',
    },
    items: {
      type: Object,
      required: true,
    },
    canEditItem: Boolean,
    columns: {
      type: Number,
      default: 2,
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

  setup(props, { emit }) {
    const filterText = ref('');
    const endOfListElement = ref(null);
    const isShowingEndOfList = ref(false);
    const intersectionObserver = ref(null);

    const descriptionAttributes = {
      color: 'neutral-cloudy',
      family: 'secondary',
      size: 'body-gt',
      tag: 'p',
    };

    const subDescriptionAttributes = {
      class: 'text-sub-description',
      color: 'neutral-clean',
      family: 'secondary',
      size: 'body-md',
      tag: 'p',
    };

    const btnAttributes = {
      type: 'secondary',
      iconLeft: 'add-1',
      class: 'add-btn',
      'data-test': 'add-btn',
    };

    const status = computed(() => toValue(props.items.status));

    const counter = computed(() => {
      return toValue(props.items?.data)?.length || 0;
    });

    const itemsFiltered = computed(() => {
      const data = toValue(props.items?.data) || [];

      if (filterText.value) {
        return data.filter((item) =>
          item.created_file_name
            ?.toLowerCase()
            .includes(filterText.value.toLowerCase()),
        );
      }
      return data;
    });

    watch(
      [isShowingEndOfList, status],
      ([newIsShowingEndOfList, newStatusValue]) => {
        if (newIsShowingEndOfList && newStatusValue === null) {
          props.items.loadNext?.();
        }
      },
    );

    onMounted(() => {
      intersectionObserver.value = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isShowingEndOfList.value = entry.isIntersecting;
        });
      });

      if (endOfListElement.value) {
        intersectionObserver.value.observe(endOfListElement.value);
      }
    });

    onBeforeUnmount(() => {
      if (intersectionObserver.value && endOfListElement.value) {
        intersectionObserver.value.unobserve(endOfListElement.value);
      }
    });

    return {
      filterText,
      descriptionAttributes,
      subDescriptionAttributes,
      btnAttributes,
      status,
      counter,
      itemsFiltered,
      isShowingEndOfList,
      endOfListElement,
    };
  },
};
</script>

<style lang="scss" scoped>
.files-list {
  &__no_list_container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;

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
        margin-bottom: $unnnic-spacing-sm;
      }
    }
  }

  &__container {
    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: $unnnic-spacing-md;
      column-gap: $unnnic-spacing-sm;
    }
  }

  &--shape-accordion.files-list__no_list_container {
    height: 537px;
  }

  &__content {
    margin-top: $unnnic-spacing-sm;
    display: grid;
    gap: $unnnic-spacing-sm;
    grid-template-columns: repeat(v-bind(columns), 1fr);

    &--shape-accordion {
      column-gap: $unnnic-spacing-ant;
      row-gap: $unnnic-spacing-xs;
    }
  }
}
.container-add-btn {
  display: flex;
  justify-content: center;

  .add-btn {
    width: 12.5 * $unnnic-font-size;

    padding: $unnnic-spacing-ant $unnnic-spacing-sm + $unnnic-spacing-xs;
    :deep(.unnnic-icon__size--md) {
      height: $unnnic-icon-size-ant;
      width: $unnnic-icon-size-ant;
      min-width: $unnnic-icon-size-ant;
      min-height: $unnnic-icon-size-ant;
    }
  }
}
.search-input {
  :deep(.input) {
    outline-color: $unnnic-color-neutral-cleanest;
  }
}
</style>
