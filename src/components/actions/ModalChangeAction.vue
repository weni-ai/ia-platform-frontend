<template>
  <ModalNext
    class="flow-modal create-intelligence-modal"
    maxWidth="604px"
  >
    <article class="flow-modal__container">
      <header class="flow-modal__header">
        <section>
          <UnnnicIntelligenceText
            tag="h3"
            color="neutral-darkest"
            family="secondary"
            size="title-sm"
            weight="black"
          >
            {{ $t('modals.actions.descriptions.change_title') }}
          </UnnnicIntelligenceText>

          <UnnnicIntelligenceText
            v-if="item"
            tag="h4"
            color="neutral-dark"
            family="secondary"
            size="body-gt"
            weight="black"
            marginTop="sm"
          >
            {{ item }}
          </UnnnicIntelligenceText>

          <UnnnicIntelligenceText
            tag="p"
            color="neutral-dark"
            family="secondary"
            size="body-gt"
            marginTop="xs"
          >
            {{ $t('modals.actions.descriptions.change_sub_title') }}
          </UnnnicIntelligenceText>
        </section>
      </header>
      <main class="flow-modal__body">
        <section class="flow-modal__body_description">
          <UnnnicTextArea
            v-bind="$props"
            :modelValue="description"
            :label="$t('modals.actions.descriptions.label')"
            @update:model-value="$emit('update:description', $event)"
          />
        </section>
      </main>
      <footer class="flow-modal__footer">
        <UnnnicButton
          #options
          class="create-repository__container__button"
          type="tertiary"
          @click="$emit('closeModal')"
        >
          {{ $t('modals.actions.btn_cancel') }}
        </UnnnicButton>
        <UnnnicButton
          #options
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
    item: String,
    editing: Boolean,
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.create-intelligence-modal {
  :deep(.create-intelligence-modal__container) {
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
