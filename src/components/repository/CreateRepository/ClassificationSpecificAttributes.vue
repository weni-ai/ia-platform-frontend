<template>
  <UnnnicFormElement
    :label="$t('webapp.create_repository.language_label')"
    class="form-element"
  >
    <UnnnicSelectSmart
      :modelValue="[languages.find(({ value }) => value === language)]"
      :options="languages"
      orderedByIndex
      autocomplete
      autocompleteClearOnFocus
      @update:model-value="$emit('update:language', $event[0].value)"
    />
  </UnnnicFormElement>

  <section class="intelligence-private-or-public">
    <UnnnicCard
      clickable
      :title="$t('webapp.create_repository.privacy_type_public_title')"
      :description="
        $t('webapp.create_repository.privacy_type_public_description')
      "
      type="content"
      icon="lock-unlock-1-1"
      class="intelligence-private-or-public__item"
      data-test="set-as-public-card"
      :enabled="!isPrivate"
      @click="$emit('update:isPrivate', false)"
    />

    <UnnnicCard
      clickable
      :title="$t('webapp.create_repository.privacy_type_private_title')"
      :description="
        $t('webapp.create_repository.privacy_type_private_description')
      "
      type="content"
      icon="lock-2-1"
      class="intelligence-private-or-public__item"
      data-test="set-as-private-card"
      :enabled="isPrivate"
      @click="$emit('update:isPrivate', true)"
    />
  </section>

  <UnnnicFormElement :label="$t('webapp.create_repository.category_label')">
    <div
      class="categories-list"
      data-test="categories-list"
    >
      <template v-if="categoryListLoading">
        <UnnnicSkeletonLoading
          v-for="i in 10"
          :key="i"
          tag="div"
          :width="80 + Math.floor(Math.random() * 40) + 'px'"
          height="32px"
        />
      </template>

      <UnnnicTag
        v-for="category in categoryList"
        v-else
        :key="category.id"
        :text="category.name"
        :disabled="categories.includes(category.id)"
        clickable
        type="brand"
        :data-test="`category-${category.id}`"
        @click="
          $emit(
            'update:categories',
            categories.includes(category.id)
              ? categories.filter((id) => id !== category.id)
              : [...categories, category.id],
          )
        "
      />
    </div>
  </UnnnicFormElement>
</template>

<script>
import { mapActions } from 'vuex';
import { LANGUAGES } from '@/utils/index';

export default {
  name: 'DefinitionsTab',
  props: {
    repositoryType: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: '',
    },
    isPrivate: Boolean,
    categories: {
      type: Array,
      required: true,
    },
  },

  emits: ['update:language', 'update:isPrivate', 'update:categories'],

  data() {
    return {
      categoryListLoading: false,
      categoryList: [],
    };
  },
  computed: {
    languages() {
      return [
        {
          value: '',
          label: this.$t('webapp.create_repository.language_placeholder'),
        },
      ].concat(
        Object.keys(LANGUAGES).map((lang) => ({
          value: lang,
          label: LANGUAGES[lang],
        })),
      );
    },
  },

  mounted() {
    this.getCategories();
  },
  methods: {
    ...mapActions(['getAllCategories']),
    async getCategories() {
      this.categoryListLoading = true;
      try {
        const { data } = await this.getAllCategories();
        const sortedData = data.sort((previous, next) => previous.id - next.id);
        this.categoryList = sortedData;
      } finally {
        this.categoryListLoading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.intelligence-private-or-public {
  display: flex;
  gap: $unnnic-spacing-sm;

  &__item {
    flex: 1;

    :deep(.unnnic-card-content__content__title) {
      font-weight: $unnnic-font-weight-regular;
    }
  }
}

.categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: $unnnic-spacing-xs;
}

.form-element {
  width: 100%;
}
</style>
