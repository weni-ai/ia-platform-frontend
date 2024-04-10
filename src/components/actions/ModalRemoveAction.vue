<template>
  <ModalNext
    class="flow-modal create-intelligence-modal"
    maxWidth="498px"
  >
    <article class="flow-modal__container">
      <header class="flow-modal__header">
        <section class="flow-modal__header__title__container">
          <UnnnicIcon
            icon="error"
            size="lg"
            scheme="aux-red-500"
          />
          <h3>{{ $t('modals.actions.remove.title') }}</h3>
          <p v-html="$t('modals.actions.remove.description', { name: name })" />
        </section>
      </header>
      <footer class="flow-modal__footer">
        <UnnnicButton
          slot="options"
          class="create-repository__container__button"
          type="tertiary"
          @click="$emit('closeModal')"
        >
          {{ $t('modals.actions.btn_cancel') }}
        </UnnnicButton>
        <UnnnicButton
          class="btn-remove"
          type="warning"
          slot="options"
          size="large"
          :loading="removing"
          @click="$emit('remove')"
        >
          {{ $t('modals.actions.btn_complete') }}
        </UnnnicButton>
      </footer>
    </article>
  </ModalNext>
</template>

<script>
import ModalNext from '../ModalNext.vue';

export default {
  components: {
    ModalNext,
  },
  props: {
    name: String,
    removing: Boolean,
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.create-intelligence-modal {
  ::v-deep .create-intelligence-modal__container {
    padding: $unnnic-spacing-giant $unnnic-spacing-md $unnnic-spacing-md
      $unnnic-spacing-md;
  }
}

.btn-remove {
  background-color: $unnnic-color-aux-red-500;
}

.flow-modal {
  &__container {
    display: flex;
    flex-direction: column;
  }

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: $unnnic-spacing-lg;

    &__title {
      &__container {
        h3 {
          font-family: $unnnic-font-family-secondary;
          font-size: $unnnic-font-size-title-sm;
          font-weight: $unnnic-font-weight-black;
          line-height: $unnnic-line-height-md;
          color: $unnnic-color-neutral-darkest;
          padding: $unnnic-spacing-sm 0 $unnnic-spacing-sm 0;
        }

        p {
          font-family: $unnnic-font-family-secondary;
          font-size: $unnnic-font-size-body-gt;
          font-weight: $unnnic-font-weight-regular;
          line-height: $unnnic-line-height-md;
          color: $unnnic-color-neutral-dark;
        }
      }
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    gap: $unnnic-spacing-sm;

    button {
      width: 100%;
    }
  }
}
</style>
