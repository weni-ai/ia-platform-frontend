<template>
  <UnnnicModal
    showModal
    :closeIcon="false"
    class="flow-modal"
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
          <UnnnicFormElement :label="$t('modals.actions.descriptions.label')">
            <UnnnicTextArea
              v-bind="$props"
              :modelValue="description"
              @update:model-value="$emit('update:description', $event)"
            />
          </UnnnicFormElement>
        </section>
      </main>
    </article>

    <template #options>
      <UnnnicButton
        class="create-repository__container__button"
        type="tertiary"
        @click="$emit('closeModal')"
      >
        {{ $t('modals.actions.btn_cancel') }}
      </UnnnicButton>
      <UnnnicButton
        size="large"
        :loading="editing"
        @click="$emit('edit')"
      >
        {{ $t('modals.actions.btn_complete') }}
      </UnnnicButton>
    </template>
  </UnnnicModal>
</template>

<script>
export default {
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
.flow-modal {
  :deep(.unnnic-modal-container-background) {
    width: 100%;
    max-width: 37.75 * $unnnic-font-size;
  }

  :deep(.unnnic-modal-container-background-body-description-container) {
    padding-bottom: 0;
  }

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

  &__body {
    text-align: left;
  }
}
</style>
