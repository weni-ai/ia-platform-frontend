<template>
  <div class="create-repository__intelligence">
    <h1 class="create-repository__intelligence__title">
      {{ $t("webapp.create_repository.intelligence") }}
    </h1>
    <div class="create-repository__intelligence__wrapper">
      <unnnic-input-next
        :label="$t('webapp.create_repository.intelligence_name_label')"
        :placeholder="$t('webapp.create_repository.intelligence_name_placeholder')"
        v-model="intelligence.name"
        maxlength="64"
      />
      <unnnic-input-next
        :label="$t('webapp.create_repository.description_label')"
        :placeholder="$t('webapp.create_repository.description_placeholder')"
        v-model="intelligence.description"
      />

    </div>
  </div>
</template>

<script>
export default {
  name: 'IntelligenceTab',
  data() {
    return {
      intelligence: {
        name: '',
        description: '',
        repository_type: 'content'
      }
    };
  },
  computed: {
    checkHasValue() {
      return this.intelligence.name !== '' && this.intelligence.description !== '';
    }
  },
  watch: {
    'intelligence.description': {
      handler() {
        this.dispatchNextStep()
      },
      deep: true
    },
    'intelligence.name': {
      handler() {
        this.dispatchNextStep()
      },
      deep: true
    },
  },
  methods: {
    dispatchBackModal() {
      this.$emit('backModal');
    },
    dispatchNextStep() {
      this.$emit('nextStep', this.intelligence);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.create-repository {
  &__intelligence {
    width: 100%;
    // height: 30.625rem;

    &__title {
      text-align: center;
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-primary;
      font-size: 1.5rem;
      margin-bottom: 2rem;
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
