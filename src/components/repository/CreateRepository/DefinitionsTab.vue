<template>
  <div class="create-repository__definitions">
    <div class="create-repository__definitions__wrapper">
      <section
        v-if="repository_type === 'classifier'"
        class="create-repository__definitions__wrapper__fields"
      >
        <UnnnicLabel :label="$t('webapp.create_repository.language_label')" />
        <UnnnicSelect
          class="unnic--clickable"
          size="sm"
          :placeholder="$t('webapp.create_repository.language_placeholder')"
          :value="language"
          @input="$emit('update:language', $event)"
          search
          :searchPlaceholder="
            $t('webapp.create_repository.language_placeholder_search')
          "
        >
          <option
            v-for="language in languages"
            :value="language.value"
            :key="language.id"
            size="sm"
          >
            {{ language.title }}
          </option>
        </UnnnicSelect>
      </section>

      <div
        v-if="repository_type === 'classifier'"
        class="intelligence-private-or-public"
      >
        <UnnnicCard
          clickable
          :title="$t('webapp.create_repository.privacy_type_public_title')"
          :description="
            $t('webapp.create_repository.privacy_type_public_description')
          "
          type="content"
          icon="lock-unlock-1-1"
          class="intelligence-private-or-public__item"
          :enabled="!is_private"
          @click.native="$emit('update:is_private', false)"
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
          :enabled="is_private"
          @click.native="$emit('update:is_private', true)"
        />
      </div>

      <section v-if="repository_type === 'classifier'">
        <UnnnicLabel :label="$t('webapp.create_repository.category_label')" />

        <div class="categories-list">
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
            v-else
            v-for="category in categoryList"
            :key="category.id"
            :text="category.name"
            :disabled="categories.includes(category.id)"
            @click.native="
              $emit(
                'update:categories',
                categories.includes(category.id)
                  ? categories.filter((id) => id !== category.id)
                  : [...categories, category.id],
              )
            "
            clickable
            type="brand"
          />
        </div>
      </section>

      <section class="create-repository__definitions__buttons">
        <UnnnicButton
          type="tertiary"
          class="create-repository__definitions__buttons__btn"
          @click.native="dispatchBackModal()"
        >
          {{ $t('webapp.create_repository.cancel_create_intelligence_button') }}
        </UnnnicButton>

        <UnnnicButton
          class="create-repository__definitions__buttons__btn"
          @click.native="dispatchCreateRepository()"
          :disabled="disabledSubmit"
        >
          {{ $t('webapp.create_repository.create_intelligence_button') }}
        </UnnnicButton>
      </section>

      <!-- <unnnic-card
      class="create-repository__definitions__info-card"
      type="default"
      title="Sobre a WeniGPT - IA Generativa"
      description="Crie bases de conteúdo e a IA Generativa será capaz de responder perguntas
       baseada nesse conteúdo sem treinamento. Ideal para textos informativos e FAQs."
      scheme="feedback-yellow"
      /> -->
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { LANGUAGES } from '@/utils/index';
import Loading from '@/components/shared/Loading';

export default {
  name: 'DefinitionsTab',
  props: {
    disabledSubmit: Boolean,
    repository_type: String,
    language: String,
    is_private: Boolean,
    categories: Array,
  },
  components: {
    Loading,
  },
  data() {
    return {
      categoryListLoading: false,
      categoryList: [],
    };
  },

  mounted() {
    this.getCategories();
  },
  computed: {
    languages() {
      return Object.keys(LANGUAGES).map((lang, index) => ({
        id: index + 1,
        title: LANGUAGES[lang],
        value: lang,
      }));
    },
  },
  methods: {
    ...mapActions(['getAllCategories']),
    async getCategories() {
      this.categoryListLoading = true;
      try {
        const { data } = await this.getAllCategories();
        const sortedData = data.sort((previous, next) => previous.id - next.id);
        this.categoryList = sortedData;
      } catch (error) {
        this.$buefy.toast.open({
          message: error,
          type: 'is-danger',
        });
      } finally {
        this.categoryListLoading = false;
      }
    },
    dispatchCreateRepository() {
      this.$emit('createRepository');
    },
    dispatchBackModal() {
      this.$emit('backModal');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.intelligence-private-or-public {
  display: flex;
  gap: $unnnic-spacing-xs;

  &__item {
    flex: 1;

    ::v-deep .unnnic-card-content__content__title {
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

    &__buttons {
      display: flex;
      justify-content: space-between;
      margin-top: $unnnic-spacing-lg;

      &__btn {
        width: 47%;
      }
    }

    &__info-card {
      border: 1px solid $unnnic-color-weni-200;
      background: $unnnic-color-weni-100;

      ::v-deep {
        .unnnic-card-default__description {
          white-space: unset;
          overflow: unset;
          text-overflow: unset;
          max-width: unset;
        }
      }
    }
  }
}
</style>
