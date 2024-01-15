<template>
  <div class="create-repository__intelligence">
    <h1 class="create-repository__intelligence__title">
      {{ $t("webapp.create_repository.intelligence") }}
    </h1>
    <div class="create-repository__intelligence__wrapper">
      <unnnic-input-next
        :label="$t('webapp.create_repository.intelligence_name_label')"
        :placeholder="$t('webapp.create_repository.intelligence_name_placeholder')"
        :value="name"
        @input="$emit('update:name', $event)"
        maxlength="64"
      />
      <unnnic-input-next
        :label="$t('webapp.create_repository.description_label')"
        :placeholder="$t('webapp.create_repository.description_placeholder')"
        :value="description"
        @input="$emit('update:description', $event)"
      />

      <section class="intelligence-types">
        <unnnic-card
          clickable
          :title="$t('webapp.create_repository.intelligence_type_classification_title')"
          :description="$t('webapp.create_repository.intelligence_type_classification_description')"
          type="content"
          icon="typing-1"
          class="intelligence-types__item"
          :enabled="repository_type === 'classifier'"
          @click.native="$emit('update:repository_type', 'classifier')"
        />

        <unnnic-card
          clickable
          :title="$t('webapp.create_repository.intelligence_type_content_title')"
          :description="$t('webapp.create_repository.intelligence_type_content_description')"
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
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

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

    &__title {
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-black;
      font-size: $unnnic-font-size-title-sm;
      line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;

      text-align: center;
      margin-block: 0 $unnnic-spacing-sm;
    }

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
.no-show{
  display: none;
}
</style>
