<template>
  <div class="intelligences-filters">
    <div>
      {{ $t('intelligences.filter_label') }}
    </div>

    <UnnnicSelectSmart
      v-if="category !== undefined"
      size="sm"
      :modelValue="category"
      :options="categories"
      @update:model-value="$emit('update:category', $event)"
    />

    <UnnnicInput
      class="search-input"
      :modelValue="name"
      size="sm"
      iconLeft="search-1"
      :placeholder="$t('intelligences.search_intelligence_placeholder')"
      @update:model-value="$emit('update:name', $event)"
    />

    <UnnnicRadio
      :globalValue="type"
      modelValue="generative"
      @change="$emit('update:type', $event)"
    >
      {{ $t('intelligences.filter_type_generative_label') }}
    </UnnnicRadio>

    <UnnnicRadio
      :globalValue="type"
      modelValue="classification"
      @change="$emit('update:type', $event)"
    >
      {{ $t('intelligences.filter_type_classification_label') }}
    </UnnnicRadio>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  props: {
    name: String,
    type: String,
    category: Array,
  },

  data() {
    return {};
  },

  computed: {
    categories() {
      const placeholder = {
        value: '',
        label: this.$t('intelligences.categories_placeholder'),
      };

      if (this.$store.state.Category.allCategories) {
        return [placeholder].concat(
          this.$store.state.Category.allCategories.map((category) => ({
            value: category.id,
            label: category.name,
          })),
        );
      }

      return [placeholder];
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
