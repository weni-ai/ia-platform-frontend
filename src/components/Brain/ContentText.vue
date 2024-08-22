<template>
  <UnnnicSkeletonLoading
    v-if="isLoading"
    tag="div"
    height="100%"
    class="content-text__loading"
  />

  <section
    v-else
    class="content-text__container"
  >
    <header>
      <UnnnicIntelligenceText
        tag="p"
        family="secondary"
        size="body-gt"
        weight="400"
      >
        {{ $t('content_bases.text.description') }}
      </UnnnicIntelligenceText>
    </header>
    <textarea
      id="contentTextArea"
      cols="30"
      rows="22"
      :value="modelValue"
      class="content-text__textarea"
      :placeholder="$t('content_bases.write_content_placeholder')"
      @input="updateModelValue"
    ></textarea>
  </section>
</template>

<script setup>
import { ref, toRefs } from 'vue';

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const { isLoading, modelValue } = toRefs(props);

const updateModelValue = (event) => {
  emit('update:modelValue', event.target.value);
};
</script>

<style lang="scss" scoped>
.content-text__container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;
  padding: 0 $unnnic-spacing-sm $unnnic-spacing-sm $unnnic-spacing-sm;
}

.content-text__loading {
  height: 100%;
}

.content-text__textarea {
  resize: none;
  flex: 1;
  padding: $unnnic-spacing-sm;
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  font-weight: $unnnic-font-weight-regular;
  color: $unnnic-color-neutral-dark;
  border: none;
  border-radius: $unnnic-border-radius-sm;
  outline-style: solid;
  outline-color: $unnnic-color-neutral-cleanest;
  outline-width: $unnnic-border-width-thinner;
  outline-offset: -$unnnic-border-width-thinner;

  &::placeholder {
    color: $unnnic-color-neutral-cleanest;
  }

  &:focus {
    outline-color: $unnnic-color-neutral-clean;
  }

  &::-webkit-scrollbar {
    margin-right: $unnnic-inset-sm;
  }
}
</style>
