<template>
  <div class="create-repository__definitions">
    <div class="create-repository__definitions__wrapper">
      <section class="create-repository__definitions__wrapper__fields">
        <UnnnicLabel :label="$t('webapp.create_repository.language_label')" />

        <UnnnicSelectSmart
          :modelValue="[languages.find(({ value }) => value === language)]"
          :options="languages"
          orderedByIndex
          autocomplete
          autocompleteClearOnFocus
          size="sm"
          @update:model-value="$emit('update:language', $event[0].value)"
        />
      </section>

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

      <section>
        <UnnnicLabel :label="$t('webapp.create_repository.category_label')" />

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
      </section>
    </div>
  </div>
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

.create-repository {
  padding: 2rem 4rem;
  background-color: $unnnic-color-background-snow;

  display: flex;
  justify-content: center;
  align-items: center;

  &__definitions {
    width: 100%;

    &__title {
      text-align: center;
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-primary;
      font-size: 1.5rem;
      margin-bottom: 2rem;
    }

    &__wrapper {
      &__fields {
        margin-bottom: 2rem;
      }
    }

    &__intelligence-privacy {
      margin-bottom: 2rem;

      &__cards {
        display: flex;
        justify-content: space-between;
        &__content {
          width: 47%;
        }
      }
    }

    &__info-card {
      border: 1px solid $unnnic-color-weni-200;
      background: $unnnic-color-weni-100;

      :deep(.unnnic-card-default__description) {
        white-space: unset;
        overflow: unset;
        text-overflow: unset;
        max-width: unset;
      }
    }
  }
}
</style>
