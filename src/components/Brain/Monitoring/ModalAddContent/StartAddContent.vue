<template>
  <section class="add-content">
    <UnnnicIcon
      class="add-content__icon"
      :icon="icon"
      :filled="iconFilled"
      size="xl"
      scheme="neutral-soft"
      data-testid="icon"
    />
    <section class="add-content__infos">
      <UnnnicIntelligenceText
        color="neutral-cloudy"
        family="secondary"
        size="body-gt"
        tag="p"
        data-testid="description"
      >
        {{ description }}
      </UnnnicIntelligenceText>
      <UnnnicIntelligenceText
        class="text-sub-description"
        color="neutral-clean"
        family="secondary"
        size="body-md"
        tag="p"
        data-testid="sub-description"
      >
        {{ subDescription }}
      </UnnnicIntelligenceText>
    </section>

    <UnnnicButton
      class="add-content__trigger"
      type="secondary"
      iconLeft="add"
      data-testid="add-button"
      @click="$emit('add')"
    >
      {{ textAddContent }}
    </UnnnicButton>
  </section>
</template>

<script setup>
const props = defineProps({
  description: {
    type: String,
    default: '',
  },
  subDescription: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: 'text_snippet',
  },
  iconFilled: {
    type: Boolean,
    default: true,
  },
  textAddContent: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['add']);
</script>

<style scoped lang="scss">
.add-content {
  display: grid;
  justify-items: center;
  align-content: center;
  &__icon {
    margin-bottom: $unnnic-spacing-xs;
  }

  &__infos {
    display: grid;
    justify-items: center;
  }

  &__trigger {
    margin-top: $unnnic-spacing-sm;
  }
}
</style>
