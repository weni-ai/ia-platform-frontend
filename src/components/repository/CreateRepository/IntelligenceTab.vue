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
          :modelValue="name"
          maxlength="64"
          @update:model-value="$emit('update:name', $event)"
        />
      </UnnnicFormElement>

      <UnnnicFormElement
        :label="$t('webapp.create_repository.description_label')"
        class="create-intelligence__form-element"
      >
        <UnnnicTextArea
          data-test="description-textarea"
          :placeholder="$t('webapp.create_repository.description_placeholder')"
          :modelValue="description"
          @update:model-value="$emit('update:description', $event)"
        />
      </UnnnicFormElement>

      <UnnnicFormElement
        :label="$t('webapp.create_repository.intelligence_type')"
        class="create-intelligence__form-element"
      >
        <section class="intelligence-types">
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
            :enabled="repositoryType === 'classifier'"
            @click="$emit('update:repositoryType', 'classifier')"
          />

          <UnnnicCard
            clickable
            :title="
              $t('webapp.create_repository.intelligence_type_content_title')
            "
            :description="
              $t(
                'webapp.create_repository.intelligence_type_content_description',
              )
            "
            type="content"
            icon="paginate-filter-text-1"
            class="intelligence-types__item"
            :enabled="repositoryType === 'content'"
            @click="$emit('update:repositoryType', 'content')"
          />
        </section>
      </UnnnicFormElement>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IntelligenceTab',
  props: {
    name: {
      type: String,
      required: false,
      default: '',
    },
    description: {
      type: String,
      required: false,
      default: '',
    },
    repositoryType: {
      type: String,
      required: false,
      default: '',
    },
  },
  emits: ['update:name', 'update:description', 'update:repositoryType'],
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.create-intelligence__form-element + .create-intelligence__form-element {
  margin-top: $unnnic-spacing-sm;
}

.intelligence-types {
  display: flex;
  gap: $unnnic-spacing-sm;

  &__item {
    flex: 1;

    :deep(.unnnic-card-content__content__title) {
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
