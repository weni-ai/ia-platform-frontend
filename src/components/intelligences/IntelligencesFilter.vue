<template>
  <div class="intelligences-filters">
    <div>
      {{ $t('intelligences.filter_label') }}
    </div>

    <UnnnicSelectSmart
      v-if="category !== undefined"
      size="sm"
      data-test="category-select"
      :modelValue="category"
      :options="categories"
      @update:model-value="$emit('update:category', $event)"
    />

    <UnnnicInput
      class="search-input"
      :modelValue="name"
      size="sm"
      iconLeft="search-1"
      data-test="name-input"
      :placeholder="$t('intelligences.search_intelligence_placeholder')"
      @update:model-value="$emit('update:name', $event)"
    />

    <UnnnicSkeletonLoading
      v-if="loadingType"
      tag="div"
      width="310px"
      height="22px"
      data-test="types-skeleton-loading"
    />

    <template v-else-if="showTypes">
      <UnnnicRadio
        :modelValue="type"
        value="generative"
        data-test="generative-radio"
        @update:model-value="$emit('update:type', $event)"
      >
        {{ $t('intelligences.filter_type_generative_label') }}
      </UnnnicRadio>

      <UnnnicRadio
        :modelValue="type"
        value="classification"
        data-test="classification-radio"
        @update:model-value="$emit('update:type', $event)"
      >
        {{ $t('intelligences.filter_type_classification_label') }}
      </UnnnicRadio>
    </template>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  props: {
    category: {
      type: Array,
      default: undefined,
    },
    name: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
    loadingType: Boolean,
    showTypes: {
      type: Boolean,
      default: true,
    },
  },

  emits: ['update:category', 'update:name', 'update:type'],

  computed: {
    categories() {
      const placeholder = {
        value: '',
        label: this.$t('intelligences.categories_placeholder'),
      };

      const options = [placeholder];

      if (this.$store.state.Category.allCategories) {
        options.push(
          ...this.$store.state.Category.allCategories.map((category) => ({
            value: category.id,
            label: category.name,
          })),
        );
      }

      return options;
    },
  },

  mounted() {
    this.getAllCategories();
  },

  methods: {
    ...mapActions(['getAllCategories']),
  },
};
</script>

<style lang="scss" scoped>
.intelligences-filters {
  display: flex;
  align-items: center;
  column-gap: $unnnic-spacing-sm;

  color: $unnnic-color-neutral-dark;
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  font-weight: $unnnic-font-weight-regular;

  .search-input {
    flex: 1;
  }
}
</style>
