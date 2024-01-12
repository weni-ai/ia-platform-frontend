<template>
  <div class="intelligences-filters">
    <div>
      {{ $t('intelligences.filter_label') }}
    </div>

    <unnnic-select-smart
      v-if="category !== undefined"
      size="sm"
      :value="category"
      @input="$emit('update:category', $event)"
      :options="categories"
    />

    <unnnic-input
      class="search-input"
      :value="name"
      @input="$emit('update:name', $event)"
      size="sm"
      icon-left="search-1"
      :placeholder="$t('intelligences.search_intelligence_placeholder')"
    />

    <unnnic-radio
      :global-value="type"
      @change="$emit('update:type', $event)"
      value="generative"
    >
      {{ $t('intelligences.filter_type_generative_label') }}
    </unnnic-radio>

    <unnnic-radio
      :global-value="type"
      @change="$emit('update:type', $event)"
      value="classification"
    >
      {{ $t('intelligences.filter_type_classification_label') }}
    </unnnic-radio>
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
        console.log('here', this.$store.state.Category.allCategories);

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
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

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
