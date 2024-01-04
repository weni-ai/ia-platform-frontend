<template>
  <div class="create-repository__definitions">
    <div class="create-repository__definitions__wrapper">
      <section class="create-repository__definitions__wrapper__fields">
        <unnnic-label :label="$t('webapp.create_repository.language_label')"/>
        <unnnic-select
          class="unnic--clickable"
          size="sm"
          :placeholder="$t('webapp.create_repository.language_placeholder')"
          v-model="definition.language"
          search
          :search-placeholder="$t('webapp.create_repository.language_placeholder_search')"
        >
          <option
            v-for="language in languages"
            :value="language.value"
            :key="language.id"
            size="sm"
          >
            {{ language.title }}
          </option>
        </unnnic-select>
      </section>

      <section class="create-repository__definitions__wrapper__fields">
        <unnnic-label :label="$t('webapp.create_repository.category_label')" />
        <unnnic-carousel
          :tagItems="categoryList"
          v-if="categoryList.length > 0"
          v-model="definition.categories"
        />
        <loading v-else />
      </section>


      <section class="create-repository__definitions__buttons">
        <unnnic-button
          type="tertiary"
          class="create-repository__definitions__buttons__btn"
          @click.native="dispatchBackModal()"
        >
          {{$t('webapp.create_repository.cancel_create_intelligence_button')}}
        </unnnic-button>

        <unnnic-button
          class="create-repository__definitions__buttons__btn"
          :disabled="!checkHasValue"
          @click.native="dispatchCreateRepository()"
        >
          {{$t('webapp.create_repository.create_intelligence_button')}}
        </unnnic-button>
      </section>

      <unnnic-card
      class="create-repository__definitions__info-card"
      type="default"
      title="Sobre a WeniGPT - IA Generativa"
      description="Crie bases de conteúdo e a IA Generativa será capaz de responder perguntas
       baseada nesse conteúdo sem treinamento. Ideal para textos informativos e FAQs."
      scheme="feedback-yellow"
      />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { LANGUAGES } from '@/utils/index';
import Loading from '@/components/shared/Loading';

export default {
  name: 'DefinitionsTab',
  components: {
    Loading
  },
  data() {
    return {
      definition: {
        language: '',
        isPrivate: true,
        categories: []
      },
      categoryList: []
    };
  },
  mounted() {
    this.getCategories();
  },
  computed: {
    checkHasValue() {
      return (
        this.definition.language !== ''
        && this.definition.isPrivate !== null
        && this.definition.categories.length > 0
      );
    },
    languages() {
      return Object.keys(LANGUAGES).map((lang, index) => ({
        id: index + 1,
        title: LANGUAGES[lang],
        value: lang
      }));
    }
  },
  methods: {
    ...mapActions(['getAllCategories']),
    async getCategories() {
      this.loading = true;
      try {
        const { data } = await this.getAllCategories();
        const sortedData = data.sort((previous, next) => previous.id - next.id);
        this.categoryList = sortedData;
      } catch (error) {
        this.$buefy.toast.open({
          message: error,
          type: 'is-danger'
        });
      } finally {
        this.loading = false;
      }
    },
    dispatchPreviousStep() {
      this.$emit('previousStep', this.definition);
    },
    dispatchCreateRepository() {
      this.$emit('createRepository', this.definition);
    },
    dispatchBackModal() {
      this.$emit('backModal');
    },
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.create-repository {
  padding: 2rem 4rem;
  background-color: $unnnic-color-background-snow;

  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: $mobile-width * 1.5) {
    flex-direction: column;
    align-items: center;
  }

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
      margin-bottom: 2rem;

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
