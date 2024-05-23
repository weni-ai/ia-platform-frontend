<template>
  <div class="create-repository__intelligence">
    <div class="create-repository__intelligence__wrapper">
      <UnnnicFormElement
        :label="$t('webapp.create_repository.intelligence_name_label')"
        class="create-intelligence__form-element"
      >
        <UnnnicInput
          :placeholder="
            $t('webapp.create_repository.intelligence_name_placeholder')
          "
          :value="name"
          @input="$emit('update:name', $event)"
          maxlength="64"
        />
      </UnnnicFormElement>

      <UnnnicFormElement
        :label="$t('webapp.create_repository.description_label')"
        class="create-intelligence__form-element"
      >
        <UnnnicInput
          :placeholder="$t('webapp.create_repository.description_placeholder')"
          :value="description"
          @input="$emit('update:description', $event)"
        />
      </UnnnicFormElement>

      <section class="intelligence-types create-intelligence__form-element">
        <UnnnicCard
          clickable
          :title="
            $t(
              'webapp.create_repository.intelligence_type_classification_title',
            )
          "
          :description="
            $t(
              'webapp.create_repository.intelligence_type_classification_description',
            )
          "
          type="content"
          icon="typing-1"
          class="intelligence-types__item"
          :enabled="repository_type === 'classifier'"
          @click.native="$emit('update:repository_type', 'classifier')"
        />

        <UnnnicCard
          clickable
          :title="
            $t('webapp.create_repository.intelligence_type_content_title')
          "
          :description="
            $t('webapp.create_repository.intelligence_type_content_description')
          "
          type="content"
          icon="paginate-filter-text-1"
          class="intelligence-types__item"
          :enabled="repository_type === 'content'"
          @click.native="$emit('update:repository_type', 'content')"
        />
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IntelligenceTab',
  props: {
    name: String,
    description: String,
    repository_type: String,
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.create-intelligence__form-element + .create-intelligence__form-element {
  margin-top: $unnnic-spacing-sm;
}

.intelligence-types {
  display: flex;
  gap: $unnnic-spacing-xs;

  &__item {
    flex: 1;

    ::v-deep .unnnic-card-content__content__title {
      font-weight: $unnnic-font-weight-regular;
    }
  }
}

.create-repository {
  &__intelligence {
    width: 100%;
    // height: 30.625rem;

    &__wrapper {
      .unnnic-input {
        margin-bottom: $unnnic-spacing-stack-md;
      }
    }

    &__type {
      display: flex;
      justify-content: space-between;

      &__label {
        margin-bottom: $unnnic-spacing-stack-nano;
      }

      &__content {
        width: 47%;
      }
    }

    &__buttons {
      display: flex;
      justify-content: space-between;
      margin-top: $unnnic-spacing-stack-lg;

      &__btn {
        width: 47%;
      }
    }
  }
}
.no-show {
  display: none;
}
</style>
