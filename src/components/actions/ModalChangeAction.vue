<template>
  <ModalNext
    class="flow-modal create-intelligence-modal"
    maxWidth="604px"
  >
    <article class="flow-modal__container">
      <header class="flow-modal__header">
        <section class="flow-modal__header__title__container">
          <h3>{{ $t('modals.actions.descriptions.change_title') }}</h3>
          <p>{{ $t('modals.actions.descriptions.change_sub_title') }}</p>
        </section>
      </header>
      <main class="flow-modal__body">
        <section class="flow-modal__body_description">
          <UnnnicTextArea
            v-bind="$props"
            :value="description"
            @input="$emit('update:description', $event)"
            :label="$t('modals.actions.descriptions.label')"
          />
        </section>
      </main>
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
          slot="options"
          size="large"
          :loading="editing"
          @click="$emit('edit')"
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
    description: String,
    editing: Boolean,
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
    padding: $unnnic-spacing-xl $unnnic-spacing-md $unnnic-spacing-md
      $unnnic-spacing-md;
  }
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
    margin-bottom: $unnnic-spacing-md;

    &__title {
      &__container {
        h3 {
          font-family: $unnnic-font-family-secondary;
          font-size: $unnnic-font-size-title-sm;
          font-weight: $unnnic-font-weight-black;
          line-height: $unnnic-line-height-md;
          color: $unnnic-color-neutral-darkest;
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
    margin-top: $unnnic-spacing-md;
    gap: $unnnic-spacing-sm;

    button {
      width: 100%;
    }
  }
}
</style>
