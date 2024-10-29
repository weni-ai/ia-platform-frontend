<template>
  <section class="content-text__container">
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

    <BasesFormText
      v-model="modelValue.current"
      useUpdate
      :item="{
        isLoading,
        uuid: store.state.Brain.contentText.uuid,
        oldValue: store.state.Brain.contentText.old,
      }"
      @update:uuid="store.state.Brain.contentText.uuid = $event"
      @update:old-value="store.state.Brain.contentText.old = $event"
    />
  </section>
</template>

<script setup>
import BasesFormText from '@/views/repository/content/BasesFormText.vue';
import { useStore } from 'vuex';

const props = defineProps({
  modelValue: {
    type: Object,
    default() {
      return {};
    },
  },

  isLoading: {
    type: Boolean,
  },
});

const store = useStore();
</script>

<style lang="scss" scoped>
.content-text__container {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: $unnnic-spacing-md;
  height: 100%;
}

.content-text__loading {
  height: 100%;
}
</style>
